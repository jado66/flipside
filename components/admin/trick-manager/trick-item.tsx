"use client";

import { Trick } from "@/types/trick-manager";
export function TrickItem({
  trick,
  categoryColor,
}: {
  trick: Trick;
  categoryColor: string;
}) {
  return (
    <div className="p-3 rounded-lg border-2 bg-white border-gray-300 shadow-lg">
      <div className="font-semibold text-sm mb-1">{trick.name}</div>
      {trick.difficulty_level && (
        <div
          className="text-xs font-medium mb-1"
          style={{ color: categoryColor }}
        >
          Difficulty: {trick.difficulty_level}/10
        </div>
      )}
      {trick.description && (
        <div className="text-xs text-gray-500 line-clamp-2">
          {trick.description}
        </div>
      )}
    </div>
  );
}
