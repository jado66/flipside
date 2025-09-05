"use client";

import { useState, useEffect } from "react";

import { MainNav } from "@/components/main-nav";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/supabase-client";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string;
  max_participants: number | null;
  current_participants: number;
  price: number;
  skill_level: string | null;
  sports: string[];
  hubs: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

interface SearchFilters {
  query: string;
  sport: string;
  event_type: string;
  skill_level: string;
  city: string;
}

const SPORTS_OPTIONS = [
  "parkour",
  "trampoline",
  "tricking",
  "freerunning",
  "trampoline",
  "martial arts",
  "breakdancing",
];
const EVENT_TYPES = ["meetup", "class", "competition", "open_session"];
const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "all"];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    sport: "All Sports",
    event_type: "All Types",
    skill_level: "All Levels",
    city: "",
  });

  useEffect(() => {
    loadEvents();
    loadUser();
  }, []);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      setUser({ ...user, role: profile?.role });
    }
  };

  const loadEvents = async (searchFilters?: SearchFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from("events")
        .select(
          `
          *,
          hubs!inner(id, name, city, state)
        `
        )
        .eq("is_active", true)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      const currentFilters = searchFilters || filters;

      if (currentFilters.query) {
        query = query.or(
          `title.ilike.%${currentFilters.query}%,description.ilike.%${currentFilters.query}%`
        );
      }
      if (currentFilters.sport && currentFilters.sport !== "All Sports") {
        query = query.contains("sports", [currentFilters.sport]);
      }
      if (
        currentFilters.event_type &&
        currentFilters.event_type !== "All Types"
      ) {
        query = query.eq("event_type", currentFilters.event_type);
      }
      if (
        currentFilters.skill_level &&
        currentFilters.skill_level !== "All Levels"
      ) {
        query = query.eq("skill_level", currentFilters.skill_level);
      }
      if (currentFilters.city) {
        query = query.ilike("hubs.city", `%${currentFilters.city}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadEvents(filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: "",
      sport: "All Sports",
      event_type: "All Types",
      skill_level: "All Levels",
      city: "",
    };
    setFilters(clearedFilters);
    loadEvents(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && !value.startsWith("All")
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">Upcoming Events</h1>
            <p className="text-muted-foreground mt-2">
              Join action sports events and meetups in your area
            </p>
          </div>

          <Link href="/events/create">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={filters.query}
                onChange={(e) =>
                  setFilters({ ...filters, query: e.target.value })
                }
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Search
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.sport}
              onValueChange={(value) =>
                setFilters({ ...filters, sport: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Sports">All Sports</SelectItem>
                {SPORTS_OPTIONS.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.event_type}
              onValueChange={(value) =>
                setFilters({ ...filters, event_type: value })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.skill_level}
              onValueChange={(value) =>
                setFilters({ ...filters, skill_level: value })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Levels">All Levels</SelectItem>
                {SKILL_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-[150px]"
            />

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} size="sm">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.query && (
                <Badge variant="secondary">Search: {filters.query}</Badge>
              )}
              {filters.sport && filters.sport !== "All Sports" && (
                <Badge variant="secondary">Sport: {filters.sport}</Badge>
              )}
              {filters.event_type && filters.event_type !== "All Types" && (
                <Badge variant="secondary">
                  Type: {filters.event_type.replace("_", " ")}
                </Badge>
              )}
              {filters.skill_level && filters.skill_level !== "All Levels" && (
                <Badge variant="secondary">Level: {filters.skill_level}</Badge>
              )}
              {filters.city && (
                <Badge variant="secondary">City: {filters.city}</Badge>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No events found. Try adjusting your search filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
