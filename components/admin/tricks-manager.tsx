"use client";
import { useState, useEffect } from "react";
import React from "react";

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
import { supabase } from "@/lib/supabase/supabase-client";

// Mock data for when Supabase is not configured
const mockCategories = [
  {
    id: "1",
    name: "Skateboarding",
    slug: "skateboarding",
    color: "#ea580c",
    icon_name: "skateboard",
  },
  { id: "2", name: "BMX", slug: "bmx", color: "#dc2626", icon_name: "bike" },
  {
    id: "3",
    name: "Parkour",
    slug: "parkour",
    color: "#16a34a",
    icon_name: "run",
  },
];

const mockSubcategories = [
  { id: "1", name: "Street", slug: "street", master_category_id: "1" },
  { id: "2", name: "Vert", slug: "vert", master_category_id: "1" },
  { id: "3", name: "Flatland", slug: "flatland", master_category_id: "2" },
  { id: "4", name: "Street", slug: "bmx-street", master_category_id: "2" },
  { id: "5", name: "Vaults", slug: "vaults", master_category_id: "3" },
  { id: "6", name: "Precision", slug: "precision", master_category_id: "3" },
];

const mockTricks = [
  {
    id: "1",
    name: "Ollie",
    slug: "ollie",
    description: "Basic skateboard jump",
    difficulty_level: 1,
    subcategory_id: "1",
  },
  {
    id: "2",
    name: "Kickflip",
    slug: "kickflip",
    description: "Board flips under feet",
    difficulty_level: 3,
    subcategory_id: "1",
  },
  {
    id: "3",
    name: "Heelflip",
    slug: "heelflip",
    description: "Board flips opposite direction",
    difficulty_level: 3,
    subcategory_id: "1",
  },
  {
    id: "4",
    name: "360 Flip",
    slug: "360-flip",
    description: "Board spins and flips",
    difficulty_level: 7,
    subcategory_id: "1",
  },
  {
    id: "5",
    name: "Frontside Air",
    slug: "frontside-air",
    description: "Grab board in transition",
    difficulty_level: 5,
    subcategory_id: "2",
  },
  {
    id: "6",
    name: "Backside Air",
    slug: "backside-air",
    description: "Grab board backside",
    difficulty_level: 5,
    subcategory_id: "2",
  },
  {
    id: "7",
    name: "Tailwhip",
    slug: "tailwhip",
    description: "Bike frame spins around bars",
    difficulty_level: 4,
    subcategory_id: "4",
  },
  {
    id: "8",
    name: "Barspin",
    slug: "barspin",
    description: "Handlebars spin 360",
    difficulty_level: 3,
    subcategory_id: "4",
  },
  {
    id: "9",
    name: "Safety Vault",
    slug: "safety-vault",
    description: "Basic vault over obstacle",
    difficulty_level: 2,
    subcategory_id: "5",
  },
  {
    id: "10",
    name: "Kong Vault",
    slug: "kong-vault",
    description: "Dive through arms",
    difficulty_level: 4,
    subcategory_id: "5",
  },
  {
    id: "11",
    name: "Orphaned Trick",
    slug: "orphaned",
    description: "Trick without subcategory",
    difficulty_level: null,
    subcategory_id: null,
  },
];

// Types
interface Trick {
  id: string;
  name: string;
  slug: string;
  description?: string;
  difficulty_level: number | null;
  subcategory_id?: string | null;
  subcategory?: {
    id: string;
    name: string;
    slug: string;
    master_category?: {
      name: string;
      slug: string;
      color: string | null;
    };
  };
}

interface MasterCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon_name: string | null;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  master_category_id: string;
}

interface TrickFormData {
  name: string;
  description: string;
  difficulty_level: number;
  subcategory_id: string;
}

// Drag and Drop Context
interface DragItem {
  trickId: string;
  fromSubcategory: string | null;
  fromDifficulty: number | null;
}

