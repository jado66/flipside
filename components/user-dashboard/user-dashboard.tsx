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
import { useSupabase } from "@/utils/supabase/useSupabase";

export function UserDashboard() {
  const supabase = useSupabase();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [allTricks, setAllTricks] = useState<Trick[]>([]);
  const [userSportsIds, setUserSportsIds] = useState<string[]>([]);
  // Draft selection while user is in sports selection mode (batch update on continue)
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
  // Remain in selection mode until user explicitly continues
  const [selectingSports, setSelectingSports] = useState(false);
  // Track when we've loaded and applied initial sports so we don't flash selection UI
  const [sportsInitialized, setSportsInitialized] = useState(false);

  const { user, publicUser, updatePublicUser, refreshUser } = useAuth();

  // Load data when user changes
  useEffect(() => {
    if (!supabase) {
      // console.error("Supabase client not initialized");
      return;
    }

    if (user) {
      loadData(user.id);
    } else {
      loadData(null);
    }
  }, [user?.id, supabase]);

  // Update sports when publicUser data becomes available
  useEffect(() => {
    if (!supabase) {
      // console.error("Supabase client not initialized");
      return;
    }

    if (publicUser && user) {
      console.log("Public user data loaded:", publicUser.users_sports_ids);
      setUserSportsIds(publicUser.users_sports_ids || []);

      // If user has no sports yet, enter selection mode
      if (
        !publicUser.users_sports_ids ||
        publicUser.users_sports_ids.length === 0
      ) {
        setSelectingSports(true);
      } else {
        // User has sports, exit selection mode if we're in it
        setSelectingSports(false);
      }
      // Mark initialization complete after first processing of public user
      setSportsInitialized(true);
    }
  }, [publicUser?.users_sports_ids, user?.id, supabase]);

  const loadData = useCallback(
    async (userId?: string | null) => {
      try {
        setLoading(true);
        // categories
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

        // tricks
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
        // @ts-expect-error complex nested type
        setAllTricks(tricksData || []);

        if (userId) {
          // Sports data will be handled by the separate useEffect for publicUser

          // user tricks
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

          // progress calculation
          calculateProgress(
            categoriesData || [],
            tricksData || [],
            userTricksData || []
          );
        } else {
          // Anonymous user: still compute base progress (all zeros) and allow selecting sports.
          // Do not force selection immediately; only show after initialized check below
          setSelectingSports(false);
          calculateProgress(categoriesData || [], tricksData || [], []);
        }
      } catch (e) {
        console.error("Failed loading dashboard data", e);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
        // For anonymous user we still want to mark sports initialized once data load completes
        if (!userId) setSportsInitialized(true);
      }
    },
    [publicUser]
  );

  const calculateProgress = (
    categoriesData: any[],
    tricksData: any[],
    userTricksData: any[]
  ) => {
    // map categories to trick totals
    const categoryMap = new Map<string, CategoryProgress>();
    let totalTricksCount = 0;
    let completedTricksCount = 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Build category -> all tricks list
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
      // find trick category
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

  // Local draft toggling (no network calls per click)
  const toggleDraftSport = (categoryId: string) => {
    setDraftSportsIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Commit draft selections in one batch update
  const handleFinishSportsSelection = async () => {
    console.log("Starting sports selection save...");
    const newSportsIds = draftSportsIds;
    console.log("New sports IDs:", newSportsIds);

    if (user) {
      try {
        console.log("Updating sports selection:", newSportsIds);

        if (!updatePublicUser) {
          throw new Error("Update function not available");
        }

        // Use the auth context method to update user sports
        await updatePublicUser({
          users_sports_ids: newSportsIds,
        });

        console.log("Update completed, refreshing user data...");

        // Refresh user data to get updated sports
        await refreshUser();

        setUserSportsIds(newSportsIds);
        toast.success("Sports selection saved");
        console.log("Sports saved successfully");
      } catch (e) {
        console.error("Failed saving sports selection:", e);
        toast.error("Failed to save sports selection");
        return; // keep user in selection mode so they can retry
      }
    } else {
      // Not logged in: just move base state so UI reflects selections locally
      toast("Login to save your selections and track progress");
      setUserSportsIds(newSportsIds);
    }
    console.log("Exiting sports selection mode");
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
      // recalc progress with new user trick record
      const userTricksData = Array.from(optimistic).map((tid) => ({
        trick_id: tid,
      }));
      calculateProgress(categories, allTricks as any, userTricksData);
      toast.success("Trick marked as learned");
    } catch (e) {
      toast.error("Failed to update trick");
      const reverted = new Set(optimistic);
      reverted.delete(trickId);
      setUserCanDoTricks(reverted);
    }
  };

  // Show only if user intentionally managing sports OR after initialization we know there are none
  const showSportsSelection =
    selectingSports || (sportsInitialized && userSportsIds.length === 0);

  // Keep draft in sync when entering selection mode or when base list changes while not selecting
  useEffect(() => {
    if (selectingSports) {
      setDraftSportsIds(userSportsIds);
    }
  }, [selectingSports, userSportsIds]);

  return (
    <div className="space-y-6">
      {showSportsSelection ? (
        <SportsSelection
          categories={categories}
          userSportsIds={draftSportsIds}
          onToggleSport={toggleDraftSport}
          onFinish={handleFinishSportsSelection}
        />
      ) : (
        <div className="min-h-screen bg-background ">
          <div className="container mx-auto px-4  relative">
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
                onClick={() => setSelectingSports(true)}
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
                  // totalStats={totalStats}
                  userSportsIds={userSportsIds}
                  loading={loading}
                />
                <NextTricksSuggestions
                  maxSuggestions={6}
                  allTricks={allTricks}
                  userCanDoTricks={userCanDoTricks}
                  userSportsIds={userSportsIds}
                  loading={loading}
                  onMarkLearned={handleMarkLearned}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* <PrerequisiteGaps gaps={prerequisiteGaps} /> */}
                <Wishlist />
                <FeaturePoll />
              </div>
            </div>
          </div>
        </div>
      )}
      {!user && !loading && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Login to save your progress.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// <div className="space-y-6">
//   {/* Header with Manage Sports */}
//   <div className="flex items-center justify-between mb-2">
//     <h2 className="text-lg font-semibold tracking-tight ">
//       Welcome back{" "}
//       {publicUser?.first_name ||
//         (publicUser?.email
//           ? publicUser.email.charAt(0).toUpperCase() + publicUser.email.slice(1)
//           : "")}
//       ! You should work on the following tricks:
//     </h2>
//     <Button
//       variant="outline"
//       size="sm"
//       onClick={() => setSelectingSports(true)}
//     >
//       <Settings className="h-4 w-4 mr-2" />
//       Manage Sports
//     </Button>
//   </div>
//   {/* Main content grid */}
//   <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
//     <div className="space-y-6">

//     </div>
//     <div className="lg:min-w-[350px] w-full">
//       {/* progress sidebar */}
//
//     </div>
//   </div>
// </div>;
