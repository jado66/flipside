"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Trick } from "@/types/trick";

interface TrickWithProgress extends Trick {
  user_can_do: boolean;
  missing_prerequisites: string[];
  category_progress: number;
}

interface NextSuggestedTricksProps {
  maxSuggestions?: number;
  allTricks: Trick[];
  userCanDoTricks: Set<string>;
  userSportsIds: string[];
  onMarkLearned: (trickId: string) => Promise<void> | void;
  loading?: boolean;
}

export function NextTricksSuggestions({
  maxSuggestions = 6,
  allTricks,
  userCanDoTricks,
  userSportsIds,
  onMarkLearned,
  loading = false,
}: NextSuggestedTricksProps) {
  // Calculate suggested tricks based on user progress and selected sports
  const calculatedSuggestions = useMemo(() => {
    if (!allTricks.length || userSportsIds.length === 0) return [];

    const trickById = new Map(allTricks.map((trick) => [trick.id, trick]));
    const tricksByCategory = new Map<string, Trick[]>();

    // Filter tricks to only include those from selected sports
    const relevantTricks = allTricks.filter((trick) => {
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

  const getDifficultyColor = (level?: number) => {
    if (!level)
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    if (level <= 3)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (level <= 6)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (level <= 8)
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getDifficultyLabel = (level?: number) => {
    if (!level) return "Unknown";
    if (level <= 3) return "Beginner";
    if (level <= 6) return "Intermediate";
    if (level <= 8) return "Advanced";
    return "Expert";
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Ready to Learn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: Math.min(maxSuggestions, 3) }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-5 bg-muted rounded w-16 animate-pulse" />
                  </div>
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-muted rounded w-24 animate-pulse" />
                  <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No suggestions available
  if (
    calculatedSuggestions.length === 0 &&
    userSportsIds.length > 0 &&
    allTricks.length > 0
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Ready to Learn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>
              No new tricks available in your selected sports. Try adding more
              sports or browse all tricks!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show trick suggestions with clean styling
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Ready to Learn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calculatedSuggestions.map((trick) => (
            <div
              key={trick.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{trick.name}</h3>
                  <Badge
                    className={getDifficultyColor(
                      trick.difficulty_level ?? undefined
                    )}
                  >
                    {getDifficultyLabel(trick.difficulty_level ?? undefined)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trick.description || "Learn this exciting new trick!"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {trick.subcategory?.master_category?.name} •{" "}
                  {trick.subcategory?.name}
                </p>
                {trick.missing_prerequisites.length > 0 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Prerequisites needed:{" "}
                    {trick.missing_prerequisites.join(", ")}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkLearned(trick.id)}
                  className="text-xs whitespace-nowrap"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Already Can Do
                </Button>
                <Link
                  href={`/${trick.subcategory?.master_category?.slug}/${trick.subcategory?.slug}/${trick.slug}`}
                >
                  <Button variant="ghost" size="sm">
                    Learn <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
