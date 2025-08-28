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
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/client";

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
  const slug = params.slug as string;
  const [user, setUser] = useState<User | null>(null);
  const [trick, setTrick] = useState<Trick | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  useEffect(() => {
    const loadTrick = async () => {
      try {
        const data = await getTrickBySlug(slug);
        setTrick(data);
        if (data) {
          setLikeCount(data.like_count);
          // Increment view count
          await incrementTrickViews(data.id);
        }
      } catch (error) {
        console.error("Failed to load trick:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrick();
  }, [slug]);

  const handleLike = async () => {
    if (!trick || !user) return;

    try {
      const result = await toggleTrickLike(trick.id, user.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

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
                    backgroundColor: trick.subcategory?.master_category.color,
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
                  {user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={liked ? "text-red-500 border-red-500" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${
                          liked ? "fill-current" : ""
                        }`}
                      />
                      {liked ? "Liked" : "Like"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {user && user.id === trick.created_by && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/trickipedia/tricks/${trick.slug}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Media */}
            {(trick.image_urls.length > 0 || trick.video_urls.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trick.image_urls.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trick.image_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url || "/placeholder.svg"}
                          alt={`${trick.name} demonstration ${index + 1}`}
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  {trick.video_urls.length > 0 && (
                    <div className="space-y-2">
                      {trick.video_urls.map((url, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          asChild
                          className="w-full justify-start bg-transparent"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Video Tutorial {index + 1}
                          </a>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step by Step Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Step-by-Step Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trick.step_by_step_guide.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{step.title}</h4>
                        <p className="text-muted-foreground mb-3">
                          {step.description}
                        </p>
                        {step.tips && step.tips.length > 0 && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Tips:
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <li
                                  key={tipIndex}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-primary">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips and Common Mistakes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Lightbulb className="h-5 w-5" />
                    Tips & Tricks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{trick.tips_and_tricks}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    Common Mistakes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{trick.common_mistakes}</p>
                </CardContent>
              </Card>
            </div>

            {/* Safety Notes */}
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Safety Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {trick.safety_notes}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Created by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <img
                    src={trick.author?.avatar_url || "/placeholder.svg"}
                    alt={trick.author?.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">
                      {trick.author?.full_name || trick.author?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{trick.author?.username}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {trick.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prerequisites</CardTitle>
                  <CardDescription>
                    Skills you should have before attempting this trick
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trick.prerequisites.map((prereq, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{prereq}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {trick.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trick.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
