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
} from "lucide-react";

export function AnalyticsDashboard() {
  const metrics = [
    {
      title: "Member Growth",
      value: "+12%",
      description: "vs last month",
      trend: "up",
      icon: Users,
    },
    {
      title: "Class Attendance",
      value: "87%",
      description: "average attendance",
      trend: "up",
      icon: Calendar,
    },
    {
      title: "Revenue Growth",
      value: "+8%",
      description: "vs last month",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Member Retention",
      value: "94%",
      description: "12-month retention",
      trend: "up",
      icon: Activity,
    },
  ];

  const popularClasses = [
    { name: "Youth Gymnastics", attendance: 95, capacity: 100 },
    { name: "Parkour Basics", attendance: 88, capacity: 100 },
    { name: "Adult Fitness", attendance: 82, capacity: 100 },
    { name: "Advanced Tumbling", attendance: 78, capacity: 100 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Track performance and business metrics
        </p>
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
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
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
              {popularClasses.map((classItem, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{classItem.name}</span>
                    <Badge variant="secondary">{classItem.attendance}%</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${classItem.attendance}%` }}
                    />
                  </div>
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
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4" />
                <p>Revenue chart would go here</p>
                <p className="text-sm">
                  Integration with charting library needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
