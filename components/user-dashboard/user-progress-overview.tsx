"use client";

// Refactored: now purely presentational; data fetched in UserDashboard
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, BookOpen } from "lucide-react";
import Link from "next/link";
import { CategoryProgress, TotalStats } from "./user-dashboard.types";

interface UserProgressOverviewProps {
  categoryProgress: CategoryProgress[];
  totalStats: TotalStats;
  loading?: boolean;
}

export function UserProgressOverview({
  categoryProgress,
  totalStats,
  loading,
}: UserProgressOverviewProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading progress...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Only show categories where the user has completed at least one trick
  const interestedCategories = categoryProgress.filter(
    (progress) => progress.completed > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Progress
        </CardTitle>
        <CardDescription>
          Track your learning journey across all skill categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {totalStats.completedTricks}
              </div>
              <div className="text-xs text-muted-foreground">
                Tricks Learned
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalStats.percentage}%</div>
              <div className="text-xs text-muted-foreground">
                Overall Progress
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {totalStats.totalTricks}
              </div>
              <div className="text-xs text-muted-foreground">Total Tricks</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">
                {totalStats.completedTricks} / {totalStats.totalTricks}
              </span>
            </div>
            <Progress
              value={totalStats.percentage}
              className="h-3 [&>div]:bg-accent"
            />
          </div>

          {/* Category Progress */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Progress by Category</h4>
            {interestedCategories.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                You haven't added any tricks yet. Browse tricks to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {interestedCategories.map((progress) => (
                  <div key={progress.category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: progress.category.color || "#fff",
                          }}
                        />
                        <span className="text-sm font-medium">
                          {progress.category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {progress.completed} / {progress.total}
                        </span>
                        <Link href={`/${progress.category.slug}/skill-tree`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            Skill Tree
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <Progress
                      value={progress.percentage}
                      className="h-2 [&>div]:bg-accent"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Link href="/browse">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Browse Tricks
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
