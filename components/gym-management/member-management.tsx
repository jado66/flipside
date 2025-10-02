"use client";

import React, { useState, useMemo, useCallback } from "react";

import { useGym } from "@/contexts/gym/gym-provider";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  Mail,
  Phone,
} from "lucide-react";
import Fuse from "fuse.js";

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
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortKey, setSortKey] = useState<keyof MemberBasic>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
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

  // Sorting
  const sortedMembers = useMemo(() => {
    const list = [...filteredMembers];
    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return -1;
      if (bv == null) return 1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (av < (bv as any)) return sortDir === "asc" ? -1 : 1;
      if (av > (bv as any)) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredMembers, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedMembers.length / pageSize) || 1;
  const pagedMembers = useMemo(() => {
    const start = page * pageSize;
    return sortedMembers.slice(start, start + pageSize);
  }, [sortedMembers, page, pageSize]);

  const toggleSort = useCallback(
    (key: keyof MemberBasic) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

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

  const handleEditMember = async (formData: FormData) => {
    if (!selectedMember) return;

    const status = formData.get("status") as string;
    const validStatus = ["active", "inactive", "suspended"].includes(status)
      ? (status as "active" | "inactive" | "suspended")
      : "active";

    const res = await updateMember(selectedMember.id, {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      membershipType: formData.get("membershipType") as string,
      status: validStatus,
      emergencyContact: formData.get("emergencyContact") as string,
      medicalNotes: (formData.get("medicalNotes") as string) || "",
    });

    if (!res.success) return alert(res.error);
    setIsEditDialogOpen(false);
    setSelectedMember(null);
  };

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, membership..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}/page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
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
                  Create a new member profile with contact and membership info.
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
                <div className="flex justify-end gap-2">
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
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Avatar</TableHead>
              {(
                [
                  ["name", "Name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["membershipType", "Membership"],
                  ["status", "Status"],
                  ["joinDate", "Join Date"],
                  ["lastVisit", "Last Visit"],
                ] as [keyof MemberBasic, string][]
              ).map(([key, label]) => (
                <TableHead key={key}>
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="inline-flex items-center gap-1 hover:underline font-medium"
                    aria-label={`Sort by ${label}`}
                  >
                    {label}
                    <ArrowUpDown
                      className={`h-3 w-3 transition-opacity ${
                        sortKey === key ? "opacity-100" : "opacity-30"
                      }`}
                    />
                  </button>
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="text-muted-foreground">
                    {searchTerm
                      ? "No members found matching your search."
                      : "No members yet. Add your first member to get started."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pagedMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedMember(member as MemberBasic);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          member.avatar ||
                          `/placeholder.svg?height=32&width=32&query=${member.name}`
                        }
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="max-w-[180px] truncate">{member.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground max-w-[200px]">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="max-w-[140px] truncate"
                    >
                      {member.membershipType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`inline-flex items-center gap-1.5 ${getStatusColor(
                        member.status
                      )}`}
                    >
                      {getStatusIcon(member.status)}
                      <span className="capitalize">{member.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.joinDate
                      ? new Date(member.joinDate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>{member.lastVisit || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member as MemberBasic);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMember(member.id);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs text-muted-foreground">
        <div>
          Showing {pagedMembers.length === 0 ? 0 : page * pageSize + 1}–
          {page * pageSize + pagedMembers.length} of {sortedMembers.length}
          {searchTerm && (
            <span className="ml-1">(filtered from {members.length})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </Button>
          <span>
            Page {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
          >
            Next
          </Button>
        </div>
      </div>

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
            <form action={handleEditMember}>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile" type="button">
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="membership" type="button">
                    Membership
                  </TabsTrigger>
                  <TabsTrigger value="activity" type="button">
                    Activity
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        name="name"
                        defaultValue={selectedMember.name}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        name="email"
                        type="email"
                        defaultValue={selectedMember.email}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone</Label>
                      <Input
                        id="edit-phone"
                        name="phone"
                        defaultValue={selectedMember.phone}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-membershipType">
                        Membership Type
                      </Label>
                      <Select
                        name="membershipType"
                        defaultValue={selectedMember.membershipType}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      name="status"
                      defaultValue={selectedMember.status}
                      required
                    >
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-emergency">Emergency Contact</Label>
                    <Input
                      id="edit-emergency"
                      name="emergencyContact"
                      defaultValue={selectedMember.emergencyContact}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-medical">Medical Notes</Label>
                    <Textarea
                      id="edit-medical"
                      name="medicalNotes"
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
                          {new Date(
                            selectedMember.joinDate
                          ).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Payment Status
                        </CardTitle>
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
                      <CardTitle className="text-sm">
                        Recent Check-ins
                      </CardTitle>
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
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Close
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
