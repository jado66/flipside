"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
import { useUserReferralData } from "@/hooks/use-user-referral-data";
import { useUser } from "@/contexts/user-provider";
import { supabase } from "@/utils/supabase/client";
import { useMasterCategories } from "@/hooks/use-categories";
import { useUserProgress } from "@/contexts/user-progress-provider";
import { InstallPWAApp } from "../install-pwa-app";

export function UserDashboard() {
  const { celebrate } = useConfetti();
  const { userCanDoTricks, markTrickAsLearned, refreshProgress } =
    useUserProgress();

  // Use existing hooks for data fetching
  const { categories, loading: categoriesLoading } = useMasterCategories();
  const [allTricks, setAllTricks] = useState<Trick[]>([]);
  const [tricksLoading, setTricksLoading] = useState(true);

  // Add refs to track component lifecycle and prevent stale queries
  const isMounted = useRef(true);
  const fetchController = useRef<AbortController | null>(null);

  const [userSportsIds, setUserSportsIds] = useState<string[]>([]);
  const [draftSportsIds, setDraftSportsIds] = useState<string[]>([]);
  const [selectingSports, setSelectingSports] = useState(false);

  const { user, updateUser, isLoading: authLoading } = useUser();

  // Referral data
  const { data: referralData, loading: referralLoading } =
    useUserReferralData();

  // Fetch all tricks with proper cleanup and error handling
  useEffect(() => {
    let isActive = true;

    const fetchTricks = async () => {
      if (!supabase) {
        console.error("Supabase client not initialized");
        setTricksLoading(false);
        return;
      }

      // Cancel any existing fetch
      if (fetchController.current) {
        fetchController.current.abort();
      }

      // Create new abort controller for this fetch
      fetchController.current = new AbortController();

      try {
        setTricksLoading(true);

        // Add timeout to prevent indefinite hanging
        const timeoutId = setTimeout(() => {
          if (fetchController.current) {
            fetchController.current.abort();
          }
        }, 10000); // 10 second timeout

        const tricks = await getAllTricksBasic(fetchController.current.signal);

        clearTimeout(timeoutId);

        // Only update state if component is still mounted and this fetch wasn't cancelled
        if (isActive && isMounted.current) {
          setAllTricks(tricks);
        }
      } catch (error: any) {
        // Don't log abort errors
        if (error?.name !== "AbortError") {
          console.error("Failed to fetch tricks:", error);
        }

        if (isActive && isMounted.current) {
          setAllTricks([]);
        }
      } finally {
        if (isActive && isMounted.current) {
          setTricksLoading(false);
        }
      }
    };

    fetchTricks();

    // Cleanup function
    return () => {
      isActive = false;
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
  }, []); // Empty dependency array - only fetch once on mount

  // Track component lifecycle
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle page visibility changes to refresh stale data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isMounted.current) {
        // Page became visible again
        // If tricks haven't loaded yet and we're still loading, retry
        if (tricksLoading && allTricks.length === 0) {
          console.log("Page visible again, retrying fetch...");

          // Cancel existing fetch and retry
          if (fetchController.current) {
            fetchController.current.abort();
          }

          // Small delay to ensure clean state
          setTimeout(() => {
            if (isMounted.current) {
              window.location.reload(); // Nuclear option but reliable
            }
          }, 100);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tricksLoading, allTricks.length]);

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
              <InstallPWAApp />
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

/**
 * Get all published tricks with basic info
 * @param signal - AbortController signal for cancellation
 */
export async function getAllTricksBasic(
  signal?: AbortSignal
): Promise<Trick[]> {
  try {
    // Create a promise that rejects on abort
    const abortPromise = new Promise<never>((_, reject) => {
      signal?.addEventListener("abort", () => {
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    // Race between the actual query and the abort
    const queryPromise = supabase
      .from("tricks")
      .select(
        `
          id,
          name,
          slug,
          description,
          difficulty_level,
          prerequisite_ids,
          subcategory:subcategories(
            id,
            name,
            slug,
            master_category:master_categories(
              id,
              name,
              slug
            )
          )
        `
      )
      .eq("is_published", true)
      .order("name", { ascending: true });

    const result = await Promise.race([queryPromise, abortPromise]);

    const { data: tricks, error } = result as any;

    if (error) throw error;

    return tricks || [];
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.log("Fetch aborted");
    } else {
      console.error("Error fetching tricks:", error);
    }
    return [];
  }
}
