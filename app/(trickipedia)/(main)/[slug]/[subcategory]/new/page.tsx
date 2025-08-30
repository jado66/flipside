// app/tricks/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
import { TrickForm } from "@/components/trick-form";
import { TrickData } from "@/types/trick";

export default function AddTrickPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Category selection state
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>(
    []
  );
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedMasterCategory, setSelectedMasterCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);

  // Initial form data
  const [trickData, setTrickData] = useState<TrickData>({
    subcategory_id: "",
    name: "",
    slug: "",
    description: "",
    difficulty_level: 5,
    prerequisites: [""],
    step_by_step_guide: [{ step: 1, title: "", description: "", tips: [""] }],
    tips_and_tricks: "",
    common_mistakes: "",
    safety_notes: "",
    video_urls: [""],
    image_urls: [""],
    tags: [""],
    is_published: false,
    inventor_user_id: null,
    inventor_name: null,
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
      setSelectedSubcategory(null);
      setTrickData((prev) => ({ ...prev, subcategory_id: "" }));
    }
  }, [selectedMasterCategory]);

  // Redirect if not authenticated
  useEffect(() => {
    if (user === null) {
      toast.error("Please login to create tricks");
      router.push("/auth/login");
    }
  }, [user, router]);

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

  const handleSubcategoryChange = (subcategoryId: string) => {
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    setSelectedSubcategory(subcategory || null);
    setTrickData((prev) => ({ ...prev, subcategory_id: subcategoryId }));
  };

  const handleCancel = () => {
    if (selectedSubcategory) {
      const masterCategory = masterCategories.find(
        (c) => c.id === selectedMasterCategory
      );
      if (masterCategory) {
        router.push(`/${masterCategory.slug}/${selectedSubcategory.slug}`);
      } else {
        router.push("/tricks");
      }
    } else {
      router.push("/tricks");
    }
  };

  const handleSubmit = async (data: TrickData) => {
    if (!user) {
      toast.error("Please login to create tricks");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...data,
        created_by: user.id,
      };

      const newTrick = await createTrick(submitData);
      toast.success("Trick created successfully!");

      // Navigate to the new trick page
      if (
        newTrick.subcategory?.master_category?.slug &&
        newTrick.subcategory?.slug
      ) {
        router.push(
          `/${newTrick.subcategory.master_category.slug}/${newTrick.subcategory.slug}/${newTrick.slug}`
        );
      } else {
        router.push("/tricks");
      }
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

        <div className="max-w-4xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Category Selection Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="master-category">Discipline *</Label>
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
                  <Label htmlFor="subcategory">Category *</Label>
                  <Select
                    value={trickData.subcategory_id}
                    onValueChange={handleSubcategoryChange}
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
            </CardContent>
          </Card>

          {/* Trick Form - only show after category is selected */}
          {trickData.subcategory_id ? (
            <TrickForm
              mode="edit"
              trick={trickData}
              onSubmit={handleSubmit}
              loading={loading}
              onCancel={handleCancel}
            />
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  Please select a discipline and category to continue
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
