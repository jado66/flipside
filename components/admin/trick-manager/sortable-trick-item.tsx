"use client";
import { useState, useEffect } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Save, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { createBrowserClient } from "@supabase/ssr";
import {
  MasterCategory,
  Subcategory,
  Trick,
  TrickFormData,
} from "@/types/trick-manager";
export function SortableTrickItem({
  trick,
  isModified,
  categoryColor,
}: {
  trick: Trick;
  isModified: boolean;
  categoryColor: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: trick.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        p-3 rounded-lg border-2 cursor-move transition-all relative
        ${isDragging ? "opacity-50 z-50" : ""}
        ${
          isModified
            ? "bg-yellow-50 border-yellow-400 shadow-lg"
            : "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
        }
      `}
    >
      {isModified && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          !
        </div>
      )}
      <div className="font-semibold text-sm mb-1">{trick.name}</div>
    </div>
  );
}
