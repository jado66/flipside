"use client";

import { useGym } from "@/contexts/gym-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function DemoBadge() {
  const { demoMode, resetToSeed } = useGym();
  const isDev = process.env.NODE_ENV !== "production";
  return (
    <div className="flex items-center gap-2">
      {demoMode && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Demo Mode
        </Badge>
      )}
      {isDev && (
        <Button
          size="sm"
          variant="destructive"
          onClick={async () => {
            if (
              !confirm(
                "Reset all gym data to seed data? This will overwrite local data."
              )
            )
              return;
            await resetToSeed();
            // Small feedback; in-app components should update automatically
            // but an alert gives quick confirmation for manual debugging flows.
            alert("Gym data reset to seed data.");
          }}
          className="ml-2"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
