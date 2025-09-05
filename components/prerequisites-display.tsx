// components/prerequisites-display.tsx
"use client";

import Link from "next/link";
import { CheckCircle, ExternalLink } from "lucide-react";
import { PrerequisiteTrick } from "@/types/trick";

interface PrerequisitesDisplayProps {
  prerequisites: string[];
  prerequisiteTricks?: PrerequisiteTrick[];
  className?: string;
}

export function PrerequisitesDisplay({
  prerequisites,
  prerequisiteTricks = [],
  className = "",
}: PrerequisitesDisplayProps) {
  // Create a map for quick lookup
  const trickMap = new Map<string, PrerequisiteTrick>();
  prerequisiteTricks.forEach((trick) => {
    trickMap.set(trick.name.toLowerCase(), trick);
  });

  return (
    <div className={`grid gap-2 ${className}`}>
      {prerequisites.map((prerequisite, index) => {
        const linkedTrick = trickMap.get(prerequisite.toLowerCase());

        if (linkedTrick) {
          // Render as a link to the trick
          return (
            <Link
              key={index}
              href={`/${linkedTrick.subcategory.master_category.slug}/${linkedTrick.subcategory.slug}/${linkedTrick.slug}`}
              className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors group"
            >
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-800 dark:text-emerald-300 font-medium flex-1 group-hover:text-emerald-900 dark:group-hover:text-emerald-200">
                {prerequisite}
              </span>
              <ExternalLink className="h-3 w-3 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          );
        } else {
          // Render as plain text
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg"
            >
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                {prerequisite}
              </span>
            </div>
          );
        }
      })}
    </div>
  );
}
