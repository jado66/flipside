"use client";

import { useState } from "react";
import { useGym } from "@/contexts/gym-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Clock, Calendar, Plus, Phone, Mail } from "lucide-react";

// Local interface no longer needed (types come from provider) but kept minimal if TS needs shape hints
interface StaffMemberBasic {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  specialties: string[];
  schedule: string;
  classes: number;
  hourlyRate: number;
  certifications: string[];
  emergencyContact: string;
}

export function StaffDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { staff, addStaff, archiveStaff, removeStaff, demoMode, limits } =
    useGym();

  const handleAddStaff = async (formData: FormData) => {
    const specialties = (formData.get("specialties") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const certifications = (formData.get("certifications") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await addStaff({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as string,
      specialties,
      status: "active",
      schedule: `${formData.get("startTime")} - ${formData.get("endTime")}`,
      hourlyRate: Number.parseFloat(formData.get("hourlyRate") as string),
      certifications,
      emergencyContact: formData.get("emergencyContact") as string,
    });
    if (!res.success) {
      alert(res.error);
      return;
    }
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">
            Manage coaches, instructors, and staff schedules
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={demoMode && staff.length >= limits.staff}>
              <Plus className="h-4 w-4 mr-2" />
              {demoMode && staff.length >= limits.staff
                ? "Demo Limit"
                : "Add Staff"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Add a new coach or instructor to your team.
              </DialogDescription>
            </DialogHeader>
            <form action={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Head Coach">Head Coach</SelectItem>
                      <SelectItem value="Gymnastics Coach">
                        Gymnastics Coach
                      </SelectItem>
                      <SelectItem value="Parkour Instructor">
                        Parkour Instructor
                      </SelectItem>
                      <SelectItem value="Tumbling Coach">
                        Tumbling Coach
                      </SelectItem>
                      <SelectItem value="Fitness Instructor">
                        Fitness Instructor
                      </SelectItem>
                      <SelectItem value="Assistant Coach">
                        Assistant Coach
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" name="startTime" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" name="endTime" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialties">
                  Specialties (comma-separated)
                </Label>
                <Input
                  id="specialties"
                  name="specialties"
                  placeholder="e.g., Gymnastics, Tumbling, Parkour"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certifications">
                  Certifications (comma-separated)
                </Label>
                <Textarea
                  id="certifications"
                  name="certifications"
                  placeholder="e.g., USA Gymnastics Safety Certified, CPR/First Aid"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  placeholder="Name - Phone Number"
                  required
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
                <Button type="submit">Add Staff Member</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {staff.map((member: any) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={`/placeholder.svg?height=64&width=64&query=${member.name} coach`}
                    />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-xl">{member.name}</h3>
                    <p className="text-muted-foreground">{member.role}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {member.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {member.phone}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {member.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {member.schedule}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {member.classes} classes today
                  </div>
                  <div className="text-sm font-medium">
                    ${member.hourlyRate}/hour
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Schedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => archiveStaff(member.id)}
                    >
                      Archive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStaff(member.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
