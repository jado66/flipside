"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Sparkles,
} from "lucide-react";
import { useGymAnalytics } from "@/contexts/gym/gym-analytics";
import { useGym } from "@/contexts/gym/gym-provider";

export function AnalyticsDashboard() {
  const {
    loading: dataLoading,
    memberGrowthPct,
    classAttendancePct,
    revenueGrowthPct,
    retentionPct,
    popularClasses,
    revenueHistory,
  } = useGymAnalytics();
  const { demoMode } = useGym();

  const metrics = [
    {
      title: "Member Growth",
      value:
        memberGrowthPct == null
          ? "--"
          : `${memberGrowthPct > 0 ? "+" : ""}${memberGrowthPct}%`,
      description: "vs prev 30 days",
      trend:
        memberGrowthPct == null ? null : memberGrowthPct >= 0 ? "up" : "down",
      icon: Users,
    },
    {
      title: "Class Attendance",
      value: classAttendancePct == null ? "--" : `${classAttendancePct}%`,
      description: "avg capacity fill",
      trend: null,
      icon: Calendar,
    },
    {
      title: "Revenue Growth",
      value:
        revenueGrowthPct == null
          ? "--"
          : `${revenueGrowthPct > 0 ? "+" : ""}${revenueGrowthPct}%`,
      description: "vs prev 30 days",
      trend:
        revenueGrowthPct == null ? null : revenueGrowthPct >= 0 ? "up" : "down",
      icon: DollarSign,
    },
    {
      title: "Retention",
      value: retentionPct == null ? "--" : `${retentionPct}%`,
      description: "90+ day cohort",
      trend: null,
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Analytics Dashboard{" "}
              {demoMode && <Sparkles className="h-5 w-5 text-primary" />}
            </h2>
            <p className="text-muted-foreground">
              Track performance and business metrics{" "}
              {demoMode && "(demo data limits)"}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.trend === "up" && (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
                {metric.trend === "down" && (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Classes</CardTitle>
            <CardDescription>Classes by attendance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularClasses.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {dataLoading ? "Loading..." : "No classes yet."}
                </p>
              )}
              {popularClasses.map((classItem) => (
                <div key={classItem.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{classItem.name}</span>
                    <Badge variant="secondary">
                      {classItem.attendancePct}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${classItem.attendancePct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {classItem.enrolled}/{classItem.capacity} enrolled
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col justify-between">
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                {/* Minimal inline bar representation until chart lib is integrated */}
                {revenueHistory.length === 0 && (
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-4" />
                    <p>
                      {dataLoading
                        ? "Loading revenue..."
                        : "No revenue data yet"}
                    </p>
                    <p className="text-xs">Add payments to build history</p>
                  </div>
                )}
                {revenueHistory.length > 0 && (
                  <div className="w-full flex items-end gap-2 h-full px-2">
                    {revenueHistory.map((pt) => {
                      const max = Math.max(
                        ...revenueHistory.map((p) => p.total)
                      );
                      const heightPct =
                        max === 0 ? 0 : Math.round((pt.total / max) * 100);
                      return (
                        <div
                          key={pt.month}
                          className="flex-1 flex flex-col items-center justify-end gap-1"
                        >
                          <div
                            className="w-full bg-primary/20 rounded-sm relative"
                            style={{ height: `${heightPct}%`, minHeight: 4 }}
                          >
                            <div className="absolute inset-x-0 -top-5 text-[10px] text-center font-medium">
                              {pt.total.toLocaleString(undefined, {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              })}
                            </div>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {pt.month.slice(5)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Lightweight preview — integrate a full chart library (e.g.
                Recharts, VisX) for richer visuals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
