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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, CheckCircle, Clock, Users } from "lucide-react";

export function CheckInSystem() {
  const [searchTerm, setSearchTerm] = useState("");

  const todayCheckIns = [
    {
      id: "1",
      member: "Sarah Johnson",
      class: "Youth Gymnastics",
      time: "9:15 AM",
      status: "checked-in",
    },
    {
      id: "2",
      member: "Mike Chen",
      class: "Parkour Basics",
      time: "2:05 PM",
      status: "checked-in",
    },
    {
      id: "3",
      member: "Emma Davis",
      class: "Advanced Tumbling",
      time: "11:10 AM",
      status: "checked-in",
    },
  ];

  const upcomingClasses = [
    {
      id: "1",
      name: "Adult Fitness",
      time: "6:00 PM",
      instructor: "Emma Davis",
      capacity: 20,
      checkedIn: 0,
    },
    {
      id: "2",
      name: "Open Gym",
      time: "7:30 PM",
      instructor: "Staff",
      capacity: 30,
      checkedIn: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Check-in System</h2>
          <p className="text-muted-foreground">
            Manage member check-ins and class attendance
          </p>
        </div>
      </div>

      {/* Quick Check-in */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Check-in</CardTitle>
          <CardDescription>Search for members to check them in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search member name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>Check In</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Today&apos;s Check-ins
            </CardTitle>
            <CardDescription>
              {todayCheckIns.length} members checked in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayCheckIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`/placeholder.svg?height=32&width=32&query=${checkIn.member} avatar`}
                      />
                      <AvatarFallback>
                        {checkIn.member
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{checkIn.member}</p>
                      <p className="text-sm text-muted-foreground">
                        {checkIn.class}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {checkIn.time}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Classes
            </CardTitle>
            <CardDescription>Classes starting soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{classItem.name}</h3>
                    <Badge variant="outline">{classItem.time}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Instructor: {classItem.instructor}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {classItem.checkedIn}/{classItem.capacity}
                    </div>
                    <Button variant="outline" size="sm">
                      View Roster
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
