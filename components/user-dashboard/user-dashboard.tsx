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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Plus, Settings, Users, Copy } from "lucide-react";
import { Input } from "../ui/input";
import { Wishlist } from "../wishlist";
import { FeaturePoll } from "../feature-poll";
import { useConfetti } from "@/contexts/confetti-provider";
import ReferralDashboard from "@/components/referral-dashboard";
import { generateReferralLink } from "@/lib/referral-utils";
import { useUserReferralData } from "@/hooks/use-user-referral-data";
import { useUser } from "@/contexts/user-provider";
import { supabase } from "@/utils/supabase/client";
import { useMasterCategories } from "@/hooks/use-categories";
import { getAllTricks } from "@/lib/client/tricks-data-client";

export function UserDashboard() {
  const { celebrate } = useConfetti();

  // Use existing hooks for data fetching
  const { categories, loading: categoriesLoading } = useMasterCategories();
  const [allTricks, setAllTricks] = useState<Trick[]>([]);
  const [tricksLoading, setTricksLoading] = useState(true);

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

  const { user, updateUser, refreshUser, isLoading: authLoading } = useUser();

  // Referral data
  const { data: referralData, loading: referralLoading } =
    useUserReferralData();

  // Fetch all tricks
  useEffect(() => {
    let isMounted = true;

    const fetchTricks = async () => {
      if (!supabase) return;

      try {
        setTricksLoading(true);
        const { data: tricks, error } = await supabase
          .from("tricks")
          .select(
            `  id,   name,   slug,   difficulty,  subcategory:subcategories(    id,    name,    slug,    master_category:master_categories(      id,      name,      slug    )  )`
          )
          .eq("is_published", true)
          .order("name", { ascending: true });

        if (isMounted) {
          setAllTricks(tricks || []);
        }
      } catch (error) {
        console.error("Failed to fetch tricks:", error);
        if (isMounted) {
          setAllTricks([]);
        }
      } finally {
        if (isMounted) {
          setTricksLoading(false);
        }
      }
    };

    fetchTricks();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Fetch user's completed tricks
  useEffect(() => {
    let isMounted = true;

    const fetchUserTricks = async () => {
      if (!user || !supabase) {
        setUserCanDoTricks(new Set());
        return;
      }

      try {
        const { data: userTricks, error } = await supabase
          .from("user_tricks")
          .select("trick_id, achieved_at")
          .eq("user_id", user.id)
          .eq("can_do", true);

        if (error) throw error;

        if (isMounted) {
          const trickIds = new Set(userTricks?.map((ut) => ut.trick_id) || []);
          setUserCanDoTricks(trickIds);

          // Calculate progress with fresh data
          if (categories.length > 0 && allTricks.length > 0) {
            calculateProgress(categories, allTricks, userTricks || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user tricks:", error);
        if (isMounted) {
          setUserCanDoTricks(new Set());
        }
      }
    };

    fetchUserTricks();

    return () => {
      isMounted = false;
    };
  }, [user, supabase, categories, allTricks]);

  // Update sports when publicUser data becomes available
  useEffect(() => {
    if (!supabase) return;

    // Only process if we have a user and auth is not loading
    if (user && !authLoading) {
      console.log("Setting sports from publicUser:", user.users_sports_ids);
      const sports = user.users_sports_ids || [];
      setUserSportsIds(sports);
      setDraftSportsIds(sports);

      // Only auto-show sports selection if user has no sports and isn't already selecting
      if (sports.length === 0 && !selectingSports) {
        setSelectingSports(true);
      }
    }
  }, [user, authLoading, supabase]);

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
        await updateUser({
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
      } as any);

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
  const isLoading = authLoading || categoriesLoading || tricksLoading;

  if (isLoading) {
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
              {user?.first_name ||
                (user?.email
                  ? user.email.charAt(0).toUpperCase() + user.email.slice(1)
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
                loading={isLoading}
              />
              <NextTricksSuggestions
                maxSuggestions={6}
                allTricks={allTricks}
                userCanDoTricks={userCanDoTricks}
                userSportsIds={userSportsIds}
                loading={isLoading}
                onMarkLearned={handleMarkLearned}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Wishlist />
              <FeaturePoll />
              {user && user?.email && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-4 w-4" />
                      Help Build Trickipedia
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Earn XP and level up by contributing to the community
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Every contribution earns you XP towards your next level.
                      Help grow our trick database and unlock rewards!
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="font-semibold text-primary">
                          50-100 XP
                        </div>
                        <div className="text-muted-foreground">
                          Add New Tricks
                        </div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="font-semibold text-primary">200 XP</div>
                        <div className="text-muted-foreground">Referrals</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            generateReferralLink(user.email)
                          );
                          toast.success(
                            "Referral link copied to clipboard. Now go and send it to a friend!"
                          );
                        }}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Referral Link
                      </Button>

                      <div className="flex gap-2 justify-between text-xs">
                        <div className="bg-muted p-2 rounded-lg text-center flex-1">
                          <div className="font-bold text-primary">
                            {user.xp || 0}
                          </div>
                          <div className="text-muted-foreground">Total XP</div>
                        </div>
                        <div className="bg-muted p-2 rounded-lg text-center flex-1">
                          <div className="font-bold text-primary">
                            {referralData?.referrals || 0}
                          </div>
                          <div className="text-muted-foreground">Referrals</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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
