"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  GripVertical,
  Star,
  AlertTriangle,
  Lightbulb,
  Video,
  ImageIcon,
  Tag,
  User,
  PlusIcon,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { TrickData } from "@/types/trick";
import { PrerequisitesFormField } from "@/components/prerequisites-form-field";

interface StepGuide {
  step: number;
  title: string;
  description: string;
  tips: string[];
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
}

export interface TrickFormProps {
  mode: "view" | "edit" | "create"; // Added "create" mode
  trick: TrickData;
  onSubmit?: (data: TrickData) => void;
  loading?: boolean;
  users?: User[]; // Available users for inventor selection
  onCancel?: () => void;
}

export function TrickForm({
  mode,
  trick,
  onSubmit,
  loading,
  users = [],
  onCancel,
}: TrickFormProps) {
  const [formData, setFormData] = useState<TrickData>(trick);
  // Always set published to true for now
  useEffect(() => {
    setFormData((prev) => ({ ...prev, is_published: true }));
  }, []);

  const [showPrerequisites, setShowPrerequisites] = useState<boolean>(
    mode !== "create" && !!trick.prerequisites?.some((p) => p.trim())
  );
  const [showStepGuide, setShowStepGuide] = useState<boolean>(
    mode !== "create" &&
      !!(
        trick.step_by_step_guide?.length > 0 &&
        trick.step_by_step_guide.some((step) => step.title || step.description)
      )
  );
  const [showTipsAndTricks, setShowTipsAndTricks] = useState<boolean>(
    mode !== "create" &&
      !!(
        trick.tips_and_tricks?.trim() ||
        trick.common_mistakes?.trim() ||
        trick.safety_notes?.trim()
      )
  );
  const [openSections, setOpenSections] = useState<string[]>(["basic"]);
  const [inventorType, setInventorType] = useState<"none" | "user" | "name">(
    trick.inventor_user_id ? "user" : trick.inventor_name ? "name" : "none"
  );

  useEffect(() => {
    // Update inventor type when trick data changes
    if (trick.inventor_user_id) {
      setInventorType("user");
    } else if (trick.inventor_name) {
      setInventorType("name");
    } else {
      setInventorType("none");
    }

    // Update optional sections visibility when not in create mode and trick data has content
    if (mode !== "create") {
      const hasPrerequisites = !!trick.prerequisites?.some((p) => p.trim());
      const hasStepGuide = !!(
        trick.step_by_step_guide?.length > 0 &&
        trick.step_by_step_guide.some((step) => step.title || step.description)
      );
      const hasTipsAndTricks = !!(
        trick.tips_and_tricks?.trim() ||
        trick.common_mistakes?.trim() ||
        trick.safety_notes?.trim()
      );

      setShowPrerequisites(hasPrerequisites);
      setShowStepGuide(hasStepGuide);
      setShowTipsAndTricks(hasTipsAndTricks);

      // Auto-expand sections that have content
      const sectionsToOpen = ["basic"];
      if (hasPrerequisites) sectionsToOpen.push("prerequisites");
      if (hasStepGuide) sectionsToOpen.push("steps");
      if (hasTipsAndTricks) sectionsToOpen.push("tips-safety");
      setOpenSections(sectionsToOpen);
    } else {
      // In create mode, show all optional sections by default if desired, but for now keep as is
    }
  }, [
    trick.inventor_user_id,
    trick.inventor_name,
    trick.prerequisites,
    trick.step_by_step_guide,
    trick.tips_and_tricks,
    trick.common_mistakes,
    trick.safety_notes,
    mode,
  ]);

  const handleChange = (field: keyof TrickData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInventorTypeChange = (type: "none" | "user" | "name") => {
    setInventorType(type);
    setFormData((prev) => ({
      ...prev,
      inventor_user_id: type === "user" ? prev.inventor_user_id : null,
      inventor_name: type === "name" ? prev.inventor_name : null,
    }));
  };

  // Array field handlers
  const handleArrayChange = (
    field: keyof TrickData,
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const addArrayItem = (field: keyof TrickData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""],
    }));
  };

  const removeArrayItem = (field: keyof TrickData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  // Step guide handlers
  const handleStepChange = (
    index: number,
    field: keyof StepGuide,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      step_by_step_guide: prev.step_by_step_guide.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      ),
    }));
  };

  const addStep = () => {
    const newStep: StepGuide = {
      step: formData.step_by_step_guide.length + 1,
      title: "",
      description: "",
      tips: [""],
    };
    setFormData((prev) => ({
      ...prev,
      step_by_step_guide: [...prev.step_by_step_guide, newStep],
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      step_by_step_guide: prev.step_by_step_guide
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step: i + 1 })),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      // Clean up empty strings and inventor fields based on type
      const cleanData = {
        ...formData,
        prerequisites: formData.prerequisites.filter((p) => p.trim()),
        video_urls: formData.video_urls.filter((v) => v.trim()),
        image_urls: formData.image_urls.filter((i) => i.trim()),
        tags: formData.tags.filter((t) => t.trim()),
        // Clean up inventor fields based on selection
        inventor_user_id:
          inventorType === "user" ? formData.inventor_user_id : null,
        inventor_name:
          inventorType === "name"
            ? formData.inventor_name?.trim() || null
            : null,
      };
      onSubmit(cleanData);
    }
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 3)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (level <= 6)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return "Beginner";
    if (level <= 6) return "Intermediate";
    return "Advanced";
  };

  const getInventorDisplayName = () => {
    if (formData.inventor_user_id && users.length > 0) {
      const user = users.find((u) => u.id === formData.inventor_user_id);
      if (user) {
        return user.username || `${user.first_name} ${user.last_name}`;
      }
      return "Unknown User";
    }
    return formData.inventor_name || null;
  };

  const renderArrayField = (
    title: string,
    field: keyof TrickData,
    placeholder: string,
    icon: React.ReactNode,
    type: "text" | "url" = "text"
  ) => {
    const items = formData[field] as string[];
    const nonEmptyItems = items.filter(Boolean);

    if (mode === "view" && nonEmptyItems.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <Label className="text-sm font-medium">{title}</Label>
          {mode === "view" && nonEmptyItems.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {nonEmptyItems.length}
            </Badge>
          )}
        </div>

        {mode === "edit" || mode === "create" ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type={type}
                  value={item}
                  onChange={(e) =>
                    handleArrayChange(field, index, e.target.value)
                  }
                  placeholder={placeholder}
                  className="flex-1"
                />
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem(field, index)}
                    className="px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem(field)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {title.slice(0, -1)}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {field === "tags" ? (
              <div className="flex flex-wrap gap-2">
                {nonEmptyItems.map((item, idx) => (
                  <Badge key={idx} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : field === "image_urls" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {nonEmptyItems.map((item, idx) => (
                  <img
                    key={idx}
                    src={item || "/placeholder.svg"}
                    alt="Trick image"
                    className="aspect-video object-cover rounded-lg border"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {nonEmptyItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg text-sm">
                    {field === "video_urls" ? (
                      <a
                        href={item}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item}
                      </a>
                    ) : (
                      item
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p:0 md:p-6 ">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={setOpenSections}
          className="space-y-4 "
        >
          {/* Basic Information */}
          <AccordionItem value="basic" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Basic Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Name, slug, category, description, difficulty, and inventor
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Trick Name *</Label>
                  {mode === "view" ? (
                    <div className="text-xl font-semibold">{formData.name}</div>
                  ) : (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter trick name"
                      required
                    />
                  )}
                </div>

                {/* Slug (Route) */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Route (Slug) *</Label>
                  {mode === "view" ? (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      {formData.slug}
                    </div>
                  ) : (
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      placeholder="Enter unique slug (e.g., my-trick-name)"
                      required
                    />
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  {mode === "view" ? (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      {formData.description}
                    </div>
                  ) : (
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      placeholder="Describe what this trick involves..."
                      rows={4}
                      required
                    />
                  )}
                </div>

                {/* Inventor */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <Label>Trick Inventor (Optional)</Label>
                  </div>

                  {mode === "view" ? (
                    getInventorDisplayName() && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">
                          Invented by:{" "}
                        </span>
                        <span className="font-medium">
                          {getInventorDisplayName()}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      <Select
                        value={inventorType}
                        onValueChange={(value: "none" | "user" | "name") =>
                          handleInventorTypeChange(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            No inventor specified
                          </SelectItem>
                          <SelectItem value="user">
                            Select registered user
                          </SelectItem>
                          <SelectItem value="name">
                            Enter inventor name
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {inventorType === "user" && (
                        <Select
                          value={formData.inventor_user_id || ""}
                          onValueChange={(value) =>
                            handleChange("inventor_user_id", value || null)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.username ||
                                  `${user.first_name} ${user.last_name}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {inventorType === "name" && (
                        <Input
                          value={formData.inventor_name || ""}
                          onChange={(e) =>
                            handleChange("inventor_name", e.target.value)
                          }
                          placeholder="Enter inventor name"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Difficulty & Published Status (hidden for now) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">
                      Difficulty Level (1-10) *
                    </Label>
                    {mode === "view" ? (
                      <Badge
                        className={getDifficultyColor(
                          formData.difficulty_level
                        )}
                      >
                        {getDifficultyLabel(formData.difficulty_level)} (
                        {formData.difficulty_level}/10)
                      </Badge>
                    ) : (
                      <Input
                        id="difficulty"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.difficulty_level}
                        onChange={(e) =>
                          handleChange(
                            "difficulty_level",
                            Number.parseInt(e.target.value) || 1
                          )
                        }
                      />
                    )}
                  </div>

                  {/* {mode !== "view" && (
                    <div className="space-y-2">
                      <Label>Publication Status</Label>
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={formData.is_published}
                          onCheckedChange={(checked) =>
                            handleChange("is_published", checked)
                          }
                        />
                        <Label className="text-sm">
                          {formData.is_published ? "Published" : "Draft"}
                        </Label>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Media & Tags */}
          <AccordionItem value="media" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Media & Tags</h3>
                  <p className="text-sm text-muted-foreground">
                    Videos, images, and categorization
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {renderArrayField(
                  "Video URLs",
                  "video_urls",
                  "https://youtube.com/watch?v=...",
                  <Video className="h-4 w-4" />,
                  "url"
                )}
                {renderArrayField(
                  "Image URLs",
                  "image_urls",
                  "https://example.com/image.jpg",
                  <ImageIcon className="h-4 w-4" />,
                  "url"
                )}
                {renderArrayField(
                  "Tags",
                  "tags",
                  "e.g., beginner-friendly, outdoor, urban",
                  <Tag className="h-4 w-4" />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Prerequisites */}
          {showPrerequisites && (
            <AccordionItem value="prerequisites" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <GripVertical className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Prerequisites</h3>
                    <p className="text-sm text-muted-foreground">
                      Skills needed before attempting this trick
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <PrerequisitesFormField
                  prerequisites={formData.prerequisites}
                  onChange={(newPrerequisites) =>
                    handleChange("prerequisites", newPrerequisites)
                  }
                  subcategoryId={formData.subcategory_id}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Tips & Safety */}
          {showTipsAndTricks && (
            <AccordionItem value="tips-safety" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Tips & Safety</h3>
                    <p className="text-sm text-muted-foreground">
                      Important advice and safety considerations
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6">
                  {["tips_and_tricks", "common_mistakes", "safety_notes"].map(
                    (field) => {
                      const fieldValue = formData[
                        field as keyof TrickData
                      ] as string;
                      const icons = {
                        tips_and_tricks: <Lightbulb className="h-4 w-4" />,
                        common_mistakes: <AlertTriangle className="h-4 w-4" />,
                        safety_notes: <AlertTriangle className="h-4 w-4" />,
                      };

                      if (mode === "view" && !fieldValue?.trim()) return null;

                      return (
                        <div key={field} className="space-y-2">
                          <div className="flex items-center gap-2">
                            {icons[field as keyof typeof icons]}
                            <Label className="text-sm font-medium">
                              {field
                                .split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                            </Label>
                          </div>
                          {mode === "view" ? (
                            fieldValue && (
                              <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-pretty">
                                {fieldValue}
                              </div>
                            )
                          ) : (
                            <Textarea
                              value={fieldValue}
                              onChange={(e) =>
                                handleChange(
                                  field as keyof TrickData,
                                  e.target.value
                                )
                              }
                              placeholder={`Enter ${field.replace(
                                /_/g,
                                " "
                              )}...`}
                              rows={3}
                            />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          <Separator className="my-4" />

          {!showPrerequisites && (mode === "edit" || mode === "create") && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPrerequisites(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Prerequisites
            </Button>
          )}

          {!showStepGuide && (mode === "edit" || mode === "create") && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowStepGuide(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Step-by-Step Guide
            </Button>
          )}

          {!showTipsAndTricks && (mode === "edit" || mode === "create") && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowTipsAndTricks(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Tips and Tricks
            </Button>
          )}
        </Accordion>

        {(mode === "edit" || mode === "create") && (
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-6 -mx-6 mt-8">
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Trick"
                  : "Save Trick"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
