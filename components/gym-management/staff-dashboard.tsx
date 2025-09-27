"use client";

import { useState } from "react";
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

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialties: string[];
  status: string;
  schedule: string;
  classes: number;
  hourlyRate: number;
  certifications: string[];
  emergencyContact: string;
}

export function StaffDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: "1",
      name: "Sarah Wilson",
      email: "sarah.wilson@gym.com",
      phone: "(555) 123-4567",
      role: "Head Coach",
      specialties: ["Gymnastics", "Tumbling"],
      status: "active",
      schedule: "9:00 AM - 5:00 PM",
      classes: 4,
      hourlyRate: 35,
      certifications: ["USA Gymnastics Safety Certified", "CPR/First Aid"],
      emergencyContact: "John Wilson - (555) 987-6543",
    },
    {
      id: "2",
      name: "Mike Johnson",
      email: "mike.johnson@gym.com",
      phone: "(555) 234-5678",
      role: "Gymnastics Coach",
      specialties: ["Advanced Gymnastics", "Competition Prep"],
      status: "active",
      schedule: "10:00 AM - 6:00 PM",
      classes: 3,
      hourlyRate: 40,
      certifications: ["USA Gymnastics Safety Certified"],
      emergencyContact: "Jane Johnson - (555) 876-5432",
    },
    {
      id: "3",
      name: "Alex Chen",
      email: "alex.chen@gym.com",
      phone: "(555) 345-6789",
      role: "Parkour Instructor",
      specialties: ["Parkour", "Freerunning"],
      status: "active",
      schedule: "1:00 PM - 9:00 PM",
      classes: 5,
      hourlyRate: 45,
      certifications: ["Parkour Safety Certified"],
      emergencyContact: "Alice Chen - (555) 765-4321",
    },
  ]);

  const handleAddStaff = (formData: FormData) => {
    const specialties = (formData.get("specialties") as string)
      .split(",")
      .map((s) => s.trim());
    const certifications = (formData.get("certifications") as string)
      .split(",")
      .map((s) => s.trim());

    const newStaff: StaffMember = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as string,
      specialties: specialties,
      status: "active",
      schedule: `${formData.get("startTime")} - ${formData.get("endTime")}`,
      classes: 0,
      hourlyRate: Number.parseFloat(formData.get("hourlyRate") as string),
      certifications: certifications,
      emergencyContact: formData.get("emergencyContact") as string,
    };
    setStaff([...staff, newStaff]);
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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
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
        {staff.map((member) => (
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
                  <Button variant="outline" size="sm">
                    View Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
