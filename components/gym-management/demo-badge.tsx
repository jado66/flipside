"use client";

import { useGym } from "@/contexts/gym-provider";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Sparkles } from "lucide-react";

export function DemoBadge() {
  const { demoMode, toggleDemoMode } = useGym();
  return (
    <div className="flex items-center gap-2">
      {demoMode && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Demo Mode
        </Badge>
      )}
      <Toggle
        aria-label="Toggle demo mode"
        pressed={demoMode}
        onPressedChange={() => toggleDemoMode()}
      >
        {demoMode ? "Demo" : "Live"}
      </Toggle>
    </div>
  );
}
