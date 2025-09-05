"use client";

import { useState, useEffect } from "react";

import { MainNav } from "@/components/main-nav";
import { ScheduleCard } from "@/components/schedule-card";
import { ScheduleForm } from "@/components/schedule-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase/supabase-client";

interface Schedule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  hubs: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState<string>("all");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadSchedules();
  }, []);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadSchedules = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from("user_hub_schedules")
        .select(
          `
          *,
          hubs!inner(id, name, city, state)
        `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("day_of_week")
        .order("start_time");

      if (filterDay !== "all") {
        query = query.eq("day_of_week", filterDay);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSchedules();
    }
  }, [filterDay, user]);

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from("user_hub_schedules")
        .delete()
        .eq("id", scheduleId);

      if (error) throw error;
      loadSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const groupedSchedules = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = schedules.filter((schedule) => schedule.day_of_week === day);
    return acc;
  }, {} as Record<string, Schedule[]>);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Please log in to view your training schedule.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              My Training Schedule
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your regular training sessions at different hubs
            </p>
          </div>
          <ScheduleForm onScheduleAdded={loadSchedules} />
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterDay} onValueChange={setFilterDay}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filterDay !== "all" && (
            <Badge variant="secondary" className="capitalize">
              {filterDay}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {filterDay === "all"
                ? "No training schedules yet."
                : `No training scheduled for ${filterDay}.`}
            </p>
            <ScheduleForm onScheduleAdded={loadSchedules} />
          </div>
        ) : filterDay === "all" ? (
          <div className="space-y-8">
            {DAYS_OF_WEEK.map((day) => {
              const daySchedules = groupedSchedules[day];
              if (daySchedules.length === 0) return null;

              return (
                <div key={day}>
                  <h2 className="text-xl font-semibold mb-4 capitalize">
                    {day}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daySchedules.map((schedule) => (
                      <ScheduleCard
                        key={schedule.id}
                        schedule={schedule}
                        onDelete={handleDeleteSchedule}
                        canDelete={true}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onDelete={handleDeleteSchedule}
                canDelete={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
