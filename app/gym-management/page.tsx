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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  Menu,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const navigationItems = [
    { id: "members", label: "Members", icon: Users },
    { id: "classes", label: "Classes", icon: Calendar },
    { id: "staff", label: "Staff", icon: UserPlus },
    { id: "equipment", label: "Equipment", icon: Wrench },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "checkin", label: "Check-in", icon: CheckCircle },
    { id: "waivers", label: "Waivers", icon: FileText },
    { id: "incidents", label: "Incidents", icon: AlertTriangle },
    { id: "analytics", label: "Analytics", icon: Activity },
  ];

  const NavigationContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="space-y-2">
      {navigationItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => {
            setActiveTab(item.id);
            onItemClick?.();
          }}
        >
          <item.icon className="h-4 w-4 mr-2" />
          {item.label}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Activity className="h-6 w-6 text-primary" />
                  <h2 className="text-lg font-bold">GymFlow Pro</h2>
                </div>
                <NavigationContent onItemClick={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold hidden sm:block">GymFlow Pro</h1>
              <h1 className="text-lg font-bold sm:hidden">GymFlow</h1>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-2 md:space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members, classes..."
                className="w-48 md:w-64 pl-10"
              />
            </div>
            <Button size="icon" className="sm:hidden">
              <Search className="h-4 w-4" />
            </Button>
            <Button size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
            <Button size="icon" className="sm:hidden">
              <Plus className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>GM</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="hidden md:block w-64 border-r bg-card p-6">
          <NavigationContent />
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {activeTab === "members" && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
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
