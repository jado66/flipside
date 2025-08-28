"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTricks, type Trick } from "@/lib/tricks-data";
import {
  getMasterCategories,
  type MasterCategory,
} from "@/lib/categories-data";
import { Search, Eye, Heart, Clock, Filter, Plus } from "lucide-react";

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

export default function TricksPage() {
  const searchParams = useSearchParams();
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    searchParams.get("difficulty") || "all"
  );
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getMasterCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadTricks = async () => {
      setLoading(true);
      try {
        const filters: any = {};
        if (selectedCategory !== "all") filters.category = selectedCategory;
        if (selectedDifficulty !== "all")
          filters.difficulty = Number.parseInt(selectedDifficulty);
        if (searchQuery) filters.search = searchQuery;

        const { tricks: tricksData, total: totalCount } = await getTricks(
          filters
        );
        setTricks(tricksData);
        setTotal(totalCount);
      } catch (error) {
        console.error("Failed to load tricks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTricks();
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Tricks</h1>
            <p className="text-muted-foreground">
              Discover and learn from our comprehensive collection of movement
              techniques
            </p>
          </div>
          <Button asChild>
            <Link href="/trickipedia/tricks/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Trick
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search tricks..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-4">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Beginner (1-3)</SelectItem>
                <SelectItem value="4">Intermediate (4-6)</SelectItem>
                <SelectItem value="7">Advanced (7-8)</SelectItem>
                <SelectItem value="9">Expert (9-10)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading..."
              : `${total} trick${total !== 1 ? "s" : ""} found`}
          </p>
          {(searchQuery ||
            selectedCategory !== "all" ||
            selectedDifficulty !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedDifficulty("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Tricks Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tricks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tricks.map((trick) => (
              <Link key={trick.id} href={`/trickipedia/tricks/${trick.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={
                        trick.image_urls[0] ||
                        "/placeholder.svg?height=200&width=300&query=trick demonstration"
                      }
                      alt={trick.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-xs">
                        {trick.subcategory?.master_category.name}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
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
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {trick.subcategory?.name}
                      </Badge>
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
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{trick.like_count}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(trick.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <img
                        src={trick.author?.avatar_url || "/placeholder.svg"}
                        alt={trick.author?.username}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs text-muted-foreground">
                        by {trick.author?.full_name || trick.author?.username}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              {searchQuery ||
              selectedCategory !== "all" ||
              selectedDifficulty !== "all"
                ? "No tricks found matching your criteria"
                : "No tricks available"}
            </p>
            <Button variant="outline" asChild>
              <Link href="/trickipedia/tricks/new">
                <Plus className="h-4 w-4 mr-2" />
                Add the First Trick
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
