// app/trickipedia/tricks/[slug]/page.tsx - Updated version with permissions
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getTrickBySlug,
  incrementTrickViews,
  toggleTrickLike,
  type Trick,
} from "@/lib/tricks-data";
import {
  ArrowLeft,
  Eye,
  Heart,
  Share2,
  Edit,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Play,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { PermissionGate } from "@/components/permission-gate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const DIFFICULTY_LABELS = {
  1: "Beginner",
  2: "Beginner",
  3: "Beginner",
  4: "Intermediate",
  5: "Intermediate",
  6: "Intermediate",
  7: "Advanced",
  8: "Advanced",
  9: "Expert",
  10: "Expert",
};

const DIFFICULTY_COLORS = {
  1: "bg-green-500",
  2: "bg-green-500",
  3: "bg-green-500",
  4: "bg-yellow-500",
  5: "bg-yellow-500",
  6: "bg-yellow-500",
  7: "bg-orange-500",
  8: "bg-orange-500",
  9: "bg-red-500",
  10: "bg-red-500",
};

export default function TrickDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, hasModeratorAccess } = useAuth();
  const [trick, setTrick] = useState<Trick | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const loadTrick = async () => {
      try {
        const data = await getTrickBySlug(slug);
        setTrick(data);
        if (data) {
          setLikeCount(data.like_count);
          // Increment view count
          await incrementTrickViews(data.id);

          // Check if user has liked this trick
          if (user) {
            const { data: likeData } = await supabase
              .from("trick_likes")
              .select("id")
              .eq("trick_id", data.id)
              .eq("user_id", user.id)
              .single();

            setLiked(!!likeData);
          }
        }
      } catch (error) {
        console.error("Failed to load trick:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrick();
  }, [slug, user]);

  const handleLike = async () => {
    if (!trick || !user) {
      toast.error("Please login to like tricks");
      return;
    }

    try {
      const result = await toggleTrickLike(trick.id, user.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleDelete = async () => {
    if (!trick) return;

    try {
      const { error } = await supabase
        .from("tricks")
        .delete()
        .eq("id", trick.id);

      if (error) throw error;

      toast.success("Trick deleted successfully");
      router.push("/trickipedia/tricks");
    } catch (error) {
      console.error("Failed to delete trick:", error);
      toast.error("Failed to delete trick");
    }
  };

  const canEdit =
    user && (trick?.created_by === user.id || hasModeratorAccess());

  if (loading) {
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
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Trick Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The trick you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild>
              <Link href="/trickipedia/tricks">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tricks
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link
            href="/trickipedia/tricks"
            className="hover:text-primary transition-colors"
          >
            Tricks
          </Link>
          <span>/</span>
          <Link
            href={`/trickipedia/categories/${trick.subcategory?.master_category.slug}`}
            className="hover:text-primary transition-colors"
          >
            {trick.subcategory?.master_category.name}
          </Link>
          <span>/</span>
          <Link
            href={`/trickipedia/categories/${trick.subcategory?.master_category.slug}/${trick.subcategory?.slug}`}
            className="hover:text-primary transition-colors"
          >
            {trick.subcategory?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{trick.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor:
                      trick.subcategory?.master_category.color || "#6b7280",
                  }}
                />
                <Badge variant="outline">
                  {trick.subcategory?.master_category.name}
                </Badge>
                <Badge variant="outline">{trick.subcategory?.name}</Badge>
                <div
                  className={`w-6 h-6 ${
                    DIFFICULTY_COLORS[
                      trick.difficulty_level as keyof typeof DIFFICULTY_COLORS
                    ]
                  } rounded-full flex items-center justify-center`}
                >
                  <span className="text-white text-xs font-bold">
                    {trick.difficulty_level}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    DIFFICULTY_COLORS[
                      trick.difficulty_level as keyof typeof DIFFICULTY_COLORS
                    ]
                  } text-white border-0`}
                >
                  {
                    DIFFICULTY_LABELS[
                      trick.difficulty_level as keyof typeof DIFFICULTY_LABELS
                    ]
                  }
                </Badge>
              </div>

              <h1 className="text-4xl font-bold text-balance mb-4">
                {trick.name}
              </h1>
              <p className="text-lg text-muted-foreground text-pretty mb-6">
                {trick.description}
              </p>

              {/* Stats and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{trick.view_count.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{likeCount} likes</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={liked ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`}
                    />
                    {liked ? "Liked" : "Like"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  {/* Permission-based Edit/Delete buttons */}
                  {canEdit && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/trickipedia/tricks/${trick.slug}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>

                      <PermissionGate requireModerator>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Trick</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {trick.name}&quot;? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </PermissionGate>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Additional Content */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Step-by-Step Guide</h2>
              {trick.step_by_step_guide &&
              trick.step_by_step_guide.length > 0 ? (
                <div className="space-y-6">
                  {trick.step_by_step_guide.map((step, index) => (
                    <div
                      key={step.step}
                      className="border-l-4 border-primary pl-6"
                    >
                      <h3 className="text-lg font-semibold mb-2">
                        Step {step.step}: {step.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        {step.description}
                      </p>
                      {step.tips && step.tips.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Tips for this step:
                          </h4>
                          <ul className="list-disc pl-6 space-y-1">
                            {step.tips.map((tip, tipIndex) => (
                              <li
                                key={tipIndex}
                                className="text-sm text-muted-foreground"
                              >
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No step-by-step guide available.
                </p>
              )}
            </div>
            {/* step_by_step_guide:
    | {
        step: number;
        title: string;
        description: string;
        tips?: string[];
      }[]
    | null;
  tips_and_tricks: string | null; */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Tips and Tricks</h2>
              {trick.tips_and_tricks ? (
                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="whitespace-pre-wrap text-muted-foreground">
                      {trick.tips_and_tricks}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No tips and tricks available.
                </p>
              )}
            </div>

            {/* Common Mistakes */}
            {trick.common_mistakes && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Common Mistakes</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                    <div className="whitespace-pre-wrap text-red-800">
                      {trick.common_mistakes}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Safety Notes */}
            {trick.safety_notes && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Safety Notes</h2>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                    <div className="whitespace-pre-wrap text-orange-800">
                      {trick.safety_notes}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {trick.prerequisites && trick.prerequisites.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 mb-3">
                        Make sure you can do these tricks first:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        {trick.prerequisites.map((prerequisite, index) => (
                          <li key={index} className="text-blue-700">
                            {prerequisite}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video URLs */}
            {trick.video_urls && trick.video_urls.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Video Tutorials</h2>
                <div className="grid gap-4">
                  {trick.video_urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 border rounded-lg"
                    >
                      <Play className="h-5 w-5 text-primary" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        Video Tutorial {index + 1}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
                <CardDescription>
                  {trick.created_by || "Unknown"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {new Date(trick.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Tricks</CardTitle>
              </CardHeader>
              <CardContent>
                {/* {trick.related_tricks.length > 0 ? (
                  <ul className="space-y-2">
                    {trick.related_tricks.map((relatedTrick) => (
                      <li key={relatedTrick.id}>
                        <Link
                          href={`/trickipedia/tricks/${relatedTrick.slug}`}
                          className="text-primary hover:underline"
                        >
                          {relatedTrick.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    No related tricks available.
                  </p>
                )} */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
