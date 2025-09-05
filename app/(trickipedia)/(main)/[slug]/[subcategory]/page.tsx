import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getSubcategoryBySlug } from "@/lib/server/subcategories-data-server";
import { getTricks } from "@/lib/server/tricks-data-server";
import { ArrowLeft } from "lucide-react";
import { TrickCard } from "@/components/subcategory/trick-card";
import { AddTrickCard } from "@/components/subcategory/add-trick-card";

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

interface PageProps {
  params: {
    slug: string;
    subcategory: string;
  };
}

export default async function SubcategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug: categorySlug, subcategory: subcategorySlug } = resolvedParams;

  // Fetch data server-side
  const [subcategory, tricksResponse] = await Promise.all([
    getSubcategoryBySlug(categorySlug, subcategorySlug),
    getTricks({ category: categorySlug, subcategory: subcategorySlug }),
  ]);

  if (!subcategory) {
    notFound();
  }

  const tricks = tricksResponse.tricks || [];

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tricks.length > 0 ? (
              <>
                {tricks.map((trick) => (
                  <TrickCard
                    key={trick.id}
                    trick={trick}
                    categorySlug={categorySlug}
                    subcategorySlug={subcategorySlug}
                    difficultyLabels={DIFFICULTY_LABELS}
                    difficultyColors={DIFFICULTY_COLORS}
                  />
                ))}

                {/* Add New Trick Card */}
                <AddTrickCard
                  categorySlug={categorySlug}
                  subcategorySlug={subcategorySlug}
                />
              </>
            ) : (
              <>
                <div>
                  <p className="text-muted-foreground text-lg mb-4">
                    No tricks found for this subcategory yet.
                  </p>

                  <AddTrickCard
                    categorySlug={categorySlug}
                    subcategorySlug={subcategorySlug}
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/${categorySlug}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to {subcategory.master_category?.name}
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
