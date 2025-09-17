"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowRight,
  Target,
  Plus,
  Dumbbell,
  Activity,
  Music,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { Trick } from "@/types/trick";
import { TrickWithProgress } from "./user-dashboard.types";

interface NextTricksSuggestionsProps {
  maxSuggestions?: number;
  allTricks: Trick[];
  userCanDoTricks: Set<string>;
  userSportsIds: string[];
  onMarkLearned: (trickId: string) => Promise<void> | void; // callback to parent
  onManageSports: () => void;
  loading?: boolean;
}

// Icon mapping for categories (add more as needed)
const getCategoryIcon = (iconName?: string) => {
  const iconMap: Record<string, any> = {
    dumbbell: Dumbbell,
    activity: Activity,
    music: Music,
    sparkles: Sparkles,
  };
  const Icon = iconName ? iconMap[iconName.toLowerCase()] : Activity;
  return Icon || Activity;
};

export function NextTricksSuggestions({
  maxSuggestions = 6,
  allTricks,
  userCanDoTricks,
  userSportsIds,
  onMarkLearned,
  onManageSports,
  loading = false,
}: NextTricksSuggestionsProps) {
  // Calculate suggested tricks based on user progress and selected sports
  const calculatedSuggestions = useMemo(() => {
    if (!allTricks.length || userSportsIds.length === 0) return [];

    const trickById = new Map(allTricks.map((trick) => [trick.id, trick]));
    const tricksByCategory = new Map<string, Trick[]>();

    // Filter tricks to only include those from selected sports
    const relevantTricks = allTricks.filter((trick) => {
      // master_category may be typed without id; cast to any for runtime safety while types refined
      const categoryId = (trick.subcategory?.master_category as any)?.id as
        | string
        | undefined;
      return !!categoryId && userSportsIds.includes(categoryId);
    });

    relevantTricks.forEach((trick) => {
      const categorySlug = trick.subcategory?.master_category?.slug;
      if (categorySlug) {
        if (!tricksByCategory.has(categorySlug)) {
          tricksByCategory.set(categorySlug, []);
        }
        tricksByCategory.get(categorySlug)!.push(trick);
      }
    });

    const suggestions: TrickWithProgress[] = [];

    relevantTricks.forEach((trick) => {
      if (userCanDoTricks.has(trick.id)) return;

      const prerequisites = trick.prerequisite_ids || [];
      const missingPrereqs = prerequisites
        .filter((prereqId) => !userCanDoTricks.has(prereqId))
        .map((prereqId) => trickById.get(prereqId)?.name || "Unknown")
        .filter((name) => name !== "Unknown");

      const categorySlug = trick.subcategory?.master_category?.slug;
      const categoryTricks = categorySlug
        ? tricksByCategory.get(categorySlug) || []
        : [];
      const completedInCategory = categoryTricks.filter((t) =>
        userCanDoTricks.has(t.id)
      ).length;
      const categoryProgress =
        categoryTricks.length > 0
          ? completedInCategory / categoryTricks.length
          : 0;

      suggestions.push({
        ...trick,
        user_can_do: false,
        missing_prerequisites: missingPrereqs,
        category_progress: categoryProgress,
      });
    });

    // Sort by difficulty and prerequisites
    const sorted = suggestions.sort((a, b) => {
      // Prioritize tricks with no missing prerequisites
      if (
        a.missing_prerequisites.length === 0 &&
        b.missing_prerequisites.length > 0
      )
        return -1;
      if (
        b.missing_prerequisites.length === 0 &&
        a.missing_prerequisites.length > 0
      )
        return 1;

      // Then sort by difficulty
      return (a.difficulty_level || 0) - (b.difficulty_level || 0);
    });

    return sorted.slice(0, maxSuggestions);
  }, [allTricks, userCanDoTricks, userSportsIds, maxSuggestions]);

  // Interaction handlers delegated to parent via props

  const getDifficultyColor = (level?: number) => {
    if (!level) return "bg-gray-500";
    if (level <= 3) return "bg-green-500";
    if (level <= 6) return "bg-yellow-500";
    if (level <= 8) return "bg-orange-500";
    return "bg-red-500";
  };

  const getDifficultyLabel = (level?: number) => {
    if (!level) return "Unknown";
    if (level <= 3) return "Beginner";
    if (level <= 6) return "Intermediate";
    if (level <= 8) return "Advanced";
    return "Expert";
  };

  // Selection UI removed; handled by parent component

  // Loading state skeletons
  if (loading) {
    const skeletonCount = Math.min(maxSuggestions, 6);
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5" />
          <span className="font-semibold">Next Tricks to Learn</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded w-full animate-pulse" />
                  <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-muted rounded flex-1 animate-pulse" />
                    <div className="h-8 bg-muted rounded w-10 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // No suggestions available (only when not loading and user has selected sports)
  if (
    calculatedSuggestions.length === 0 &&
    userSportsIds.length > 0 &&
    allTricks.length > 0
  ) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5" />
          <span className="font-semibold">Next Tricks to Learn</span>
        </div>
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            No new tricks available in your selected sports. Try adding more
            sports or browse all tricks!
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={onManageSports}>
              <Plus className="h-4 w-4 mr-2" />
              Add More Sports
            </Button>
            <Link href="/browse">
              <Button variant="outline">Browse All Tricks</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show trick suggestions
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          <span className="font-semibold">Next Tricks to Learn</span>
        </div>
        <Button variant="outline" size="sm" onClick={onManageSports}>
          <Plus className="h-4 w-4 mr-2" />
          Manage Sports
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {calculatedSuggestions.map((trick) => (
          <Card key={trick.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {trick.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {trick.subcategory?.master_category?.name} •{" "}
                    {trick.subcategory?.name}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getDifficultyColor(
                    trick.difficulty_level ?? undefined
                  )} text-white`}
                >
                  {getDifficultyLabel(trick.difficulty_level ?? undefined)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Missing Prerequisites */}
                {trick.missing_prerequisites.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Need to learn first:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {trick.missing_prerequisites
                        .slice(0, 2)
                        .map((prereq, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {prereq}
                          </Badge>
                        ))}
                      {trick.missing_prerequisites.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{trick.missing_prerequisites.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => onMarkLearned(trick.id)}
                    className="flex-1 text-xs"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Mark as Learned
                  </Button>
                  <Link
                    href={`/${trick.subcategory?.master_category?.slug}/${trick.subcategory?.slug}/${trick.slug}`}
                  >
                    <Button variant="ghost" size="sm" className="px-2">
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View More Link */}
      <div className="text-center pt-4">
        <Link href="/browse">
          <Button variant="outline" size="sm">
            Browse All Tricks
          </Button>
        </Link>
      </div>
    </div>
  );
}
