"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getSubcategoryBySlug,
  type Subcategory,
} from "@/lib/subcategories-data";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

export default function SubcategoryPage() {
  const params = useParams();
  const categorySlug = params.slug as string;
  const subcategorySlug = params.subcategory as string;
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);

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
              <Link href={`/trickipedia/categories/${categorySlug}`}>
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
            href="/trickipedia/categories"
            className="hover:text-primary transition-colors"
          >
            Categories
          </Link>
          <span>/</span>
          <Link
            href={`/trickipedia/categories/${categorySlug}`}
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

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Button asChild>
            <Link
              href={`/trickipedia/tricks/new?subcategory=${subcategory.id}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Trick
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/trickipedia/tricks?subcategory=${subcategory.slug}`}>
              View All Tricks
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Tricks List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{subcategory.name} Tricks</h2>
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-lg mb-4">
              Tricks for this subcategory will be displayed here once the trick
              system is implemented.
            </p>
            <Button variant="outline" asChild>
              <Link href={`/trickipedia/categories/${categorySlug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {subcategory.master_category?.name}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
