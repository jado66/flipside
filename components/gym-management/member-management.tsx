"use client";

import React, { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { useGym } from "@/contexts/gym-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Edit,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface MemberBasic {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  status: string;
  joinDate: string;
  lastVisit: string;
  emergencyContact: string;
  medicalNotes: string;
  avatar?: string;
}

export function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberBasic | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { members, addMember, updateMember, removeMember, demoMode, limits } =
    useGym();

  const fuse = useMemo(
    () =>
      new Fuse(members, {
        keys: ["name", "email", "membershipType"],
        threshold: 0.3,
      }),
    [members]
  );

  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim();
    if (!query) return members;
    const results = fuse.search(query);
    return results.map((result) => result.item);
  }, [members, searchTerm, fuse]);

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);
  const pagedMembers = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "inactive":
        return <Clock className="h-3 w-3" />;
      case "suspended":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const handleAddMember = async (formData: FormData) => {
    const res = await addMember({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      membershipType: formData.get("membershipType") as string,
      status: "active",
      emergencyContact: formData.get("emergencyContact") as string,
      medicalNotes: (formData.get("medicalNotes") as string) || "",
      avatar: undefined,
    });
    if (!res.success) return alert(res.error);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={demoMode && members.length >= limits.members}>
              <Plus className="h-4 w-4 mr-2" />
              {demoMode && members.length >= limits.members
                ? "Demo Limit"
                : "Add Member"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Create a new member profile with contact and membership
                information.
              </DialogDescription>
            </DialogHeader>
            <form action={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="membershipType">Membership Type</Label>
                  <Select name="membershipType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select membership" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Premium Gymnastics">
                        Premium Gymnastics
                      </SelectItem>
                      <SelectItem value="Basic Gymnastics">
                        Basic Gymnastics
                      </SelectItem>
                      <SelectItem value="Parkour Basic">
                        Parkour Basic
                      </SelectItem>
                      <SelectItem value="Parkour Advanced">
                        Parkour Advanced
                      </SelectItem>
                      <SelectItem value="Youth Tumbling">
                        Youth Tumbling
                      </SelectItem>
                      <SelectItem value="Adult Fitness">
                        Adult Fitness
                      </SelectItem>
                      <SelectItem value="Open Gym">Open Gym</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              <div className="space-y-2">
                <Label htmlFor="medicalNotes">Medical Notes</Label>
                <Textarea
                  id="medicalNotes"
                  name="medicalNotes"
                  placeholder="Any medical conditions, allergies, or notes..."
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
                <Button type="submit">Add Member</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members List */}
      <div className="grid gap-4">
        {pagedMembers.map((member: any) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        member.avatar ||
                        `/placeholder.svg?height=48&width=48&query=${member.name} avatar`
                      }
                    />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                      <Badge variant="secondary">{member.membershipType}</Badge>
                      <Badge className={getStatusColor(member.status)}>
                        {getStatusIcon(member.status)}
                        <span className="ml-1 capitalize">{member.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm text-muted-foreground">
                    <div>
                      Joined: {new Date(member.joinDate).toLocaleDateString()}
                    </div>
                    <div>Last visit: {member.lastVisit}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMember(member);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Member Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              View and edit member information
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="membership">Membership</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input id="edit-name" defaultValue={selectedMember.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      defaultValue={selectedMember.email}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      defaultValue={selectedMember.phone}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select defaultValue={selectedMember.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-emergency">Emergency Contact</Label>
                  <Input
                    id="edit-emergency"
                    defaultValue={selectedMember.emergencyContact}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-medical">Medical Notes</Label>
                  <Textarea
                    id="edit-medical"
                    defaultValue={selectedMember.medicalNotes}
                  />
                </div>
              </TabsContent>
              <TabsContent value="membership" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Current Membership
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">
                        {selectedMember.membershipType}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Active since{" "}
                        {new Date(selectedMember.joinDate).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold text-green-600">Current</p>
                      <p className="text-sm text-muted-foreground">
                        Next payment: Feb 15, 2024
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Check-ins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Advanced Tumbling</span>
                        <span className="text-muted-foreground">
                          Jan 25, 2024
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Open Gym</span>
                        <span className="text-muted-foreground">
                          Jan 23, 2024
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Strength Training</span>
                        <span className="text-muted-foreground">
                          Jan 20, 2024
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Close
            </Button>
            <Button>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
