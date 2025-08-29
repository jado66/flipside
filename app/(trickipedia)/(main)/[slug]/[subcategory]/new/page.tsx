// app/tricks/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";
import {
  getMasterCategories,
  type MasterCategory,
} from "@/lib/categories-data";
import {
  getSubcategoriesByMasterCategory,
  type Subcategory,
} from "@/lib/subcategories-data";
import { createTrick } from "@/lib/tricks-data";
import { useAuth } from "@/contexts/auth-provider";
import { toast } from "sonner";

interface StepGuide {
  step: number;
  title: string;
  description: string;
  tips: string[];
}

export default function AddTrickPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>(
    []
  );
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedMasterCategory, setSelectedMasterCategory] = useState("");

  const [formData, setFormData] = useState({
    subcategory_id: "",
    name: "",
    slug: "",
    description: "",
    difficulty_level: 5,
    prerequisites: [""],
    step_by_step_guide: [
      { step: 1, title: "", description: "", tips: [""] },
    ] as StepGuide[],
    tips_and_tricks: "",
    common_mistakes: "",
    safety_notes: "",
    video_urls: [""],
    tags: [""],
    is_published: false,
  });

  // Load master categories on mount
  useEffect(() => {
    loadMasterCategories();
  }, []);

  // Load subcategories when master category changes
  useEffect(() => {
    if (selectedMasterCategory) {
      loadSubcategories(selectedMasterCategory);
    } else {
      setSubcategories([]);
      setFormData((prev) => ({ ...prev, subcategory_id: "" }));
    }
  }, [selectedMasterCategory]);

  //   // Redirect if not authenticated
  //   useEffect(() => {
  //     if (!user) {
  //       toast.error("Please login to create tricks");
  //       router.push("/auth/login");
  //     }
  //   }, [user, router]);

  const loadMasterCategories = async () => {
    try {
      const data = await getMasterCategories();
      setMasterCategories(data);
    } catch (error) {
      console.error("Failed to load master categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const loadSubcategories = async (masterCategoryId: string) => {
    try {
      const data = await getSubcategoriesByMasterCategory(
        masterCategoryId,
        false
      );
      setSubcategories(data);
    } catch (error) {
      console.error("Failed to load subcategories:", error);
      toast.error("Failed to load subcategories");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug:
        prev.slug === generateSlug(prev.name) || prev.slug === ""
          ? generateSlug(name)
          : prev.slug,
    }));
  };

  // Array field handlers
  const handleArrayFieldChange = (
    field: "prerequisites" | "video_urls" | "tags",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: "prerequisites" | "video_urls" | "tags") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (
    field: "prerequisites" | "video_urls" | "tags",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
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

  const handleStepTipChange = (
    stepIndex: number,
    tipIndex: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      step_by_step_guide: prev.step_by_step_guide.map((step, i) =>
        i === stepIndex
          ? {
              ...step,
              tips: step.tips.map((tip, j) => (j === tipIndex ? value : tip)),
            }
          : step
      ),
    }));
  };

  const addStepTip = (stepIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      step_by_step_guide: prev.step_by_step_guide.map((step, i) =>
        i === stepIndex ? { ...step, tips: [...step.tips, ""] } : step
      ),
    }));
  };

  const removeStepTip = (stepIndex: number, tipIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      step_by_step_guide: prev.step_by_step_guide.map((step, i) =>
        i === stepIndex
          ? { ...step, tips: step.tips.filter((_, j) => j !== tipIndex) }
          : step
      ),
    }));
  };

  const addStep = () => {
    const newStep = {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to create tricks");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        prerequisites: formData.prerequisites.filter((p) => p.trim()),
        video_urls: formData.video_urls.filter((v) => v.trim()),
        tags: formData.tags.filter((t) => t.trim()),
        step_by_step_guide: formData.step_by_step_guide.map((step) => ({
          ...step,
          tips: step.tips.filter((t) => t.trim()),
        })),
        created_by: user.id,
      };

      const newTrick = await createTrick(submitData);
      toast.success("Trick created successfully!");
      router.push(`/tricks/${newTrick.slug}`);
    } catch (err) {
      console.error("Failed to create trick:", err);
      setError(err instanceof Error ? err.message : "Failed to create trick");
      toast.error("Failed to create trick");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/tricks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tricks
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Add New Trick</h1>
          <p className="text-muted-foreground mt-2">
            Share your knowledge by adding a new trick to the Trickipedia
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details about the trick
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="master-category">Discipline</Label>
                  <Select
                    value={selectedMasterCategory}
                    onValueChange={setSelectedMasterCategory}
                  >
                    <SelectTrigger id="master-category">
                      <SelectValue placeholder="Select discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Category</Label>
                  <Select
                    value={formData.subcategory_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        subcategory_id: value,
                      }))
                    }
                    disabled={!selectedMasterCategory}
                  >
                    <SelectTrigger id="subcategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Trick Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Kong Vault"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="e.g., kong-vault"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Provide a clear description of the trick..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level (1-10) *</Label>
                  <Input
                    id="difficulty"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.difficulty_level}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        difficulty_level: parseInt(e.target.value) || 1,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="published">Publication Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_published: checked,
                        }))
                      }
                    />
                    <Label htmlFor="published" className="text-sm">
                      {formData.is_published ? "Published" : "Draft"}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
              <CardDescription>
                List any tricks that should be learned before attempting this
                one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={prerequisite}
                    onChange={(e) =>
                      handleArrayFieldChange(
                        "prerequisites",
                        index,
                        e.target.value
                      )
                    }
                    placeholder="e.g., Basic vault"
                  />
                  {formData.prerequisites.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayField("prerequisites", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField("prerequisites")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Prerequisite
              </Button>
            </CardContent>
          </Card>

          {/* Step-by-Step Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Guide</CardTitle>
              <CardDescription>
                Break down the trick into clear, actionable steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.step_by_step_guide.map((step, stepIndex) => (
                <Card key={stepIndex}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Step {step.step}
                      </CardTitle>
                      {formData.step_by_step_guide.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(stepIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Step Title</Label>
                      <Input
                        value={step.title}
                        onChange={(e) =>
                          handleStepChange(stepIndex, "title", e.target.value)
                        }
                        placeholder="e.g., Approach and Setup"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Step Description</Label>
                      <Textarea
                        value={step.description}
                        onChange={(e) =>
                          handleStepChange(
                            stepIndex,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe this step in detail..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tips for this step</Label>
                      {step.tips.map((tip, tipIndex) => (
                        <div key={tipIndex} className="flex gap-2">
                          <Input
                            value={tip}
                            onChange={(e) =>
                              handleStepTipChange(
                                stepIndex,
                                tipIndex,
                                e.target.value
                              )
                            }
                            placeholder="Add a helpful tip"
                          />
                          {step.tips.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeStepTip(stepIndex, tipIndex)}
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
                        onClick={() => addStepTip(stepIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addStep}>
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </CardContent>
          </Card>

          {/* Tips and Common Mistakes */}
          <Card>
            <CardHeader>
              <CardTitle>Tips & Common Mistakes</CardTitle>
              <CardDescription>
                Share helpful advice and pitfalls to avoid
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tips">General Tips & Tricks</Label>
                <Textarea
                  id="tips"
                  value={formData.tips_and_tricks}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tips_and_tricks: e.target.value,
                    }))
                  }
                  placeholder="Share any general tips that don't fit in the step-by-step guide..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mistakes">Common Mistakes</Label>
                <Textarea
                  id="mistakes"
                  value={formData.common_mistakes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      common_mistakes: e.target.value,
                    }))
                  }
                  placeholder="What mistakes do beginners often make?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safety">Safety Notes</Label>
                <Textarea
                  id="safety"
                  value={formData.safety_notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      safety_notes: e.target.value,
                    }))
                  }
                  placeholder="Important safety considerations..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Video URLs */}
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>
                Add links to helpful video tutorials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.video_urls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) =>
                      handleArrayFieldChange(
                        "video_urls",
                        index,
                        e.target.value
                      )
                    }
                    placeholder="https://youtube.com/..."
                    type="url"
                  />
                  {formData.video_urls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayField("video_urls", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField("video_urls")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Video URL
              </Button>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Add tags to help people find this trick
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) =>
                      handleArrayFieldChange("tags", index, e.target.value)
                    }
                    placeholder="e.g., beginner-friendly"
                  />
                  {formData.tags.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayField("tags", index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField("tags")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Trick"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/tricks")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
