"use client";

import { useGym } from "@/contexts/gym/gym-provider";
import { useGymSetup } from "@/contexts/gym/gym-setup-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function DemoBadge() {
  const { demoMode, resetToSeed } = useGym();
  const { resetSetup } = useGymSetup();
  const isDev = process.env.NODE_ENV !== "production";
  
  const handleReset = async () => {
    if (
      !confirm(
        "Reset gym completely? This will reset all data to seed data and return to setup wizard."
      )
    )
      return;
    
    try {
      // First reset the setup configuration
      resetSetup();
      
      // Then reset gym data in the background
      // We don't await this since we're going to reload anyway
      resetToSeed().catch(console.error);
      
      // Give it a tiny moment to write to localStorage, then reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Reset failed:", error);
      alert("Reset failed. Please refresh the page manually.");
    }
  };
  
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
          onClick={handleReset}
          className="ml-2"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
