"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  Search,
  Plus,
  UserPlus,
  CreditCard,
  CheckCircle,
  Wrench,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { MemberManagement } from "@/components/gym-management/member-management";
import { ClassScheduling } from "@/components/gym-management/class-scheduling";
import { StaffDashboard } from "@/components/gym-management/staff-dashboard";
import { PaymentProcessing } from "@/components/gym-management/payment-processing";
import { CheckInSystem } from "@/components/gym-management/check-in-system";
import { AnalyticsDashboard } from "@/components/gym-management/analytics-dashboard";
import { EquipmentManagement } from "@/components/gym-management/equipment-management";
import { WaiverManagement } from "@/components/gym-management/waiver-management";
import { IncidentReporting } from "@/components/gym-management/incident-reporting";

export default function GymManagementDashboard() {
  const [activeTab, setActiveTab] = useState("members");

  // Mock data for dashboard stats
  const stats = [
    {
      title: "Total Members",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Classes",
      value: "45",
      change: "+3",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: "$24,500",
      change: "+8%",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Check-ins Today",
      value: "89",
      change: "+15%",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  const recentActivity = [
    {
      type: "member",
      name: "Sarah Johnson",
      action: "Joined gymnastics program",
      time: "2 min ago",
    },
    {
      type: "payment",
      name: "Mike Chen",
      action: "Payment received - $120",
      time: "5 min ago",
    },
    {
      type: "checkin",
      name: "Emma Davis",
      action: "Checked in for Advanced Tumbling",
      time: "8 min ago",
    },
    {
      type: "class",
      name: "Youth Parkour",
      action: "Class completed - 12 attendees",
      time: "15 min ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">GymFlow Pro</h1>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members, classes..."
                className="w-64 pl-10"
              />
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>GM</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r bg-card p-6">
          <div className="space-y-2">
            <Button
              variant={activeTab === "members" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("members")}
            >
              <Users className="h-4 w-4 mr-2" />
              Members
            </Button>
            <Button
              variant={activeTab === "classes" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("classes")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Classes
            </Button>
            <Button
              variant={activeTab === "staff" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("staff")}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Staff
            </Button>
            <Button
              variant={activeTab === "equipment" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("equipment")}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Equipment
            </Button>
            <Button
              variant={activeTab === "payments" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("payments")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </Button>
            <Button
              variant={activeTab === "checkin" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("checkin")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Check-in
            </Button>
            <Button
              variant={activeTab === "waivers" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("waivers")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Waivers
            </Button>
            <Button
              variant={activeTab === "incidents" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("incidents")}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incidents
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("analytics")}
            >
              <Activity className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "members" && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {stat.change} from last month
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Member Management</CardTitle>
                    <CardDescription>
                      Manage your gym members, memberships, and profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MemberManagement />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {activity.type === "member" && (
                              <Users className="h-4 w-4 text-blue-600" />
                            )}
                            {activity.type === "payment" && (
                              <DollarSign className="h-4 w-4 text-green-600" />
                            )}
                            {activity.type === "checkin" && (
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                            )}
                            {activity.type === "class" && (
                              <Calendar className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {activity.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "classes" && <ClassScheduling />}
          {activeTab === "staff" && <StaffDashboard />}
          {activeTab === "equipment" && <EquipmentManagement />}
          {activeTab === "payments" && <PaymentProcessing />}
          {activeTab === "checkin" && <CheckInSystem />}
          {activeTab === "waivers" && <WaiverManagement />}
          {activeTab === "incidents" && <IncidentReporting />}
          {activeTab === "analytics" && <AnalyticsDashboard />}
        </main>
      </div>
    </div>
  );
}
