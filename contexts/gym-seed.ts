// Small, deterministic seed data used for debugging and "start over" flows.
// Keep entries minimal and type-compatible with types/gym-management.ts

import { seedMembers } from "./students-seed";

export { seedMembers };

export const seedClasses = [
  {
    id: "class-1",
    name: "Youth Tumbling",
    instructor: "Coach Jen",
    time: "16:00 - 17:00",
    capacity: 20,
    enrolled: 8,
    location: "Main Gym",
    level: "Beginner",
    status: "active",
    duration: 60,
    price: 15,
    ageRange: "6-12",
  },
  {
    id: "class-2",
    name: "Advanced Parkour",
    instructor: "Mike Johnson",
    time: "18:00 - 19:30",
    capacity: 12,
    enrolled: 10,
    location: "Parkour Hall",
    level: "Advanced",
    status: "active",
    duration: 90,
    price: 20,
    ageRange: "13+",
  },
];

export const seedEquipment = [
  {
    id: "equip-1",
    name: "Balance Beam",
    category: "Gymnastics",
    location: "Main Gym",
    status: "good",
    lastInspection: "2025-07-01",
    nextInspection: "2025-10-01",
    purchaseDate: "2020-03-15",
    warranty: "2026-03-15",
    notes: "Well maintained",
  },
];

export const seedIncidents = [
  {
    id: "inc-1",
    memberName: "Alice Park",
    incidentType: "sprain",
    severity: "minor",
    status: "resolved",
    dateTime: "2025-08-10T10:15:00",
    location: "Main Gym",
    description: "Twisted ankle during tumbling",
    staffMember: "Coach Jen",
    actionTaken: "RICE and rest",
    followUpRequired: false,
  },
];

export const seedWaivers = [
  {
    id: "waiver-1",
    memberName: "Alice Park",
    memberEmail: "alice.park@example.com",
    waiverType: "Standard",
    status: "signed",
    signedDate: "2024-01-10",
    expiryDate: "2026-01-10",
    notes: "",
    archived: false,
  },
];

export const seedStaff = [
  {
    id: "staff-1",
    name: "Coach Jen",
    email: "jen.coach@example.com",
    phone: "555-0404",
    role: "Head Coach",
    specialties: ["Tumbling", "Youth"],
    status: "active",
    schedule: "09:00 - 17:00",
    classes: 5,
    hourlyRate: 25,
    certifications: ["CPR"],
    emergencyContact: "Sam Coach - 555-0505",
    archived: false,
  },
];

export const seedPayments = [
  {
    id: "pay-1",
    member: "Alice Park",
    amount: "$45.00",
    type: "Monthly Membership",
    status: "paid",
    date: "2025-09-01",
    method: "Card",
  },
];

export const ALL_SEEDS = {
  members: seedMembers,
  classes: seedClasses,
  equipment: seedEquipment,
  incidents: seedIncidents,
  waivers: seedWaivers,
  staff: seedStaff,
  payments: seedPayments,
};
