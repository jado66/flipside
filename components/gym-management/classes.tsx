"use client";

import React, { useMemo, useState } from "react";
import { useGym } from "@/contexts/gym-provider";
import { Member, ClassItem } from "@/types/gym-management";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function Classes() {
  const { classes, members, addClass, updateClass, demoMode, limits } =
    useGym();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);

  const handleCreate = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const instructor = formData.get("instructor") as string;
    const capacity = Number.parseInt(
      (formData.get("capacity") as string) || "0"
    );
    const location = formData.get("location") as string;
    const duration = Number.parseInt(
      (formData.get("duration") as string) || "60"
    );
    const price = Number.parseFloat((formData.get("price") as string) || "0");
    await addClass({
      name,
      instructor,
      time: "TBD",
      capacity,
      location,
      level: "All Levels",
      status: "active",
      description: "",
      duration,
      price,
      ageRange: "All",
      students: [],
      enrolled: 0,
    } as any);
    setIsOpen(false);
  };

  const enroll = async (classItem: ClassItem, member: Member) => {
    if ((classItem.students || []).includes(member.id)) return;
    if (classItem.enrolled >= classItem.capacity) {
      alert("Class is full");
      return;
    }
    const students = Array.from(
      new Set([...(classItem.students || []), member.id])
    );
    await updateClass(classItem.id, { students, enrolled: students.length });
  };

  const unenroll = async (classItem: ClassItem, member: Member) => {
    if (!classItem.students || !classItem.students.includes(member.id)) return;
    const students = (classItem.students || []).filter(
      (id) => id !== member.id
    );
    await updateClass(classItem.id, { students, enrolled: students.length });
  };

  const membersById = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach((m: any) => map.set(m.id, m));
    return map;
  }, [members]);

  // Manage students dialog state (scalable search + pagination)
  const [manageOpen, setManageOpen] = useState(false);
  const [manageClass, setManageClass] = useState<ClassItem | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const openManage = (c: ClassItem) => {
    setManageClass(c);
    setSearch("");
    setPage(0);
    setManageOpen(true);
  };

  const filteredMembers = useMemo(() => {
    if (!members) return [] as Member[];
    const q = search.trim().toLowerCase();
    if (!q) return members as Member[];
    return (members as Member[]).filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.phone || "").toLowerCase().includes(q)
    );
  }, [members, search]);

  const pagedMembers = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Classes</h2>
          <p className="text-muted-foreground">
            Manage classes and enroll students
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button disabled={demoMode && classes.length >= limits.classes}>
              {demoMode && classes.length >= limits.classes
                ? "Demo Limit"
                : "Create Class"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Class</DialogTitle>
              <DialogDescription>
                Create a new class offering.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input id="instructor" name="instructor" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    defaultValue={12}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    defaultValue={60}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={0}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue="Main Gym" />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {classes.map((c: any) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>Instructor: {c.instructor}</div>
                <div>
                  Enrolled: {c.enrolled}/{c.capacity}
                </div>
                <div>Location: {c.location}</div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Students</div>
                  <div>
                    <Button size="sm" onClick={() => openManage(c)}>
                      Manage Students
                    </Button>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {(c.students || []).slice(0, 6).map((id: string) => {
                    const m = membersById.get(id);
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between"
                      >
                        <div>{m ? m.name : id}</div>
                        <div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unenroll(c, m!)}
                          >
                            Unenroll
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {(c.students || []).length > 6 && (
                    <div className="text-xs text-muted-foreground">
                      And {(c.students || []).length - 6} more…
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ManageStudentsDialog
        open={manageOpen}
        onOpenChange={(v) => setManageOpen(v)}
        classItem={manageClass}
        members={members}
        search={search}
        setSearch={setSearch}
        page={page}
        setPage={setPage}
        pageSize={PAGE_SIZE}
        pagedMembers={pagedMembers as any}
        filteredCount={filteredMembers.length}
        enroll={async (c, m) => {
          await enroll(c, m);
        }}
        unenroll={async (c, m) => {
          await unenroll(c, m);
        }}
      />
    </div>
  );
}

// Manage Students Dialog (placed here to keep file self-contained)
function ManageStudentsDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classItem: ClassItem | null;
  members: Member[];
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  pagedMembers: Member[];
  filteredCount: number;
  enroll: (c: ClassItem, m: Member) => Promise<void>;
  unenroll: (c: ClassItem, m: Member) => Promise<void>;
}) {
  const {
    open,
    onOpenChange,
    classItem,
    members,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    pagedMembers,
    filteredCount,
    enroll,
    unenroll,
  } = props;

  if (!classItem) return null;

  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Students — {classItem.name}</DialogTitle>
          <DialogDescription>
            Search and enroll/unenroll students (page {page + 1} of {totalPages}
            ).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name, email or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <div className="text-sm text-muted-foreground">
              {filteredCount} results
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-auto">
            {pagedMembers.map((m) => {
              const enrolled = (classItem.students || []).includes(m.id);
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.email} • {m.phone}
                    </div>
                  </div>
                  <div>
                    {enrolled ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unenroll(classItem, m)}
                      >
                        Unenroll
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => enroll(classItem, m)}>
                        Enroll
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Page {page + 1} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page <= 0}
              >
                Prev
              </Button>
              <Button
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
