"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getTrickBySlug, updateTrick, type Trick } from "@/lib/tricks-data";
import { useAuth } from "@/contexts/auth-provider";
import { toast } from "sonner";
import { TrickForm } from "@/components/trick-form";

// Define the TrickData interface to match your form structure
interface TrickData {
  subcategory_id: string;
  name: string;
  slug: string;
  description: string;
  difficulty_level: number;
  prerequisites: string[];
  step_by_step_guide: Array<{
    step: number;
    title: string;
    description: string;
    tips: string[];
  }>;
  tips_and_tricks: string;
  common_mistakes: string;
  safety_notes: string;
  video_urls: string[];
  image_urls: string[];
  tags: string[];
  is_published: boolean;
}

export default function TrickEditPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.slug as string;
  const slug = params.trick_slug as string;
  const subcategory = params.subcategory as string;
  const { user, hasModeratorAccess } = useAuth();

  const [trick, setTrick] = useState<Trick | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTrick, setLoadingTrick] = useState(true);

  useEffect(() => {
    const loadTrick = async () => {
      try {
        const data = await getTrickBySlug(slug);
        if (!data) {
          toast.error("Trick not found");
          router.push(`/${category}/${subcategory}`);
          return;
        }

        // Check permissions
        const canEdit = user;
        if (!canEdit) {
          toast.error("You don't have permission to edit this trick");
          router.push(`/${category}/${subcategory}/${data.slug}`);
          return;
        }

        setTrick(data);
      } catch (error) {
        console.error("Failed to load trick:", error);
        toast.error("Failed to load trick");
        router.push(`/${category}/${subcategory}`);
      } finally {
        setLoadingTrick(false);
      }
    };

    if (slug && user !== undefined) {
      loadTrick();
    }
  }, [slug, user, hasModeratorAccess, router]);

  const handleSubmit = async (data: TrickData) => {
    if (!trick) return;

    setLoading(true);
    try {
      await updateTrick(trick.id, data);
      toast.success("Trick updated successfully!");

      router.push(`/${category}/${subcategory}/${data.slug}`);
    } catch (error) {
      console.error("Failed to update trick:", error);
      toast.error("Failed to update trick");
    } finally {
      setLoading(false);
    }
  };

  if (loadingTrick) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!trick) {
    return null;
  }

  // Convert trick data to form format
  const formTrick: TrickData = {
    subcategory_id: trick.subcategory_id || "",
    name: trick.name,
    slug: trick.slug,
    description: trick.description || "",
    difficulty_level: trick.difficulty_level || 5,
    prerequisites: trick.prerequisites?.length ? trick.prerequisites : [""],
    step_by_step_guide: trick.step_by_step_guide?.length
      ? trick.step_by_step_guide.map((step) => ({
          ...step,
          tips: step.tips ?? [""],
        }))
      : [{ step: 1, title: "", description: "", tips: [""] }],
    tips_and_tricks: trick.tips_and_tricks || "",
    common_mistakes: trick.common_mistakes || "",
    safety_notes: trick.safety_notes || "",
    video_urls: trick.video_urls?.length ? trick.video_urls : [""],
    image_urls: trick.image_urls?.length ? trick.image_urls : [""],
    tags: trick.tags?.length ? trick.tags : [""],
    is_published: trick.is_published || false,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/tricks/${slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trick
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Edit Trick</h1>
          <p className="text-muted-foreground mt-2">
            Update the details for {trick.name}
          </p>
        </div>

        <div className="max-w-4xl">
          <TrickForm
            mode="edit"
            trick={formTrick}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
