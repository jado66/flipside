// components/prerequisites-form-field.tsx
// Enhanced prerequisites field with autocomplete for existing tricks

"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Trash2, Search, Check } from "lucide-react";
import { searchPotentialPrerequisites } from "@/lib/tricks-data";

interface PrerequisitesFormFieldProps {
  prerequisites: string[];
  onChange: (prerequisites: string[]) => void;
  subcategoryId?: string;
  currentTrickId?: string; // Add this to exclude current trick from suggestions
}

export function PrerequisitesFormField({
  prerequisites,
  onChange,
  subcategoryId,
  currentTrickId,
}: PrerequisitesFormFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Fetch trick suggestions when input changes with better debouncing
  useEffect(() => {
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Don't search for very short inputs
    if (inputValue.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Show loading immediately for better UX
    setLoading(true);

    // Set new timeout with shorter delay for better responsiveness
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchPotentialPrerequisites(
          inputValue,
          subcategoryId,
          currentTrickId // Pass the current trick ID to exclude it
        );
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 150); // Reduced from 300ms to 150ms for better responsiveness

    // Cleanup function
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, subcategoryId, currentTrickId]);

  const addPrerequisite = (value: string) => {
    const trimmedValue = value.trim();
    if (
      trimmedValue &&
      !prerequisites.some((p) => p.toLowerCase() === trimmedValue.toLowerCase())
    ) {
      onChange([...prerequisites, trimmedValue]);
      setInputValue("");
      setOpen(false);
    }
  };

  const removePrerequisite = (index: number) => {
    onChange(prerequisites.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Prerequisites</Label>
        {prerequisites.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {prerequisites.length}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {/* Display existing prerequisites */}
        {prerequisites.map((prereq, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 bg-muted rounded-lg"
          >
            <span className="flex-1 text-sm">{prereq}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePrerequisite(index)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Add new prerequisite with autocomplete */}
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (e.target.value.length >= 2) {
                      setOpen(true);
                    }
                  }}
                  onFocus={() => {
                    if (inputValue.length >= 2) {
                      setOpen(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (inputValue.trim()) {
                        addPrerequisite(inputValue);
                      }
                    } else if (e.key === "Escape") {
                      setOpen(false);
                    }
                  }}
                  placeholder="Type a prerequisite or search for existing tricks..."
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : suggestions.length > 0 ? (
                <Command>
                  <CommandGroup>
                    {suggestions.map((trick) => (
                      <CommandItem
                        key={trick.id}
                        onSelect={() => {
                          addPrerequisite(trick.name);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            prerequisites.some(
                              (p) =>
                                p.toLowerCase() === trick.name.toLowerCase()
                            )
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {trick.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              ) : inputValue.length >= 2 ? (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    No existing tricks found
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => addPrerequisite(inputValue)}
                    className="w-full"
                  >
                    Add "{inputValue}" as custom prerequisite
                  </Button>
                </div>
              ) : null}
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (inputValue.trim()) {
                addPrerequisite(inputValue);
              }
            }}
            disabled={!inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Add prerequisites by typing trick names or custom requirements.
          Matching tricks will be automatically linked.
        </p>
      </div>
    </div>
  );
}
