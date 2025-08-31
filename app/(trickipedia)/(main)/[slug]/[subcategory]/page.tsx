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
  getSubcategoryBySlug,
  type Subcategory,
} from "@/lib/subcategories-data";
import { getTricks, type Trick } from "@/lib/tricks-data";
import { ArrowLeft, ArrowRight, Plus, Eye, Heart, Clock } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { TrickImage } from "@/components/trick-image";

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

export default function SubcategoryPage() {
  const params = useParams();
  const categorySlug = params.slug as string;
  const subcategorySlug = params.subcategory as string;
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [loading, setLoading] = useState(true);
  const [tricksLoading, setTricksLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const loadSubcategory = async () => {
      try {
        const data = await getSubcategoryBySlug(categorySlug, subcategorySlug);
        setSubcategory(data);
      } catch (error) {
        console.error("Failed to load subcategory:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubcategory();
  }, [categorySlug, subcategorySlug]);

  useEffect(() => {
    const loadTricks = async () => {
      if (!subcategorySlug) return;

      setTricksLoading(true);
      try {
        console.log("Loading tricks for subcategory:", subcategorySlug);
        const { tricks: tricksData } = await getTricks({
          subcategory: subcategorySlug,
        });
        console.log("Loaded tricks:", tricksData);
        setTricks(tricksData);
      } catch (error) {
        console.error("Failed to load tricks:", error);
      } finally {
        setTricksLoading(false);
      }
    };

    loadTricks();
  }, [subcategorySlug]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
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

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Subcategory Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The subcategory you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild>
              <Link href={`/${categorySlug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Category
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
            href={`/${categorySlug}`}
            className="hover:text-primary transition-colors"
          >
            {subcategory.master_category?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{subcategory.name}</span>
        </div>
        {/* Subcategory Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor:
                  subcategory.master_category?.color || "#164e63",
              }}
            />
            <Badge variant="outline" className="text-sm">
              {subcategory.master_category?.name}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-balance mb-4">
            {subcategory.name}
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto mb-6">
            {subcategory.description}
          </p>
          <Badge variant="secondary" className="text-sm">
            {subcategory.trick_count} tricks
          </Badge>
        </div>

        {/* Tricks List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{subcategory.name}</h2>

          {tricksLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : tricks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tricks.map((trick) => (
                <Link
                  key={trick.id}
                  href={`/${categorySlug}/${subcategorySlug}/${trick.slug}`}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden pt-0">
                    <div className="aspect-video relative overflow-hidden">
                      <TrickImage
                        trick={trick}
                        alt={trick.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="text-xs">
                          {trick.subcategory?.master_category.name}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        {trick.difficulty_level && (
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
                        )}
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {trick.subcategory?.name}
                        </Badge>
                        {trick.difficulty_level && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
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
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {trick.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-pretty line-clamp-2">
                        {trick.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{trick.view_count.toLocaleString()}</span>
                          </div>
                          {/* <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{trick.like_count}</span>
                          </div> */}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(trick.created_at)}</span>
                        </div>
                      </div>

                      {trick.author && (
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              trick.author?.profile_image_url ||
                              "/placeholder.svg"
                            }
                            alt={`${trick.author.first_name} ${trick.author.last_name}`}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-xs text-muted-foreground">
                            by {trick.author.first_name}{" "}
                            {trick.author.last_name}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {/* Add New Trick Card */}
              <Link
                href={
                  user ? `/${categorySlug}/${subcategorySlug}/new` : `/login`
                }
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-dashed border-2 border-muted-foreground/25 hover:border-primary/50">
                  <div className="aspect-video relative overflow-hidden bg-muted/30 flex items-center justify-center">
                    <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-tight text-center">
                      Add New Trick
                    </CardTitle>
                    <CardDescription className="text-sm text-center">
                      Share your knowledge with the community
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg mb-4">
                No tricks found for this subcategory yet.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild>
                  <Link href={`/${categorySlug}/${subcategory.slug}/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Trick
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/${categorySlug}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to {subcategory.master_category?.name}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
