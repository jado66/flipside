"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

interface Hub {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface ScheduleFormProps {
  onScheduleAdded?: () => void;
}

export function ScheduleForm({ onScheduleAdded }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    hub_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    notes: "",
  });
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadHubs();
  }, []);

  const loadHubs = async () => {
    try {
      const { data, error } = await supabase
        .from("hubs")
        .select("id, name, city, state")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setHubs(data || []);
    } catch (error) {
      console.error("Error loading hubs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to add a schedule");

      const { error } = await supabase.from("user_hub_schedules").insert([
        {
          ...formData,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setFormData({
        hub_id: "",
        day_of_week: "",
        start_time: "",
        end_time: "",
        notes: "",
      });
      setOpen(false);
      onScheduleAdded?.();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Training Schedule</DialogTitle>
          <DialogDescription>
            Add your regular training schedule at a hub
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hub_id">Hub *</Label>
            <Select
              value={formData.hub_id}
              onValueChange={(value) =>
                setFormData({ ...formData, hub_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a hub" />
              </SelectTrigger>
              <SelectContent>
                {hubs.map((hub) => (
                  <SelectItem key={hub.id} value={hub.id}>
                    {hub.name} - {hub.city}, {hub.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day_of_week">Day *</Label>
            <Select
              value={formData.day_of_week}
              onValueChange={(value) =>
                setFormData({ ...formData, day_of_week: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g., Tricking session with the crew"
              rows={2}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
