"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/supabase-client";
import { useStableUser } from "@/hooks/use-stable-user";
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

export function UserDashboard() {
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

  const { user } = useStableUser(async (userId) => {
    await loadData(userId);
  }, []);

  const loadData = useCallback(async (userId?: string | null) => {
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
        // user profile
        const {
          data: userProfile,
          error: userError,
          status: userStatus,
        } = await supabase
          .from("users")
          .select("users_sports_ids")
          .eq("id", userId)
          .maybeSingle();
        if (userError) {
          console.error("Error fetching user profile", userError);
          throw userError;
        }
        if (!userProfile) {
          console.warn(
            "No user profile row found for id",
            userId,
            "status=",
            userStatus
          );
          setUserSportsIds([]);
        } else {
          setUserSportsIds(userProfile.users_sports_ids || []);
        }
        // Defensive duplicate check (should not happen with maybeSingle but logs in case view causes duplicates)
        try {
          const { data: duplicateCheck } = await supabase
            .from("users")
            .select("id")
            .eq("id", userId);
          if (duplicateCheck && duplicateCheck.length > 1) {
            console.warn(
              "Duplicate user rows detected for id",
              userId,
              "count=",
              duplicateCheck.length
            );
          }
        } catch (dupErr) {
          console.warn("Duplicate check failed", dupErr);
        }
        // If user has no sports yet, enter selection mode and stay there through first picks
        if (
          !userProfile?.users_sports_ids ||
          userProfile.users_sports_ids.length === 0
        ) {
          setSelectingSports(true);
        }

        // user tricks
        const { data: userTricksData, error: userTricksError } = await supabase
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
        setSelectingSports(true);
        calculateProgress(categoriesData || [], tricksData || [], []);
      }
    } catch (e) {
      console.error("Failed loading dashboard data", e);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

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
    // If user unchanged and just closing, still update base selection state
    const newSportsIds = draftSportsIds;
    if (user) {
      try {
        // Use upsert to handle both new and existing users
        const { data, error } = await supabase
          .from("users")
          .upsert(
            {
              id: user.id,
              email: user.email || "",
              users_sports_ids: newSportsIds,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          )
          .select()
          .single();

        if (error) {
          console.error("Error saving sports selection:", error);
          throw error;
        }

        console.log("Sports saved successfully:", data);
        setUserSportsIds(newSportsIds);
        toast.success("Sports selection saved");
      } catch (e) {
        console.error("Failed saving sports selection:", e);
        toast.error("Failed saving sports selection");
        return; // keep user in selection mode so they can retry
      }
    } else {
      // Not logged in: just move base state so UI reflects selections locally
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

  const showSportsSelection =
    (userSportsIds.length === 0 && !loading) || selectingSports;

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
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            <NextTricksSuggestions
              maxSuggestions={6}
              allTricks={allTricks}
              userCanDoTricks={userCanDoTricks}
              userSportsIds={userSportsIds}
              loading={loading}
              onMarkLearned={handleMarkLearned}
              onManageSports={() => setSelectingSports(true)}
            />
          </div>
          <div className="lg:col-span-1">
            <UserProgressOverview
              categoryProgress={categoryProgress}
              totalStats={totalStats}
              loading={loading}
            />
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
