"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { SportsSelection } from "./sports-selection";
import { NextTricksSuggestions } from "./new-trick-suggestions";
import { UserProgressOverview } from "./user-progress-overview";
import type { Trick } from "@/types/trick";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Settings, Users, Copy } from "lucide-react";
import { Wishlist } from "../wishlist";
import { FeaturePoll } from "../feature-poll";
import { MiniContributeCTA } from "@/components/xp";
import { useConfetti } from "@/contexts/confetti-provider";
import { generateReferralLink } from "@/lib/referral-utils";
import { useUserReferralData } from "@/hooks/use-user-referral-data";
import { useUser } from "@/contexts/user-provider";
import { supabase } from "@/utils/supabase/client";
import { useMasterCategories } from "@/hooks/use-categories";
import { useUserProgress } from "@/contexts/user-progress-provider";
import { getAllTricksBasic } from "@/lib/client/tricks-data-client";

export function UserDashboard() {
  const { celebrate } = useConfetti();
  const { userCanDoTricks, markTrickAsLearned, refreshProgress } =
    useUserProgress();

  // Use existing hooks for data fetching
  const { categories, loading: categoriesLoading } = useMasterCategories();
  const [allTricks, setAllTricks] = useState<Trick[]>([]);
  const [tricksLoading, setTricksLoading] = useState(true);

  const [userSportsIds, setUserSportsIds] = useState<string[]>([]);
  const [draftSportsIds, setDraftSportsIds] = useState<string[]>([]);
  const [selectingSports, setSelectingSports] = useState(false);

  const { user, updateUser, isLoading: authLoading } = useUser();

  // Referral data
  const { data: referralData, loading: referralLoading } =
    useUserReferralData();

  // Fetch all tricks only - user tricks come from context
  useEffect(() => {
    let isMounted = true;

    const fetchTricks = async () => {
      if (!supabase) return;

      try {
        setTricksLoading(true);
        const tricks = await getAllTricksBasic(supabase);

        if (isMounted) {
          setAllTricks(tricks);
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
  }, []);

  // Update sports when user data becomes available
  useEffect(() => {
    if (!supabase) return;

    // Only process if we have a user and auth is not loading
    if (user && !authLoading) {
      const sports = user.users_sports_ids || [];
      setUserSportsIds(sports);
      setDraftSportsIds(sports);

      // Only auto-show sports selection if user has no sports and isn't already selecting
      if (sports.length === 0 && !selectingSports) {
        setSelectingSports(true);
      }
    }
  }, [user, authLoading]);

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

        // Refresh progress stats after updating sports
        await refreshProgress();
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
    // Find the trick to get its category for optimistic update
    const trick = allTricks.find((t) => t.id === trickId);
    const categorySlug = trick?.subcategory?.master_category?.slug;

    const success = await markTrickAsLearned(trickId, categorySlug);

    if (success) {
      toast.success("Trick marked as learned");
      celebrate();
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
              <UserProgressOverview />
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
              <MiniContributeCTA variant="dashboard" />
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
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="font-semibold text-primary">
                          + 50-100 XP
                        </div>
                        <div className="text-muted-foreground">
                          Add &amp; Edit Tricks
                        </div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <div className="font-semibold text-primary">
                          + 200 XP
                        </div>
                        <div className="text-muted-foreground">Referrals</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2 justify-between text-xs">
                        <div className="bg-background border border-border p-2 rounded-lg text-center flex-1">
                          <div className="font-bold text-primary">
                            {user.xp || 0}
                          </div>
                          <div className="text-muted-foreground">Total XP</div>
                        </div>
                        <div className="bg-background border border-border p-2 rounded-lg text-center flex-1">
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
