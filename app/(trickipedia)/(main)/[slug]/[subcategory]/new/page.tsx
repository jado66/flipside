"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createTrick, type Trick } from "@/lib/tricks-data"; // Assuming createTrick function exists in tricks-data
import {
  getSubcategoryBySlug,
  type Subcategory,
} from "@/lib/subcategories-data"; // To get subcategory_id from slug
import { useAuth } from "@/contexts/auth-provider";
import { toast } from "sonner";
import { TrickForm } from "@/components/trick-form";
import { TrickData } from "@/types/trick";

export default function TrickNewPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.slug as string;
  const subcategorySlug = params.subcategory as string;
  const { user } = useAuth();

  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [initialTrick, setInitialTrick] = useState<TrickData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadSubcategory = async () => {
      if (!subcategorySlug || user === undefined) return;

      try {
        const data = await getSubcategoryBySlug(category, subcategorySlug);
        if (!data) {
          toast.error("Subcategory not found");
          router.push(`/${category}`);
          return;
        }

        // // Check if user can create
        // if (!user) {
        //   toast.error("You must be logged in to create a trick");
        //   router.push(`/login`);
        //   return;
        // }

        setSubcategory(data);
        // Set initial form data with subcategory_id pre-filled
        setInitialTrick({
          subcategory_id: data.id,
          name: "",
          slug: "",
          description: "",
          difficulty_level: 5,
          prerequisites: [""],
          step_by_step_guide: [
            { step: 1, title: "", description: "", tips: [""] },
          ],
          tips_and_tricks: "",
          common_mistakes: "",
          safety_notes: "",
          video_urls: [""],
          image_urls: [""],
          tags: [""],
          is_published: false,
        });
      } catch (error) {
        console.error("Failed to load subcategory:", error);
        toast.error("Failed to load subcategory");
        router.push(`/${category}`);
      } finally {
        setLoadingData(false);
      }
    };

    loadSubcategory();
  }, [subcategorySlug, user, router, category]);

  const handleCancel = () => {
    router.push(`/${category}/${subcategorySlug}`);
  };

  const handleSubmit = async (data: TrickData) => {
    setLoading(true);
    try {
      if (!data.slug) {
        throw new Error("Slug is required to create a trick");
      }
      // @ts-expect-error TODO come back
      await createTrick(data); // Assuming createTrick function that takes TrickData and creates a new trick
      toast.success("Trick created successfully!");
      router.push(`/${category}/${subcategorySlug}/${data.slug}`);
    } catch (error) {
      console.error("Failed to create trick:", error);
      toast.error("Failed to create trick. You must be logged in");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData || !initialTrick) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">
              <span className="sr-only"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/${category}/${subcategorySlug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {subcategory?.name}
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Add New Trick</h1>
          <p className="text-muted-foreground mt-2">
            Create a new trick in {subcategory?.name}
          </p>
        </div>

        <div className="max-w-4xl">
          <TrickForm
            mode="create" // Updated to support "create" mode
            trick={initialTrick}
            onSubmit={handleSubmit}
            loading={loading}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