export function TricksGridManager() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [originalTricks, setOriginalTricks] = useState<Trick[]>([]);
  const [modifiedTricks, setModifiedTricks] = useState<
    Map<string, { subcategory_id?: string; difficulty_level?: number }>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<TrickFormData>({
    name: "",
    description: "",
    difficulty_level: 1,
    subcategory_id: "",
  });

  // Fetch master categories on mount
  useEffect(() => {
    if (supabase) {
      fetchCategories();
    } else {
      // Load mock data
      setCategories(mockCategories);
      if (mockCategories.length > 0) {
        setSelectedCategory(mockCategories[0].id);
      }
    }
  }, []);

  // Fetch subcategories and tricks when category changes
  useEffect(() => {
    if (selectedCategory) {
      if (supabase) {
        fetchSubcategoriesByCategory(selectedCategory);
        fetchTricksByCategory(selectedCategory);
      } else {
        // Load mock data
        const categorySubcategories = mockSubcategories.filter(
          (sub) => sub.master_category_id === selectedCategory
        );
        setSubcategories(categorySubcategories);

        const categoryTricks = mockTricks.map((trick) => ({
          ...trick,
          subcategory: trick.subcategory_id
            ? categorySubcategories.find(
                (sub) => sub.id === trick.subcategory_id
              )
            : undefined,
        }));

        setTricks(categoryTricks);
        setOriginalTricks(JSON.parse(JSON.stringify(categoryTricks)));
      }
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("master_categories")
        .select("id, name, slug, color, icon_name")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      setCategories(data || []);

      if (data && data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    }
  };

  const fetchSubcategoriesByCategory = async (categoryId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name, slug, master_category_id")
        .eq("master_category_id", categoryId)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      setSubcategories(data || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setError("Failed to load subcategories");
    }
  };

  const fetchTricksByCategory = async (categoryId: string) => {
    if (!supabase) return;

    setLoading(true);
    setError(null);
    setModifiedTricks(new Map());

    try {
      const { data, error } = await supabase
        .from("tricks")
        .select(
          `
          id,
          name,
          slug,
          description,
          difficulty_level,
          subcategory_id,
          subcategory:subcategories!inner(
            id,
            name,
            slug,
            master_category:master_categories!inner(
              id,
              name,
              slug,
              color
            )
          )
        `
        )
        .eq("subcategory.master_category.id", categoryId)
        .eq("is_published", true)
        .order("difficulty_level", { ascending: true, nullsFirst: true });

      if (error) throw error;

      const tricksData = (data || []).map((trick: any) => ({
        ...trick,
        subcategory: trick.subcategory?.[0]
          ? {
              id: trick.subcategory[0].id,
              name: trick.subcategory[0].name,
              slug: trick.subcategory[0].slug,
              master_category: trick.subcategory[0].master_category?.[0]
                ? {
                    name: trick.subcategory[0].master_category[0].name,
                    slug: trick.subcategory[0].master_category[0].slug,
                    color: trick.subcategory[0].master_category[0].color,
                  }
                : undefined,
            }
          : undefined,
      }));
      setTricks(tricksData);
      setOriginalTricks(JSON.parse(JSON.stringify(tricksData)));
    } catch (err) {
      console.error("Error fetching tricks:", err);
      setError("Failed to load tricks");
    } finally {
      setLoading(false);
    }
  };

  // Handle drag start
  const handleDragStart = (
    e: React.DragEvent,
    trickId: string,
    subcategoryId: string | null,
    difficulty: number | null
  ) => {
    const dragItem: DragItem = {
      trickId,
      fromSubcategory: subcategoryId,
      fromDifficulty: difficulty,
    };
    setDraggedItem(dragItem);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drop
  const handleDrop = (
    e: React.DragEvent,
    toSubcategory: string | null,
    toDifficulty: number
  ) => {
    e.preventDefault();

    if (!draggedItem) return;

    const { trickId, fromSubcategory, fromDifficulty } = draggedItem;

    // Don't do anything if dropped in the same position
    if (fromSubcategory === toSubcategory && fromDifficulty === toDifficulty) {
      setDraggedItem(null);
      return;
    }

    // Update trick
    setTricks((currentTricks) => {
      const newTricks = [...currentTricks];
      const trickIndex = newTricks.findIndex((t) => t.id === trickId);

      if (trickIndex !== -1) {
        newTricks[trickIndex] = {
          ...newTricks[trickIndex],
          subcategory_id: toSubcategory || null,
          difficulty_level: toDifficulty,
        };

        // Track modification
        setModifiedTricks((prev) => {
          const newMap = new Map(prev);
          newMap.set(trickId, {
            subcategory_id: toSubcategory || undefined,
            difficulty_level: toDifficulty,
          });
          return newMap;
        });
      }

      return newTricks;
    });

    setDraggedItem(null);
    setSuccess("Trick moved successfully");
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Save changes to database
  const saveChanges = async () => {
    if (modifiedTricks.size === 0) {
      setError("No changes to save");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (supabase) {
        // Real Supabase save
        for (const [trickId, changes] of modifiedTricks.entries()) {
          const { error } = await supabase
            .from("tricks")
            .update({
              subcategory_id: changes.subcategory_id,
              difficulty_level: changes.difficulty_level,
              updated_at: new Date().toISOString(),
            })
            .eq("id", trickId);

          if (error) throw error;
        }
      } else {
        // Mock save
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(
          "[v0] Mock save - would update:",
          Array.from(modifiedTricks.entries())
        );
      }

      setSuccess(`Successfully updated ${modifiedTricks.size} trick(s)`);
      setModifiedTricks(new Map());
      setOriginalTricks(JSON.parse(JSON.stringify(tricks)));

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error saving changes:", err);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Reset changes
  const resetChanges = () => {
    setTricks(JSON.parse(JSON.stringify(originalTricks)));
    setModifiedTricks(new Map());
    setSuccess("Changes reset");
    setTimeout(() => setSuccess(null), 3000);
  };

  // Add new trick
  const handleAddTrick = async () => {
    if (!formData.name.trim()) {
      setError("Trick name is required");
      return;
    }

    try {
      if (supabase) {
        // Real Supabase insert
        const slug = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const { data, error } = await supabase
          .from("tricks")
          .insert({
            name: formData.name,
            slug,
            description: formData.description || null,
            difficulty_level: formData.difficulty_level,
            subcategory_id: formData.subcategory_id || null,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // Refresh tricks
        if (selectedCategory) {
          await fetchTricksByCategory(selectedCategory);
        }
      } else {
        // Mock add
        const newTrick: Trick = {
          id: Date.now().toString(),
          name: formData.name,
          slug: formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          description: formData.description || undefined,
          difficulty_level: formData.difficulty_level,
          subcategory_id: formData.subcategory_id || null,
        };

        setTricks((prev) => [...prev, newTrick]);
        setOriginalTricks((prev) => [...prev, newTrick]);
      }

      setShowAddDialog(false);
      setFormData({
        name: "",
        description: "",
        difficulty_level: 1,
        subcategory_id: "",
      });
      setSuccess("Trick added successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error adding trick:", err);
      setError("Failed to add trick");
    }
  };

  // Get tricks for a specific subcategory and difficulty
  const getTricksForCell = (
    subcategoryId: string | null,
    difficulty: number
  ) => {
    return tricks.filter(
      (trick) =>
        trick.subcategory_id === subcategoryId &&
        trick.difficulty_level === difficulty
    );
  };

  // Get orphaned tricks (no subcategory or difficulty)
  const getOrphanedTricks = () => {
    return tricks.filter(
      (trick) => !trick.subcategory_id || !trick.difficulty_level
    );
  };

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const difficultyLevels = Array.from({ length: 10 }, (_, i) => i + 1);

  // Show configuration message if Supabase is not set up

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Tricks Grid Manager</h1>
            <div className="flex gap-2">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Add Trick
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Trick</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter trick name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter trick description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={formData.difficulty_level.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            difficulty_level: Number.parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyLevels.map((level) => (
                            <SelectItem key={level} value={level.toString()}>
                              Difficulty Level {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select
                        value={formData.subcategory_id || "none"}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            subcategory_id: value === "none" ? "" : value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No subcategory</SelectItem>
                          {subcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddTrick} className="flex-1">
                        Add Trick
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={saveChanges}
                disabled={modifiedTricks.size === 0 || saving}
                variant={modifiedTricks.size > 0 ? "default" : "secondary"}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? "Saving..." : `Save Changes (${modifiedTricks.size})`}
              </Button>

              <Button
                onClick={resetChanges}
                disabled={modifiedTricks.size === 0}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw size={16} />
                Reset
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all font-medium
                  ${
                    selectedCategory === category.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }
                `}
                style={{
                  borderColor:
                    selectedCategory === category.id
                      ? category.color || undefined
                      : undefined,
                  backgroundColor:
                    selectedCategory === category.id
                      ? `${category.color}15` || undefined
                      : undefined,
                  color:
                    selectedCategory === category.id
                      ? category.color || undefined
                      : undefined,
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-50">
          {error}
        </div>
      )}

      {success && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded z-50">
          {success}
        </div>
      )}

      {/* Grid */}
      <div className="p-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg font-medium">Loading tricks...</div>
          </div>
        )}

        {!loading && (
          <div className="max-w-7xl mx-auto">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `200px repeat(${
                  subcategories.length + 1
                }, 1fr)`,
              }}
            >
              {/* Header Row */}
              <div className="font-semibold text-center py-2">Difficulty</div>
              <div className="font-semibold text-center py-2 bg-gray-200 rounded">
                Unassigned
              </div>
              {subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="font-semibold text-center py-2 bg-primary/10 rounded"
                >
                  {subcategory.name}
                </div>
              ))}

              {/* Grid Rows */}
              {difficultyLevels.map((difficulty) => (
                <React.Fragment key={difficulty}>
                  {/* Difficulty Label */}
                  <div className="flex items-center justify-center font-medium bg-gray-100 rounded">
                    Level {difficulty}
                  </div>

                  {/* Unassigned Column */}
                  <div
                    className="min-h-[80px] border-2 border-dashed border-gray-300 rounded p-2 bg-gray-50"
                    onDrop={(e) => handleDrop(e, null, difficulty)}
                    onDragOver={handleDragOver}
                  >
                    {getTricksForCell(null, difficulty).map((trick) => (
                      <div
                        key={trick.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(
                            e,
                            trick.id,
                            trick.subcategory_id || null,
                            trick.difficulty_level
                          )
                        }
                        className={`
                          p-2 mb-2 rounded cursor-move transition-all text-sm
                          ${
                            modifiedTricks.has(trick.id)
                              ? "bg-yellow-100 border-2 border-yellow-400"
                              : "bg-white border border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <div className="font-medium">{trick.name}</div>
                      </div>
                    ))}
                  </div>

                  {/* Subcategory Columns */}
                  {subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="min-h-[80px] border-2 border-dashed border-primary/30 rounded p-2 bg-primary/5"
                      onDrop={(e) => handleDrop(e, subcategory.id, difficulty)}
                      onDragOver={handleDragOver}
                    >
                      {getTricksForCell(subcategory.id, difficulty).map(
                        (trick) => (
                          <div
                            key={trick.id}
                            draggable
                            onDragStart={(e) =>
                              handleDragStart(
                                e,
                                trick.id,
                                trick.subcategory_id || null,
                                trick.difficulty_level
                              )
                            }
                            className={`
                            p-2 mb-2 rounded cursor-move transition-all text-sm
                            ${
                              modifiedTricks.has(trick.id)
                                ? "bg-yellow-100 border-2 border-yellow-400"
                                : "bg-white border border-gray-200 hover:border-gray-300"
                            }
                          `}
                          >
                            <div className="font-medium">{trick.name}</div>
                            {trick.description && (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {trick.description}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>

            {/* Orphaned Tricks Section */}
            {getOrphanedTricks().length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>
                    Orphaned Tricks (No Difficulty Level or Subcategory)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getOrphanedTricks().map((trick) => (
                      <div
                        key={trick.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(
                            e,
                            trick.id,
                            trick.subcategory_id || null,
                            trick.difficulty_level
                          )
                        }
                        className={`
                          p-3 rounded cursor-move transition-all
                          ${
                            modifiedTricks.has(trick.id)
                              ? "bg-yellow-100 border-2 border-yellow-400"
                              : "bg-white border border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <div className="font-medium">{trick.name}</div>
                        {trick.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {trick.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
