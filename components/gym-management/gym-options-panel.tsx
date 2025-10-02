"use client";

import { useGym } from "@/contexts/gym/gym-provider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings2 } from "lucide-react";

export function GymOptionsPanel() {
  const { allowOverEnrollment, toggleAllowOverEnrollment } = useGym();

  return (
    <div className="w-full">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <h3 className="font-semibold">Settings</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Configure gym management options
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="font-medium text-sm">Class Management</div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="allow-over-enrollment"
                className="text-sm font-normal cursor-pointer"
              >
                Allow Over-Enrollment
              </Label>
              <p className="text-xs text-muted-foreground">
                Let classes exceed their capacity limits
              </p>
            </div>
            <Switch
              id="allow-over-enrollment"
              checked={allowOverEnrollment}
              onCheckedChange={toggleAllowOverEnrollment}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="font-medium text-sm text-muted-foreground">
            More options coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
