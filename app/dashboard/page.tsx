"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { MainNav } from "@/components/main-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface DashboardData {
  upcomingEvents: any[];
  mySchedules: any[];
  myHubs: any[];
  stats: {
    totalEvents: number;
    totalSchedules: number;
    totalHubs: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    upcomingEvents: [],
    mySchedules: [],
    myHubs: [],
    stats: { totalEvents: 0, totalSchedules: 0, totalHubs: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Load user profile to get role
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      // Load upcoming events user is registered for
      const { data: events } = await supabase
        .from("event_participants")
        .select(
          `
          events!inner(
            id, title, start_time, end_time,
            hubs!inner(name, city, state)
          )
        `
        )
        .eq("user_id", user.id)
        .gte("events.start_time", new Date().toISOString())
        .order("events.start_time", { ascending: true })
        .limit(3);

      // Load user schedules
      const { data: schedules } = await supabase
        .from("user_hub_schedules")
        .select(
          `
          *,
          hubs!inner(name, city, state)
        `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(3);

      // Load user's hubs if they're a business user
      let hubs = [];
      if (profile?.role === "business") {
        const { data: userHubs } = await supabase
          .from("hubs")
          .select("*")
          .eq("owner_id", user.id)
          .eq("is_active", true)
          .limit(3);
        hubs = userHubs || [];
      }

      // Load stats
      const [eventsCount, schedulesCount, hubsCount] = await Promise.all([
        supabase
          .from("event_participants")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("user_hub_schedules")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("is_active", true),
        profile?.role === "business"
          ? supabase
              .from("hubs")
              .select("id", { count: "exact" })
              .eq("owner_id", user.id)
              .eq("is_active", true)
          : { count: 0 },
      ]);

      setData({
        upcomingEvents: events?.map((e) => e.events) || [],
        mySchedules: schedules || [],
        myHubs: hubs,
        stats: {
          totalEvents: eventsCount.count || 0,
          totalSchedules: schedulesCount.count || 0,
          totalHubs: hubsCount.count || 0,
        },
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <MainNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Please log in to view your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Welcome back!</h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s what&apos;s happening in your action sports community
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Registered Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.stats.totalEvents}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Training Schedules
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.stats.totalSchedules}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Hubs</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.stats.totalHubs}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Upcoming Events</CardTitle>
                    <Link href="/events">
                      <Button variant="ghost" size="sm">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {data.upcomingEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground mb-4">
                        No upcoming events
                      </p>
                      <Link href="/events">
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Browse Events
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {event.hubs.name} •{" "}
                              {format(
                                new Date(event.start_time),
                                "MMM d, h:mm a"
                              )}
                            </p>
                          </div>
                          <Link href={`/events/${event.id}`}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Training Schedule */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Training Schedule</CardTitle>
                    <Link href="/schedule">
                      <Button variant="ghost" size="sm">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {data.mySchedules.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground mb-4">
                        No training schedule set
                      </p>
                      <Link href="/schedule">
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add Schedule
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.mySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className="capitalize text-xs"
                              >
                                {schedule.day_of_week}
                              </Badge>
                              <span className="text-sm">
                                {format(
                                  new Date(`2000-01-01T${schedule.start_time}`),
                                  "h:mm a"
                                )}{" "}
                                -{" "}
                                {format(
                                  new Date(`2000-01-01T${schedule.end_time}`),
                                  "h:mm a"
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {schedule.hubs.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* My Hubs (for business users) */}
            {data.myHubs.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>My Hubs</CardTitle>
                    <Link href="/hubs">
                      <Button variant="ghost" size="sm">
                        Manage All
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.myHubs.map((hub) => (
                      <div key={hub.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">{hub.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {hub.city}, {hub.state}
                        </p>
                        <div className="flex gap-2">
                          <Link href={`/hubs/${hub.id}`}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                          <Link href="/events/create">
                            <Button
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Add Event
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
