"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowRight, Gift } from "lucide-react";
import { XP_LEVELS, calculateXPProgress } from "@/lib/xp/levels";
import { useUser } from "@/contexts/user-provider";
import Link from "next/link";

interface MiniContributeCTAProps {
  variant?: "profile" | "dashboard";
  className?: string;
}

export function MiniContributeCTA({
  variant = "dashboard",
  className = "",
}: MiniContributeCTAProps) {
  const { user } = useUser();
  const totalXP = user?.xp ?? 0;
  const { currentLevel, nextLevel, progressPct, xpToNext } =
    calculateXPProgress(totalXP);

  return (
    <Card
      className={[
        "border-dashed border-primary/30 bg-gradient-to-br from-background via-background to-primary/5",
        className,
      ].join(" ")}
    >
      <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm leading-none">Your Level</p>
              <Badge className={`${currentLevel.badgeBg} text-white py-0.5`}>
                Level {currentLevel.level}
              </Badge>
              <span className={`text-xs font-medium ${currentLevel.color}`}>
                {currentLevel.name}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
              {nextLevel
                ? `Earn ${xpToNext} XP to reach Level ${nextLevel.level} (${nextLevel.name}).`
                : `You've reached the max level. Great job!`}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{totalXP} XP</span>
            {nextLevel && <span>{nextLevel.nextLevelXP} XP Goal</span>}
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        <div className="text-[11px] bg-muted/40 rounded-md p-2 leading-relaxed flex">
          {nextLevel ? (
            <>
              <span className="font-medium flex items-center gap-1 mr-2">
                <Gift className="w-4 h-4" /> Next Unlock:
              </span>{" "}
              {nextLevel.unlocks.length === 1 ? (
                <span>{nextLevel.unlocks[0]}</span>
              ) : (
                <span>
                  {nextLevel.unlocks.slice(0, 2).join(", ")}
                  {nextLevel.unlocks.length > 2 && "..."}
                </span>
              )}
            </>
          ) : (
            <span className="font-medium">All rewards unlocked!</span>
          )}
        </div>

        <div className="flex gap-2">
          {user ? (
            <Button size="sm" asChild className="h-8 text-xs flex-1">
              <Link
                href="/contribute"
                className="flex items-center justify-center"
              >
                How to Contribute <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          ) : (
            <Button size="sm" asChild className="h-8 text-xs flex-1">
              <Link href="/login">Sign in to Earn XP</Link>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 text-xs flex-1"
          >
            <Link
              href="/contribute#levels"
              className="flex items-center justify-center"
            >
              View Levels
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
