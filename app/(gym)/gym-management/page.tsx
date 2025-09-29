"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle,
} from "lucide-react";

// Import existing components
import { MemberManagement } from "@/components/gym-management/member-management";
import { ClassScheduling } from "@/components/gym-management/class-scheduling";
import { Classes } from "@/components/gym-management/classes";
import { StaffManagement } from "@/components/gym-management/staff-management";
import { PaymentProcessing } from "@/components/gym-management/payment-processing";
import { CheckInSystem } from "@/components/gym-management/check-in-system";
import { AnalyticsDashboard } from "@/components/gym-management/analytics-dashboard";
import { EquipmentManagement } from "@/components/gym-management/equipment-management";
import { WaiverManagement } from "@/components/gym-management/waiver-management";
import { IncidentReporting } from "@/components/gym-management/incident-reporting";
import StaffPortal from "@/components/gym-management/staff-dashboard";
import InventoryManagement from "@/components/gym-management/store/store-management";

// Import the new components we created
import { GymManagementLayout } from "@/components/gym-management/gym-management-layout";
import {
  GymSetupProvider,
  useGymSetup,
} from "@/contexts/gym/gym-setup-provider";
import GymSetupWizard from "@/components/gym-management/setup/GymSetupWizard";

// Main dashboard component that renders after setup
function GymManagementDashboard() {
  const [activeTab, setActiveTab] = useState("members");
  const [viewMode, setViewMode] = useState<"manager" | "staff">("manager");
  const { enabledApps } = useGymSetup();

  // Set initial active tab to first enabled app
  React.useEffect(() => {
    if (
      enabledApps.length > 0 &&
      !enabledApps.find((app) => app.id === activeTab)
    ) {
      setActiveTab(enabledApps[0].id);
    }
  }, [enabledApps, activeTab]);

  // Mock stats - in real app these would come from your data provider
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
    <GymManagementLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      viewMode={viewMode}
      onChangeViewMode={setViewMode}
    >
      {viewMode === "staff" ? (
        <StaffPortal />
      ) : (
        <>
          {activeTab === "members" && (
            <div className="space-y-6">
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
                  <CardHeader className="pb-3 py-3">
                    <CardTitle className="text-sm font-semibold">
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-xs leading-tight"
                        >
                          <div className="mt-0.5 text-muted-foreground">
                            {activity.type === "member" && (
                              <Users className="h-3 w-3 text-blue-600" />
                            )}
                            {activity.type === "payment" && (
                              <DollarSign className="h-3 w-3 text-green-600" />
                            )}
                            {activity.type === "checkin" && (
                              <CheckCircle className="h-3 w-3 text-purple-600" />
                            )}
                            {activity.type === "class" && (
                              <Calendar className="h-3 w-3 text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {activity.name}
                            </p>
                            <p className="text-muted-foreground truncate">
                              {activity.action}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
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
          {activeTab === "classes" && <Classes />}
          {activeTab === "scheduling" && <ClassScheduling />}
          {activeTab === "staff" && <StaffManagement />}
          {activeTab === "equipment" && <EquipmentManagement />}
          {activeTab === "payments" && <PaymentProcessing />}
          {activeTab === "checkin" && <CheckInSystem />}
          {activeTab === "waivers" && <WaiverManagement />}
          {activeTab === "incidents" && <IncidentReporting />}
          {activeTab === "analytics" && <AnalyticsDashboard />}
          {activeTab === "store" && <InventoryManagement />}
        </>
      )}
    </GymManagementLayout>
  );
}

// Page export (wrap providers here since this is a page component, not an app root)
export default function GymManagementPage() {
  // Single provider handles both setup & dynamic nav; legacy nav provider removed
  return (
    <GymSetupProvider>
      <GymManagementGate />
    </GymSetupProvider>
  );
}

function GymManagementGate() {
  const { isSetupComplete } = useGymSetup();
  if (!isSetupComplete) return <GymSetupWizard />;
  return <GymManagementDashboard />;
}
