"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  GripVertical,
  Star,
  AlertTriangle,
  Lightbulb,
  Video,
  UserIcon,
  Eye,
  Play,
} from "lucide-react";
import type { TrickData } from "@/types/trick";
import { PrerequisitesFormField } from "@/components/prerequisites-form-field";
import { TrickImage } from "@/components/trick-image";
import { MediaTagsSection } from "./media-tags-section";

interface StepGuide {
  step: number;
  title: string;
  description: string;
  tips: string[];
}

export interface TrickFormProps {
  mode: "view" | "edit" | "create";
  trick: TrickData;
  onSubmit?: (data: TrickData, shouldNavigateAway?: boolean) => void;
  loading?: boolean;
  users?: {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
  }[];
  onCancel?: () => void;
}

const getYouTubeVideoId = (url: string) => {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const getYouTubeThumbnail = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export function TrickForm({
  mode,
  trick,
  onSubmit,
  loading,
  users = [],
  onCancel,
}: TrickFormProps) {
  const [formData, setFormData] = useState<TrickData>(trick);
  const [createMultiple, setCreateMultiple] = useState(false);

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
  const [showInventor, setShowInventor] = useState<boolean>(
    mode !== "create" && !!(trick.inventor_user_id || trick.inventor_name)
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
      const hasInventor = !!(trick.inventor_user_id || trick.inventor_name);

      setShowPrerequisites(hasPrerequisites);
      setShowStepGuide(hasStepGuide);
      setShowTipsAndTricks(hasTipsAndTricks);
      setShowInventor(hasInventor);

      // Auto-expand sections that have content
      const sectionsToOpen = ["basic"];
      if (hasPrerequisites) sectionsToOpen.push("prerequisites");
      if (hasStepGuide) sectionsToOpen.push("steps");
      if (hasTipsAndTricks) sectionsToOpen.push("tips-safety");
      if (hasInventor) sectionsToOpen.push("inventor");
      setOpenSections(sectionsToOpen);
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

  // Convert string to kebab case
  const toKebabCase = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleChange = (field: keyof TrickData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-populate slug when name changes (only in create/edit mode)
      if (field === "name" && (mode === "create" || mode === "edit")) {
        newData.slug = toKebabCase(value);
      }

      return newData;
    });
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
      onSubmit(cleanData, !createMultiple);
      if (mode === "create" && createMultiple) {
        // Reset form for another entry
        setFormData({ ...trick });
      } else if (onCancel) {
        onCancel();
      }
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

  const renderMediaPreview = () => {
    const hasImages = formData.image_urls.some((url) => url.trim());
    const hasVideos = formData.video_urls.some((url) => url.trim());

    if (!hasImages && !hasVideos && mode === "view") return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main preview using TrickImage logic */}
          <div className="space-y-2">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/20">
              <TrickImage
                trick={formData as any}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Additional images */}
          {hasImages && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Images ({formData.image_urls.filter((url) => url.trim()).length}
                )
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {formData.image_urls
                  .filter((url) => url.trim())
                  .map((url, idx) => (
                    <div
                      key={idx}
                      className="aspect-video bg-muted rounded overflow-hidden"
                    >
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/trick-placeholder.png";
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Video thumbnails */}
        {hasVideos && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Videos ({formData.video_urls.filter((url) => url.trim()).length})
            </Label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {formData.video_urls
                .filter((url) => url.trim())
                .map((url, idx) => {
                  const youtubeId = getYouTubeVideoId(url);
                  return (
                    <div key={idx} className="flex-shrink-0 relative group">
                      <div className="w-24 h-16 bg-muted rounded overflow-hidden border">
                        {youtubeId ? (
                          <img
                            src={
                              getYouTubeThumbnail(youtubeId) ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={`Video ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {(mode === "edit" || mode === "create") && (
        <Card className="mb-6 border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Live Preview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {renderMediaPreview()}

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-balance">
                    {formData.name || "Untitled Trick"}
                  </h3>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground mt-1 text-pretty">
                      {formData.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {formData.difficulty_level > 0 && (
                      <Badge
                        className={getDifficultyColor(
                          formData.difficulty_level
                        )}
                      >
                        {getDifficultyLabel(formData.difficulty_level)}
                      </Badge>
                    )}
                    {formData.tags
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Accordion
          type="multiple"
          defaultValue={["basic", "details", "media"]}
          className="space-y-4"
        >
          {/* Basic Information - simplified without inventor */}
          <AccordionItem value="basic" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Basic Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Name, description, difficulty, and route
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
                  <Label htmlFor="slug">Route *</Label>
                  {mode === "view" ? (
                    <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
                      /{formData.slug}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          /
                        </span>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => handleChange("slug", e.target.value)}
                          placeholder="untitle-trick"
                          required
                          className="rounded-l-none"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This is the URL route for the trick and must be unique.
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  {mode === "view" ? (
                    <div className="p-4 bg-muted/50 rounded-lg text-pretty">
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

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level (1-10) *</Label>
                  {mode === "view" ? (
                    <Badge
                      className={getDifficultyColor(formData.difficulty_level)}
                    >
                      {getDifficultyLabel(formData.difficulty_level)} (
                      {formData.difficulty_level}/10)
                    </Badge>
                  ) : (
                    <Select
                      value={formData.difficulty_level.toString()}
                      onValueChange={(value) =>
                        handleChange("difficulty_level", Number.parseInt(value))
                      }
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Beginner</SelectItem>
                        <SelectItem value="2">2 - Beginner</SelectItem>
                        <SelectItem value="3">3 - Beginner</SelectItem>
                        <SelectItem value="4">4 - Intermediate</SelectItem>
                        <SelectItem value="5">5 - Intermediate</SelectItem>
                        <SelectItem value="6">6 - Intermediate</SelectItem>
                        <SelectItem value="7">7 - Advanced</SelectItem>
                        <SelectItem value="8">8 - Advanced</SelectItem>
                        <SelectItem value="9">9 - Advanced</SelectItem>
                        <SelectItem value="10">10 - Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Media & Tags - enhanced with preview */}
          <MediaTagsSection
            formData={formData}
            mode={mode}
            onArrayChange={(field, index, value) =>
              handleArrayChange(field as keyof TrickData, index, value)
            }
            onAddItem={(field) => addArrayItem(field as keyof TrickData)}
            onRemoveItem={(field, index) =>
              removeArrayItem(field as keyof TrickData, index)
            }
          />

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

          {showInventor && (
            <AccordionItem value="inventor" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Trick Inventor</h3>
                    <p className="text-sm text-muted-foreground">
                      Credit the person who created this trick
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {mode === "view" ? (
                  getInventorDisplayName() && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Invented by:{" "}
                        </span>
                        <span className="font-medium">
                          {getInventorDisplayName()}
                        </span>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
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
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {(mode === "edit" || mode === "create") && (
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-6 -mx-6 mt-8">
            <div className="flex gap-3 justify-end items-center">
              {/* Create Multiple Checkbox */}
              {mode === "create" && (
                <div className="flex items-center mr-auto">
                  <input
                    type="checkbox"
                    id="create-multiple"
                    className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                    checked={createMultiple}
                    onChange={(e) => setCreateMultiple(e.target.checked)}
                  />
                  <Label
                    htmlFor="create-multiple"
                    className="ml-2 text-sm cursor-pointer"
                  >
                    Create Multiple
                  </Label>
                </div>
              )}
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
