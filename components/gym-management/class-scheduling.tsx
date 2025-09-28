"use client";

import { useState } from "react";
import { useGym } from "@/contexts/gym-provider";
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
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { ClassItem } from "@/types/gym-management";

export function ClassScheduling() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const { classes, addClass, updateClass, removeClass, demoMode, limits } =
    useGym();

  const handleAddClass = async (formData: FormData) => {
    const startTime = formData.get("startTime") as string;
    const duration = Number.parseInt(formData.get("duration") as string);
    const endTime = new Date(
      new Date(`2000-01-01 ${startTime}`).getTime() + duration * 60000
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const result = await addClass({
      name: formData.get("name") as string,
      instructor: formData.get("instructor") as string,
      time: `${startTime} - ${endTime}`,
      capacity: Number.parseInt(formData.get("capacity") as string),
      enrolled: 0,
      location: formData.get("location") as string,
      level: formData.get("level") as string,
      status: "active",
      description: formData.get("description") as string,
      duration,
      price: Number.parseFloat(formData.get("price") as string),
      ageRange: formData.get("ageRange") as string,
    });
    if (!result.success) return alert(result.error);
    setIsAddDialogOpen(false);
  };

  const handleEditClass = async (formData: FormData) => {
    if (!editing) return;
    const partial: Partial<ClassItem> = {
      name: formData.get("name") as string,
      instructor: formData.get("instructor") as string,
      location: formData.get("location") as string,
      level: formData.get("level") as string,
      description: formData.get("description") as string,
      price: Number.parseFloat(formData.get("price") as string),
      ageRange: formData.get("ageRange") as string,
    };
    const durationRaw = formData.get("duration") as string;
    if (durationRaw) partial.duration = Number.parseInt(durationRaw);
    const capacityRaw = formData.get("capacity") as string;
    if (capacityRaw) partial.capacity = Number.parseInt(capacityRaw);
    const startTime = formData.get("startTime") as string;
    if (startTime && partial.duration) {
      const endTime = new Date(
        new Date(`2000-01-01 ${startTime}`).getTime() + partial.duration * 60000
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      partial.time = `${startTime} - ${endTime}`;
    }
    const res = await updateClass(editing.id, partial);
    if (!res.success) alert(res.error);
    setIsEditDialogOpen(false);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Delete this class?")) return;
    await removeClass(id);
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
            <Button disabled={demoMode && classes.length >= limits.classes}>
              <Plus className="h-4 w-4 mr-2" />
              {demoMode && classes.length >= limits.classes
                ? "Demo Limit"
                : "Add Class"}
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
                      <SelectItem value="Studio A">Studio A</SelectItem>
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(classItem);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(classItem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Modify class details.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form action={handleEditClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Class Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editing.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-instructor">Instructor</Label>
                  <Input
                    id="edit-instructor"
                    name="instructor"
                    defaultValue={editing.instructor}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start">Start Time</Label>
                  <Input id="edit-start" name="startTime" type="time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (min)</Label>
                  <Input
                    id="edit-duration"
                    name="duration"
                    type="number"
                    defaultValue={editing.duration}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    name="capacity"
                    type="number"
                    defaultValue={editing.capacity}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    name="location"
                    defaultValue={editing.location}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Level</Label>
                  <Input
                    id="edit-level"
                    name="level"
                    defaultValue={editing.level}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editing.price}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-age">Age Range</Label>
                  <Input
                    id="edit-age"
                    name="ageRange"
                    defaultValue={editing.ageRange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editing.description}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
