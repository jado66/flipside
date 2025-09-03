"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SPORTS_OPTIONS = [
  "parkour",
  "trampoline",
  "tricking",
  "freerunning",
  "trampoline",
  "martial arts",
  "breakdancing",
];

const EVENT_TYPES = [
  { value: "meetup", label: "Meetup" },
  { value: "class", label: "Class" },
  { value: "competition", label: "Competition" },
  { value: "open_session", label: "Open Session" },
];

const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "all"];

interface Hub {
  id: string;
  name: string;
  city: string;
  state: string;
}

export function CreateEventForm() {
  const [formData, setFormData] = useState({
    hub_id: "",
    title: "",
    description: "",
    event_type: "meetup",
    start_time: "",
    end_time: "",
    max_participants: "",
    price: "",
    skill_level: "all",
    sports: [] as string[],
  });
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserHubs();
  }, []);

  const loadUserHubs = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("hubs")
        .select("id, name, city, state")
        .eq("owner_id", user.id)
        .eq("is_active", true);

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
      if (!user) throw new Error("You must be logged in to create an event");

      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            ...formData,
            organizer_id: user.id,
            max_participants: formData.max_participants
              ? Number.parseInt(formData.max_participants)
              : null,
            price: Number.parseFloat(formData.price) || 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      router.push(`/events/${data.id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSportsChange = (sport: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, sports: [...formData.sports, sport] });
    } else {
      setFormData({
        ...formData,
        sports: formData.sports.filter((s) => s !== sport),
      });
    }
  };

  if (hubs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Hubs Found</CardTitle>
            <CardDescription>
              You need to own a hub to create events. Create a hub first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/hubs/create")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Create Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>
            Organize a meetup, class, or competition at your hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, event_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
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
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={formData.max_participants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_participants: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill_level">Skill Level</Label>
                <Select
                  value={formData.skill_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, skill_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Sports *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPORTS_OPTIONS.map((sport) => (
                  <div key={sport} className="flex items-center space-x-2">
                    <Checkbox
                      id={sport}
                      checked={formData.sports.includes(sport)}
                      onCheckedChange={(checked) =>
                        handleSportsChange(sport, checked as boolean)
                      }
                    />
                    <Label htmlFor={sport} className="text-sm font-normal">
                      {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? "Creating Event..." : "Create Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
