"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus, Check, X } from "lucide-react";
import Link from "next/link";
import { MasterCategory } from "../skill-tree.types";

interface SportsSelectionProps {
  categories: MasterCategory[];
  userSportsIds: string[];
  onToggleSport: (categoryId: string) => Promise<void> | void;
  onFinish: () => void;
  loading?: boolean;
}

const iconMap: Record<string, any> = {};
const getCategoryIcon = (iconName?: string | null) => {
  const key = iconName?.toLowerCase();
  const Icon = key ? iconMap[key] : undefined;
  return Icon || CheckCircle2; // fallback icon
};

export function SportsSelection({
  categories,
  userSportsIds,
  onToggleSport,
  onFinish,
}: SportsSelectionProps) {
  const allSelected =
    categories.length > 0 && userSportsIds.length === categories.length;

  const handleSelectAll = () => {
    if (allSelected) {
      // Clear all
      categories.forEach((c) => {
        if (userSportsIds.includes(c.id)) onToggleSport(c.id);
      });
    } else {
      categories.forEach((c) => {
        if (!userSportsIds.includes(c.id)) onToggleSport(c.id);
      });
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            What Are You Interested In?
          </h2>
          <p className="text-muted-foreground text-sm max-w-prose">
            Select any sports you're interested in. We'll tailor trick
            suggestions and progress to these categories. You can always update
            your selections later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={categories.length === 0}
          >
            {allSelected ? (
              <>
                <X className="h-3 w-3 mr-1" /> Clear All
              </>
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" /> Select All
              </>
            )}
          </Button>
          {userSportsIds.length > 0 && (
            <Button size="sm" onClick={onFinish}>
              Continue ({userSportsIds.length})
            </Button>
          )}
        </div>
      </div>

      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6"
        role="list"
        aria-label="Sports categories multi-select"
      >
        {categories.map((category) => {
          const isSelected = userSportsIds.includes(category.id);
          const Icon = getCategoryIcon(category.icon_name);
          return (
            <Card
              key={category.id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleSport(category.id);
                }
              }}
              className={`relative cursor-pointer transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                isSelected ? "ring-2 ring-primary" : "border-muted"
              }`}
              onClick={() => onToggleSport(category.id)}
            >
              <CardHeader className="pr-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: (category.color || "#ccc") + "20",
                      }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold leading-tight">
                        {category.name}
                      </CardTitle>
                    </div>
                  </div>
                </div>
                <div
                  className={`absolute top-3 right-3 w-5 h-5 rounded-sm border flex items-center justify-center text-white transition-colors ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30 bg-background"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  <span className="sr-only">
                    {isSelected ? "Selected" : "Not selected"}
                  </span>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between text-sm">
        <div className="text-muted-foreground">
          {userSportsIds.length === 0
            ? "No sports selected"
            : `${userSportsIds.length} selected`}
        </div>
        <div className="flex gap-2">
          <Link href="/browse">
            <Button variant="ghost" size="sm">
              Browse Tricks
            </Button>
          </Link>
          {userSportsIds.length > 0 && (
            <Button onClick={onFinish} size="sm">
              See Suggestions
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
