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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Users, MapPin, Plus } from "lucide-react";

interface Class {
  id: string;
  name: string;
  instructor: string;
  time: string;
  capacity: number;
  enrolled: number;
  location: string;
  level: string;
  status: string;
  description?: string;
  duration: number;
  price: number;
  ageRange: string;
}

export function ClassScheduling() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock class data
  const [classes, setClasses] = useState<Class[]>([
    {
      id: "1",
      name: "Youth Gymnastics",
      instructor: "Sarah Wilson",
      time: "9:00 AM - 10:30 AM",
      capacity: 12,
      enrolled: 8,
      location: "Main Gym",
      level: "Beginner",
      status: "active",
      description: "Introduction to basic gymnastics skills",
      duration: 90,
      price: 25,
      ageRange: "6-12",
    },
    {
      id: "2",
      name: "Advanced Tumbling",
      instructor: "Mike Johnson",
      time: "11:00 AM - 12:30 PM",
      capacity: 8,
      enrolled: 6,
      location: "Tumbling Area",
      level: "Advanced",
      status: "active",
      description: "Advanced tumbling techniques and tricks",
      duration: 90,
      price: 35,
      ageRange: "13-18",
    },
    {
      id: "3",
      name: "Parkour Basics",
      instructor: "Alex Chen",
      time: "2:00 PM - 3:30 PM",
      capacity: 15,
      enrolled: 12,
      location: "Parkour Zone",
      level: "Beginner",
      status: "active",
      description: "Learn the fundamentals of parkour",
      duration: 90,
      price: 40,
      ageRange: "10-16",
    },
    {
      id: "4",
      name: "Adult Fitness",
      instructor: "Emma Davis",
      time: "6:00 PM - 7:00 PM",
      capacity: 20,
      enrolled: 15,
      location: "Fitness Area",
      level: "All Levels",
      status: "active",
      description: "Fitness class for adults",
      duration: 60,
      price: 30,
      ageRange: "Adult",
    },
  ]);

  const handleAddClass = (formData: FormData) => {
    const startTime = formData.get("startTime") as string;
    const duration = Number.parseInt(formData.get("duration") as string);
    const endTime = new Date(
      new Date(`2000-01-01 ${startTime}`).getTime() + duration * 60000
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newClass: Class = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      instructor: formData.get("instructor") as string,
      time: `${startTime} - ${endTime}`,
      capacity: Number.parseInt(formData.get("capacity") as string),
      enrolled: 0,
      location: formData.get("location") as string,
      level: formData.get("level") as string,
      status: "active",
      description: formData.get("description") as string,
      duration: duration,
      price: Number.parseFloat(formData.get("price") as string),
      ageRange: formData.get("ageRange") as string,
    };
    setClasses([...classes, newClass]);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Class Scheduling</h2>
          <p className="text-muted-foreground">
            Manage classes, schedules, and enrollments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Create a new class with schedule and enrollment details.
              </DialogDescription>
            </DialogHeader>
            <form action={handleAddClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Youth Gymnastics"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select name="instructor" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                      <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                      <SelectItem value="Alex Chen">Alex Chen</SelectItem>
                      <SelectItem value="Emma Davis">Emma Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" name="startTime" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    placeholder="90"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Max Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    placeholder="12"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select name="location" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Gym">Main Gym</SelectItem>
                      <SelectItem value="Tumbling Area">
                        Tumbling Area
                      </SelectItem>
                      <SelectItem value="Parkour Zone">Parkour Zone</SelectItem>
                      <SelectItem value="Fitness Area">Fitness Area</SelectItem>
                      <SelectItem value="Dance Studio">Dance Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Skill Level</Label>
                  <Select name="level" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Class ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageRange">Age Range</Label>
                  <Input
                    id="ageRange"
                    name="ageRange"
                    placeholder="e.g., 6-12, Adult"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Class Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of the class content and objectives..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Class</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Schedule Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <p>Calendar component would go here</p>
              <p className="text-sm">Selected: {selectedDate.toDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Classes List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today&apos;s Classes</CardTitle>
            <CardDescription>January 25, 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        with {classItem.instructor}
                      </p>
                    </div>
                    <Badge
                      variant={
                        classItem.level === "Advanced" ? "default" : "secondary"
                      }
                    >
                      {classItem.level}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {classItem.time}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      {classItem.enrolled}/{classItem.capacity}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {classItem.location}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Enrollment</span>
                      <span>
                        {Math.round(
                          (classItem.enrolled / classItem.capacity) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (classItem.enrolled / classItem.capacity) * 100
                          }%`,
                        }}
                      />
                    </div>
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
