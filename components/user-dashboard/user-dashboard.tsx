"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { SportsSelection } from "./sports-selection";
import { NextTricksSuggestions } from "./new-trick-suggestions";
import { UserProgressOverview } from "./user-progress-overview";
import type { Trick } from "@/types/trick";
import type { MasterCategory } from "../skill-tree.types";
import {
  CategoryProgress,
  TotalStats,
  TrickWithProgress,
} from "./user-dashboard.types";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Plus, Settings } from "lucide-react";
import { Wishlist } from "../wishlist";
import { FeaturePoll } from "../feature-poll";
import { useSupabase } from "@/utils/supabase/use-supabase";
import { useConfetti } from "@/contexts/confetti-provider";

export function UserDashboard() {
  const supabase = useSupabase();
  const { celebrate } = useConfetti();

  const [dataLoading, setDataLoading] = useState(true);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [allTricks, setAllTricks] = useState<Trick[]>([]);
  const [userSportsIds, setUserSportsIds] = useState<string[]>([]);
  const [draftSportsIds, setDraftSportsIds] = useState<string[]>([]);
  const [userCanDoTricks, setUserCanDoTricks] = useState<Set<string>>(
    new Set()
  );
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>(
    []
  );
  const [totalStats, setTotalStats] = useState<TotalStats>({
    totalTricks: 0,
    completedTricks: 0,
    percentage: 0,
    recentlyCompleted: 0,
  });
  const [selectingSports, setSelectingSports] = useState(false);
  const [publicUserLoaded, setPublicUserLoaded] = useState(false);

  const {
    user,
    publicUser,
    updatePublicUser,
    refreshUser,
    loading: authLoading,
  } = useAuth();

  // Determine if we're still in initial loading state
  const isInitialLoading =
    authLoading || (user && !publicUserLoaded) || dataLoading;

  // Load data when user changes
  useEffect(() => {
    if (!supabase) return;

    // Don't load data until auth is resolved
    if (authLoading) return;

    if (user) {
      loadData(user.id);
    } else {
      // Anonymous user
      loadData(null);
    }
  }, [user?.id, authLoading, supabase]);

  // Update sports when publicUser data becomes available
  useEffect(() => {
    if (!supabase) return;

    // Only process if we have a user and auth is not loading
    if (user && publicUser && !authLoading) {
      console.log(
        "Setting sports from publicUser:",
        publicUser.users_sports_ids
      );
      const sports = publicUser.users_sports_ids || [];
      setUserSportsIds(sports);
      setDraftSportsIds(sports);
      setPublicUserLoaded(true);

      // Only auto-show sports selection if user has no sports and isn't already selecting
      if (sports.length === 0 && !selectingSports) {
        setSelectingSports(true);
      }
    } else if (!user && !authLoading) {
      // No user logged in
      setPublicUserLoaded(true);
    }
  }, [publicUser, user, authLoading, supabase]);

  const loadData = useCallback(
    async (userId?: string | null) => {
      try {
        setDataLoading(true);

        // Load categories
        const { data: categoriesData, error: catError } = await supabase
          .from("master_categories")
          .select("id, name, slug, color, icon_name")
          .eq("is_active", true)
          .order("sort_order");
        if (catError) {
          console.error("Error fetching categories", catError);
          throw catError;
        }
        setCategories(categoriesData || []);

        // Load tricks
        const { data: tricksData, error: tricksError } = await supabase
          .from("tricks")
          .select(
            `
            id,
            name,
            slug,
            description,
            prerequisite_ids,
            difficulty_level,
            tags,
            subcategory:subcategories!inner(
              id,
              name,
              slug,
              master_category:master_categories!inner(
                id,
                name,
                slug,
                color
              )
            )
          `
          )
          .eq("is_published", true)
          .order("difficulty_level", { ascending: true, nullsFirst: true });
        if (tricksError) {
          console.error("Error fetching tricks", tricksError);
          throw tricksError;
        }
        // @ts-expect-error todo fix me
        setAllTricks(tricksData || []);

        if (userId) {
          // Load user tricks
          const { data: userTricksData, error: userTricksError } =
            await supabase
              .from("user_tricks")
              .select("trick_id, achieved_at")
              .eq("user_id", userId)
              .eq("can_do", true);
          if (userTricksError) {
            console.error("Error fetching user tricks", userTricksError);
            throw userTricksError;
          }
          setUserCanDoTricks(
            new Set(userTricksData?.map((r) => r.trick_id) || [])
          );

          // Calculate progress
          calculateProgress(
            categoriesData || [],
            tricksData || [],
            userTricksData || []
          );
        } else {
          // Anonymous user
          calculateProgress(categoriesData || [], tricksData || [], []);
        }
      } catch (e) {
        console.error("Failed loading dashboard data", e);
        toast.error("Failed to load dashboard data");
      } finally {
        setDataLoading(false);
      }
    },
    [supabase]
  );

  const calculateProgress = (
    categoriesData: any[],
    tricksData: any[],
    userTricksData: any[]
  ) => {
    const categoryMap = new Map<string, CategoryProgress>();
    let totalTricksCount = 0;
    let completedTricksCount = 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const tricksByCategoryId = new Map<string, Trick[]>();
    (tricksData || []).forEach((trick: any) => {
      const categoryId = trick.subcategory?.master_category?.id;
      if (!categoryId) return;
      if (!tricksByCategoryId.has(categoryId))
        tricksByCategoryId.set(categoryId, []);
      tricksByCategoryId.get(categoryId)!.push(trick);
    });

    categoriesData.forEach((cat: any) => {
      const total = tricksByCategoryId.get(cat.id)?.length || 0;
      totalTricksCount += total;
      categoryMap.set(cat.id, {
        category: cat,
        completed: 0,
        total,
        percentage: 0,
        recentlyCompleted: 0,
      });
    });

    userTricksData.forEach((ut: any) => {
      completedTricksCount++;
      const trick = tricksData.find((t: any) => t.id === ut.trick_id);
      const categoryId = trick?.subcategory?.master_category?.id;
      if (categoryId && categoryMap.has(categoryId)) {
        const progress = categoryMap.get(categoryId)!;
        progress.completed++;
        if (ut.achieved_at && new Date(ut.achieved_at) > oneWeekAgo) {
          progress.recentlyCompleted++;
        }
      }
    });

    const progressArray: CategoryProgress[] = [];
    let recentTotal = 0;
    categoryMap.forEach((p) => {
      p.percentage = p.total ? Math.round((p.completed / p.total) * 100) : 0;
      recentTotal += p.recentlyCompleted;
      progressArray.push(p);
    });

    progressArray.sort((a, b) => b.percentage - a.percentage);

    setCategoryProgress(progressArray);
    setTotalStats({
      totalTricks: totalTricksCount,
      completedTricks: completedTricksCount,
      percentage: totalTricksCount
        ? Math.round((completedTricksCount / totalTricksCount) * 100)
        : 0,
      recentlyCompleted: recentTotal,
    });
  };

  const toggleDraftSport = (categoryId: string) => {
    setDraftSportsIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFinishSportsSelection = async () => {
    const newSportsIds = draftSportsIds;

    if (user) {
      try {
        await updatePublicUser({
          users_sports_ids: newSportsIds,
        });

        setUserSportsIds(newSportsIds);
        toast.success("Sports selection saved");
      } catch (e) {
        console.error("Failed saving sports selection:", e);
        toast.error("Failed to save sports selection");
        return;
      }
    } else {
      toast("Login to save your selections and track progress");
      setUserSportsIds(newSportsIds);
    }

    setSelectingSports(false);
  };

  const handleMarkLearned = async (trickId: string) => {
    if (!user) {
      toast.error("Login required");
      return;
    }

    if (userCanDoTricks.has(trickId)) return;

    const optimistic = new Set(userCanDoTricks);
    optimistic.add(trickId);
    setUserCanDoTricks(optimistic);

    try {
      const { error } = await supabase.from("user_tricks").upsert({
        user_id: user.id,
        trick_id: trickId,
        can_do: true,
        achieved_at: new Date().toISOString(),
      });

      if (error) throw error;

      const userTricksData = Array.from(optimistic).map((tid) => ({
        trick_id: tid,
        achieved_at: new Date().toISOString(),
      }));

      calculateProgress(categories, allTricks as any, userTricksData);
      toast.success("Trick marked as learned");
      celebrate();
    } catch (e) {
      toast.error("Failed to update trick");
      const reverted = new Set(optimistic);
      reverted.delete(trickId);
      setUserCanDoTricks(reverted);
    }
  };

  // Keep draft in sync when entering selection mode
  useEffect(() => {
    if (selectingSports) {
      setDraftSportsIds(userSportsIds);
    }
  }, [selectingSports, userSportsIds]);

  // Show loading while we're waiting for all necessary data
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">
                Loading your dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show sports selection if user is actively selecting
  if (selectingSports) {
    return (
      <div className="space-y-6">
        <SportsSelection
          categories={categories}
          userSportsIds={draftSportsIds}
          onToggleSport={toggleDraftSport}
          onFinish={handleFinishSportsSelection}
        />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="space-y-6">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 relative">
          <div className="mb-8">
            <h1 className="lg:text-4xl text-xl font-bold text-balance mb-2">
              Welcome Back{" "}
              {publicUser?.first_name ||
                (publicUser?.email
                  ? publicUser.email.charAt(0).toUpperCase() +
                    publicUser.email.slice(1)
                  : "")}
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Track your progress and discover new tricks to master
            </p>
          </div>

          <div className="flex items-center justify-between lg:absolute lg:top-10 lg:right-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDraftSportsIds(userSportsIds);
                setSelectingSports(true);
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Sports
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <UserProgressOverview
                categoryProgress={categoryProgress}
                userSportsIds={userSportsIds}
                loading={false}
              />
              <NextTricksSuggestions
                maxSuggestions={6}
                allTricks={allTricks}
                userCanDoTricks={userCanDoTricks}
                userSportsIds={userSportsIds}
                loading={false}
                onMarkLearned={handleMarkLearned}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Wishlist />
              <FeaturePoll />
            </div>
          </div>
        </div>
      </div>

      {!user && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Login to save your progress.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
