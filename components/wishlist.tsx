"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

export interface UserProgress {
  userId: string;
  masteredTricks: string[]; // Array of trick IDs
  wishlist: string[]; // Array of trick IDs
  recentlyViewed: string[]; // Array of trick IDs
}
export interface Trick {
  id: string;
  name: string;
  sport: "parkour" | "tricking" | "trampoline" | "freerunning";
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  prerequisites: string[]; // Array of trick IDs
}

export const mockTricks: Trick[] = [
  // Parkour tricks
  {
    id: "safety-roll",
    name: "Safety Roll",
    sport: "parkour",
    difficulty: "beginner",
    description: "Basic roll to absorb impact safely",
    prerequisites: [],
  },
  {
    id: "precision-jump",
    name: "Precision Jump",
    sport: "parkour",
    difficulty: "beginner",
    description: "Accurate jump from one point to another",
    prerequisites: [],
  },
  {
    id: "vault-step",
    name: "Step Vault",
    sport: "parkour",
    difficulty: "beginner",
    description: "Basic vault using one hand and stepping over",
    prerequisites: ["precision-jump"],
  },
  {
    id: "kong-vault",
    name: "Kong Vault",
    sport: "parkour",
    difficulty: "intermediate",
    description: "Diving vault using both hands",
    prerequisites: ["vault-step", "safety-roll"],
  },
  {
    id: "double-kong",
    name: "Double Kong",
    sport: "parkour",
    difficulty: "advanced",
    description: "Two consecutive kong vaults",
    prerequisites: ["kong-vault"],
  },

  // Tricking
  {
    id: "cartwheel",
    name: "Cartwheel",
    sport: "tricking",
    difficulty: "beginner",
    description: "Basic sideways rotation",
    prerequisites: [],
  },
  {
    id: "round-off",
    name: "Round Off",
    sport: "tricking",
    difficulty: "beginner",
    description: "Cartwheel with both feet landing together",
    prerequisites: ["cartwheel"],
  },
  {
    id: "back-handspring",
    name: "Back Handspring",
    sport: "tricking",
    difficulty: "intermediate",
    description: "Backward flip landing on hands then feet",
    prerequisites: ["round-off"],
  },
  {
    id: "back-flip",
    name: "Back Flip",
    sport: "tricking",
    difficulty: "intermediate",
    description: "Backward somersault in the air",
    prerequisites: ["back-handspring"],
  },
  {
    id: "double-back",
    name: "Double Back",
    sport: "tricking",
    difficulty: "advanced",
    description: "Two backward flips in succession",
    prerequisites: ["back-flip"],
  },

  // Trampoline
  {
    id: "straight-jump",
    name: "Straight Jump",
    sport: "trampoline",
    difficulty: "beginner",
    description: "Basic controlled bounce",
    prerequisites: [],
  },
  {
    id: "seat-drop",
    name: "Seat Drop",
    sport: "trampoline",
    difficulty: "beginner",
    description: "Landing in seated position",
    prerequisites: ["straight-jump"],
  },
  {
    id: "front-drop",
    name: "Front Drop",
    sport: "trampoline",
    difficulty: "intermediate",
    description: "Landing on stomach",
    prerequisites: ["seat-drop"],
  },

  // Freerunning
  {
    id: "wall-run",
    name: "Wall Run",
    sport: "freerunning",
    difficulty: "beginner",
    description: "Running up a vertical wall",
    prerequisites: [],
  },
  {
    id: "tic-tac",
    name: "Tic Tac",
    sport: "freerunning",
    difficulty: "intermediate",
    description: "Using wall to redirect momentum",
    prerequisites: ["wall-run"],
  },
  {
    id: "triple-full",
    name: "Triple Full",
    sport: "freerunning",
    difficulty: "advanced",
    description: "Three full twists in the air",
    prerequisites: ["back-flip"],
  },
  {
    id: "gainer-full",
    name: "Gainer Full",
    sport: "freerunning",
    difficulty: "intermediate",
    description: "Backward flip with a full twist",
    prerequisites: ["front-drop"],
  },
  {
    id: "540-dive-roll",
    name: "540 Dive Roll",
    sport: "freerunning",
    difficulty: "intermediate",
    description: "Backward flip with a full twist",
    prerequisites: ["front-drop"],
  },
];

export const mockUserProgress: UserProgress = {
  userId: "user-1",
  masteredTricks: [
    "safety-roll",
    "precision-jump",
    "vault-step",
    "cartwheel",
    "round-off",
    "straight-jump",
    "seat-drop",
    "wall-run",
  ],
  wishlist: ["double-back", "triple-full", "gainer-full", "540-dive-roll"],
  recentlyViewed: ["back-handspring", "front-drop", "double-back"],
};

export function Wishlist() {
  const [userProgress, setUserProgress] = useState(mockUserProgress);

  const wishlistTricks = useMemo(
    () =>
      userProgress.wishlist
        .map((id) => mockTricks.find((trick) => trick.id === id))
        .filter(Boolean) as any[],
    [userProgress.wishlist]
  );

  const displayTricks = wishlistTricks.slice(0, 5);
  const hasMore = wishlistTricks.length > 5;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Goal Tricks
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Track the tricks you want to master next. When you complete a trick,
          we&apos;ll remove it automatically.
        </p>
      </CardHeader>
      <CardContent>
        {displayTricks.length > 0 ? (
          <div className="space-y-3">
            {displayTricks.map((trick) => (
              <div
                key={trick.id}
                className="flex items-center justify-between p-3 border rounded-lg " //hover:bg-muted/50 transition-colors
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{trick.name}</h3>
                    <Badge variant="outline" className="capitalize text-xs">
                      {trick.sport}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" disabled>
                    View <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    // onClick={() => onRemoveFromWishlist(trick.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {hasMore && (
              <div className="pt-2 border-t">
                <Button variant="outline" className="w-full bg-transparent">
                  View All ({wishlistTricks.length} tricks)
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Add tricks to your wishlist to track your goals!</p>
          </div>
        )}
      </CardContent>
      {/* Centered Coming Soon overlay with a subtle frosted (blurred) panel behind text - no border or shadow */}
      <div className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center p-4">
        <div className="relative animate-in fade-in duration-500 pointer-events-none">
          {/* Frosted translucent gradient panel (so text stays readable but underlying content peeks through) */}
          <div className="absolute inset-0 rounded-2xl backdrop-blur-lg backdrop-saturate-150 bg-gradient-to-br from-background/55 via-background/25 to-background/10 dark:from-neutral-900/70 dark:via-neutral-900/45 dark:to-neutral-900/25" />
          <div className="relative flex flex-col items-center gap-3 text-center px-6 py-5">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide bg-black/10 dark:bg-white/10 backdrop-blur-sm">
              <Heart className="w-4 h-4 text-red-500" /> Coming Soon
            </span>
            <p className="text-xs md:text-sm max-w-xs text-muted-foreground leading-snug">
              Track your dream tricks and build your progression path. Coming
              very soon!
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
