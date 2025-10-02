export type ViewMode = "grid" | "list" | "table";
export type SortField =
  | "name"
  | "instructor"
  | "enrolled"
  | "capacity"
  | "location";
export type SortOrder = "asc" | "desc";

export interface CapacityStatus {
  color: "destructive" | "default" | "secondary";
  text: string;
}

export function getCapacityStatus(
  enrolled: number,
  capacity: number
): CapacityStatus {
  const percentage = (enrolled / capacity) * 100;
  if (percentage >= 100) return { color: "destructive", text: "Full" };
  if (percentage >= 80) return { color: "default", text: "Almost Full" };
  if (percentage >= 50) return { color: "secondary", text: "Available" };
  return { color: "secondary", text: "Open" };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getEnrollmentPercentage(
  enrolled: number,
  capacity: number
): number {
  return (enrolled / capacity) * 100;
}
