"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "../ui/button";
import { Network, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

// New simplified stats type (can be elevated to a shared types file if needed)
export interface ProgressStats {
  sport: string; // label (e.g., category or sport name)
  mastered: number; // completed tricks count
  total: number; // total available tricks
  percentage: number; // 0-100 rounded
}

// Legacy types (from previous implementation)
interface LegacyCategoryProgressItem {
  category: { id: string; name: string; slug: string };
  completed: number;
  total: number;
  percentage: number;
}
interface LegacyTotalStats {
  totalTricks: number;
  completedTricks: number;
  percentage: number;
  recentlyCompleted?: any[];
}

// New props OR legacy props (discriminated by presence of progressStats)
type ProgressOverviewProps =
  | {
      progressStats: ProgressStats[];
      loading?: boolean;
      className?: string;
      title?: string;
    }
  | {
      // Legacy
      categoryProgress?: LegacyCategoryProgressItem[];
      totalStats?: LegacyTotalStats;
      userSportsIds?: string[];
      loading?: boolean;
      className?: string;
      title?: string;
      progressStats?: undefined; // ensure mutual exclusivity
    };

export function ProgressOverview(props: ProgressOverviewProps) {
  const { loading, className, title = "Your Progress" } = props as any;

  // Normalize to progressStats[] if legacy props were provided
  let progressStats: ProgressStats[] = [];

  if ("progressStats" in props && props.progressStats !== undefined) {
    progressStats = props.progressStats || [];
  } else {
    const legacyCategoryProgress = (props as any).categoryProgress as
      | LegacyCategoryProgressItem[]
      | undefined;
    const userSportsIds = ((props as any).userSportsIds || []) as string[];

    if (legacyCategoryProgress && legacyCategoryProgress.length > 0) {
      // Optionally filter by userSportsIds if provided
      const filtered = userSportsIds.length
        ? legacyCategoryProgress.filter((c) =>
            userSportsIds.includes(c.category.id)
          )
        : legacyCategoryProgress;
      progressStats = filtered.map((c) => ({
        sport: c.category.name,
        mastered: c.completed,
        total: c.total,
        percentage: c.percentage,
      }));
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Loading progress...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 " />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progressStats.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No progress recorded yet.
          </div>
        )}
        {progressStats.map((stat) => (
          <div key={stat.sport} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex justify-start">
                <h3 className="font-semibold text-base md:text-lg truncate pr-4">
                  {stat.sport}
                </h3>
                {/* Skill Tree link with tooltip */}
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="hover:text-accent-foreground"
                      >
                        <Link
                          href={`/${encodeURIComponent(
                            stat.sport
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-|-$/g, "")
                          )}/skill-tree`}
                          aria-label={`${stat.sport} Skill Tree`}
                        >
                          <Network className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {`${stat.sport} Skill Tree`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                {stat.mastered}/{stat.total} mastered ({stat.percentage}%)
              </span>
            </div>
            <Progress
              value={stat.percentage}
              className="h-3 [&>div]:bg-accent"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Backwards compatibility: re-export under previous name expecting transformed input upstream.
// NOTE: Previous props signature was very different; upstream code must adapt to supply progressStats.
export const UserProgressOverview = ProgressOverview;
