"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { ScheduleCard } from "@/components/schedule-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";

interface Schedule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  users: {
    first_name: string;
    last_name: string;
  };
  hubs: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

interface HubScheduleViewProps {
  hubId: string;
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

export function HubScheduleView({ hubId }: HubScheduleViewProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState<string>("all");
  const supabase = createClient();

  useEffect(() => {
    loadSchedules();
  }, [hubId, filterDay]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("user_hub_schedules")
        .select(
          `
          *,
          users!inner(first_name, last_name),
          hubs!inner(id, name, city, state)
        `
        )
        .eq("hub_id", hubId)
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
      console.error("Error loading hub schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupedSchedules = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = schedules.filter((schedule) => schedule.day_of_week === day);
    return acc;
  }, {} as Record<string, Schedule[]>);

  const totalUsers = new Set(
    schedules.map((s) => `${s.users.first_name} ${s.users.last_name}`)
  ).size;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Regular Training Schedule
          </CardTitle>
          <Badge variant="secondary">{totalUsers} athletes</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
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
          {filterDay !== "all" && (
            <Badge variant="outline" className="capitalize">
              {filterDay}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {filterDay === "all"
                ? "No regular training schedules yet."
                : `No training scheduled for ${filterDay}.`}
            </p>
          </div>
        ) : filterDay === "all" ? (
          <div className="space-y-6">
            {DAYS_OF_WEEK.map((day) => {
              const daySchedules = groupedSchedules[day];
              if (daySchedules.length === 0) return null;

              return (
                <div key={day}>
                  <h3 className="text-lg font-medium mb-3 capitalize flex items-center gap-2">
                    {day}
                    <Badge variant="outline" className="text-xs">
                      {daySchedules.length}
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {daySchedules.map((schedule) => (
                      <ScheduleCard
                        key={schedule.id}
                        schedule={schedule}
                        showUser={true}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                showUser={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
