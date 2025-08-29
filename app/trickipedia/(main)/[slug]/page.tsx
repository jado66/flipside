"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getMasterCategoryBySlug,
  type MasterCategory,
} from "@/lib/categories-data";
import {
  getSubcategoriesByMasterCategory,
  type Subcategory,
} from "@/lib/subcategories-data";
import { ArrowLeft, ArrowRight, Settings } from "lucide-react";
import * as Icons from "lucide-react";
import { PermissionGate } from "@/components/permission-gate";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<MasterCategory | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoryData = await getMasterCategoryBySlug(slug);
        setCategory(categoryData);

        if (categoryData) {
          const subcategoriesData = await getSubcategoriesByMasterCategory(
            categoryData.id
          );
          setSubcategories(subcategoriesData);
        }
      } catch (error) {
        console.error("Failed to load category data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      zap: Icons.Zap,
      "rotate-ccw": Icons.RotateCcw,
      activity: Icons.Activity,
      bounce: Icons.Zap,
    };
    return iconMap[iconName] || Icons.Circle;
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

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The category you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild>
              <Link href="/trickipedia/sports-and-disciplines">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sports &amp; Disciplines
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = getIconComponent(category.icon_name || "circle");

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/trickipedia/sports-and-disciplines"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sports &amp; Disciplines
          </Link>
        </div>

        {/* Category Header */}
        <div className="text-center mb-12">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: category.color || "" }}
          >
            <IconComponent className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-balance mb-4">
            {category.name}
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto mb-6">
            {category.description}
          </p>
          <Badge variant="secondary" className="text-sm">
            {category.trick_count} total tricks
          </Badge>
        </div>

        {/* Subcategories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Trick Categories</h2>
          {subcategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/trickipedia/${category.slug}/${subcategory.slug}`}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col">
                    <CardHeader className="pb-4 flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">
                          {subcategory.name}
                        </CardTitle>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <CardDescription className="text-sm text-pretty">
                        {subcategory.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 mt-auto">
                      <Badge variant="outline" className="text-xs">
                        {subcategory.trick_count} tricks
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {/* Management Card - Only visible to moderators/admins */}
              <PermissionGate requireModerator>
                <Link href={`/trickipedia/admin/${category.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col">
                    <CardHeader className="pb-4 flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">
                          Manage Trick Categories
                        </CardTitle>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <CardDescription className="text-sm text-pretty">
                        Add, edit, and organize {category.name} trick categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 mt-auto">
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-500/10 text-blue-600 border-blue-200"
                      >
                        Admin Tools
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </PermissionGate>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center py-12 bg-muted/30 rounded-lg w-full">
                <p className="text-muted-foreground">
                  No subcategories found for this discipline.
                </p>
              </div>

              {/* Management Card for empty state - Only visible to moderators/admins */}
              <PermissionGate requireModerator>
                <Link href={`/trickipedia/${category.slug}/manage-categories`}>
                  <Card className="w-full max-w-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 bg-blue-500">
                        <Settings className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl mb-2">
                        Manage Trick Categories
                      </CardTitle>
                      <CardDescription className="text-sm text-pretty">
                        Add trick categories to organize {category.name} tricks
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-500/10 text-blue-600 border-blue-200 mb-3"
                      >
                        Admin Tools
                      </Badge>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </PermissionGate>
            </div>
          )}
        </div>

        {/* Popular Tricks Preview */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Popular {category.name} Tricks
            </h2>
            <Button variant="outline" asChild>
              <Link href={`/trickipedia/tricks?category=${category.slug}`}>
                View All Tricks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              Popular tricks will be displayed here once the trick system is
              implemented.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
