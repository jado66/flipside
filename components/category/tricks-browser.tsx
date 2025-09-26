"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  SortAsc,
  SortDesc,
  Grid,
  Grid2X2,
  ExternalLink,
  CheckCircle2,
  Circle,
  Funnel,
  FunnelX,
  Network,
} from "lucide-react";
import Link from "next/link";
import type { Trick } from "@/types/trick";
import { CompactTrickCard } from "../subcategory/compact-trick-card";
import { TrickCard } from "../subcategory/trick-card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-provider";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase/client";

interface EnhancedTricksBrowserProps {
  tricks: Trick[];
  categorySlug: string;
  categoryName: string;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    trick_count?: number;
  }>;
  difficultyLabels: Record<number, string>;
  difficultyColors: Record<number, string>;
  moveName?: string | null;
}

type SortOption = "difficulty" | "alphabetical";
type SortOrder = "asc" | "desc";
type ViewMode = "grid" | "compact";

const TRICKS_PER_PAGE = 24;

export function TricksBrowser({
  tricks: serverTricks,
  categorySlug,
  categoryName,
  subcategories,
  difficultyLabels,
  difficultyColors,
  moveName,
}: EnhancedTricksBrowserProps & { moveName: string }) {
  const { user } = useAuth();

  const [userCanDoTricks, setUserCanDoTricks] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("difficulty");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("compact");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUnlearnedOnly, setShowUnlearnedOnly] = useState(false);

  // Fetch user's can-do tricks on mount and when user changes
  useEffect(() => {
    if (!supabase) {
      // console.error("Supabase client not initialized");
      return;
    }

    const fetchUserCanDoTricks = async () => {
      if (!user) {
        setUserCanDoTricks(new Set());
        return;
      }

      try {
        // Get all tricks the user can do
        const { data, error } = await supabase
          .from("user_tricks")
          .select("trick_id")
          .eq("user_id", user.id)
          .eq("can_do", true);

        if (error) {
          console.error("Error fetching user tricks:", error);
          return;
        }

        // Create a Set of trick IDs for fast lookup
        const canDoSet = new Set<string>(
          data?.map((record) => record.trick_id as string) || []
        );
        setUserCanDoTricks(canDoSet);
      } catch (error) {
        console.error("Failed to fetch user's tricks:", error);
      }
    };

    fetchUserCanDoTricks();
  }, [user, supabase]);

  // Merge server tricks with user's can-do status
  const tricksWithUserStatus = useMemo(() => {
    return serverTricks.map((trick) => ({
      ...trick,
      user_can_do: userCanDoTricks.has(trick.id),
    }));
  }, [serverTricks, userCanDoTricks]);

  // Filter and sort tricks
  const filteredAndSortedTricks = useMemo(() => {
    let filtered = tricksWithUserStatus;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (trick) =>
          trick.name.toLowerCase().includes(searchLower) ||
          trick.description?.toLowerCase().includes(searchLower) ||
          trick.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          trick.subcategory?.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by subcategory
    if (selectedSubcategory !== "all") {
      filtered = filtered.filter(
        (trick) => trick.subcategory?.slug === selectedSubcategory
      );
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      const difficultyRange = selectedDifficulty.split("-").map(Number);
      if (difficultyRange.length === 2) {
        filtered = filtered.filter(
          (trick) =>
            trick.difficulty_level &&
            trick.difficulty_level >= difficultyRange[0] &&
            trick.difficulty_level <= difficultyRange[1]
        );
      }
    }

    // Filter by unlearned status
    if (showUnlearnedOnly && user) {
      filtered = filtered.filter((trick: any) => !trick.user_can_do);
    }

    // Sort tricks
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "difficulty":
          comparison = (a.difficulty_level || 0) - (b.difficulty_level || 0);
          break;
        case "alphabetical":
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return sorted;
  }, [
    tricksWithUserStatus,
    searchTerm,
    selectedSubcategory,
    selectedDifficulty,
    sortBy,
    sortOrder,
    showUnlearnedOnly,
    user,
  ]);

  const totalPages = Math.ceil(
    filteredAndSortedTricks.length / TRICKS_PER_PAGE
  );
  const paginatedTricks = filteredAndSortedTricks.slice(
    (currentPage - 1) * TRICKS_PER_PAGE,
    currentPage * TRICKS_PER_PAGE
  );

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubcategory("all");
    setSelectedDifficulty("all");
    setSortBy("difficulty");
    setSortOrder("asc");
    setCurrentPage(1);
    setShowUnlearnedOnly(false);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedSubcategory !== "all" ||
    selectedDifficulty !== "all" ||
    showUnlearnedOnly;

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubcategory, selectedDifficulty, showUnlearnedOnly]);

  const handleSubcategoryFilter = (subcategorySlug: string) => {
    setSelectedSubcategory((prev) =>
      prev === subcategorySlug ? "all" : subcategorySlug
    );
  };

  // Function to toggle a trick's can-do status
  const handleToggleCanDo = async (trickId: string, currentStatus: boolean) => {
    if (!user) {
      toast.error("Please login to track your progress");
      return;
    }

    // Optimistically update the UI
    setUserCanDoTricks((prev) => {
      const newSet = new Set(prev);
      if (currentStatus) {
        newSet.delete(trickId);
      } else {
        newSet.add(trickId);
      }
      return newSet;
    });

    try {
      if (!currentStatus) {
        // Mark as can do
        const { error } = await supabase.from("user_tricks").upsert({
          user_id: user.id,
          trick_id: trickId,
          can_do: true,
          achieved_at: new Date().toISOString(),
        });

        if (error) throw error;
        toast.success(`${moveName} marked as learned!`);
      } else {
        // Remove can do status
        const { error } = await supabase
          .from("user_tricks")
          .delete()
          .eq("user_id", user.id)
          .eq("trick_id", trickId);

        if (error) throw error;
        toast.info(`${moveName} removed from learned ${moveName}s`);
      }
    } catch (error) {
      console.error("Failed to toggle can-do status:", error);
      toast.error("Failed to update trick status");

      // Revert on error
      setUserCanDoTricks((prev) => {
        const newSet = new Set(prev);
        if (currentStatus) {
          newSet.add(trickId);
        } else {
          newSet.delete(trickId);
        }
        return newSet;
      });
    }
  };

  // Calculate user stats
  const userStats = useMemo(() => {
    if (!user) return null;

    // Count only tricks from THIS category the user can do (not global total)
    const totalInCategory = serverTricks.length;
    const canDoCountInCategory = serverTricks.reduce(
      (acc, trick) => (userCanDoTricks.has(trick.id) ? acc + 1 : acc),
      0
    );

    const cannotDoCount = Math.max(0, totalInCategory - canDoCountInCategory);

    return {
      canDo: canDoCountInCategory,
      cannotDo: cannotDoCount,
      percentage:
        totalInCategory > 0
          ? Math.round((canDoCountInCategory / totalInCategory) * 100)
          : 0,
    };
  }, [serverTricks, userCanDoTricks, user]);

  return (
    <div className="space-y-6">
      {/* User Progress Stats */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">
                Can Do: {user && userStats ? userStats.canDo : "0"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">
                To Learn:{" "}
                {user && userStats ? userStats.cannotDo : serverTricks.length}
              </span>
            </div>
            {/* View Skill Tree Button */}
            <div className="mt-2 sm:mt-0">
              <Link href={`/${categorySlug}/skill-tree`} passHref>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap flex items-center gap-2"
                >
                  <Network className="h-4 w-4" />
                  View Skill Tree
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-start sm:justify-end w-full">
            {user && userStats ? (
              <Badge variant="secondary" className="text-sm">
                {userStats.percentage}% Complete
              </Badge>
            ) : (
              <Link href="/login">
                <Badge
                  variant="secondary"
                  className="text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  Sign in to track progress
                </Badge>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      {subcategories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Category Filters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {subcategories.map((subcategory) => {
              const isActive = selectedSubcategory === subcategory.slug;
              return (
                <div key={subcategory.id} className="relative">
                  <Button
                    variant={"outline"}
                    size="sm"
                    onClick={() => handleSubcategoryFilter(subcategory.slug)}
                    className={cn("w-full h-8 text-xs pr-16 cursor-pointer", {
                      "bg-accent/50": isActive,
                    })}
                  >
                    <span className="truncate">{subcategory.name}</span>
                  </Button>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/${categorySlug}/${subcategory.slug}`}>
                          <div
                            className="h-6 w-6 p-0 hover:bg-white/20 rounded flex items-center justify-center cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Go to {subcategory.name} page</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        {/* Main Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${categoryName} ${moveName}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={showFilters ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowFilters((prev) => !prev)}
                className="h-8 w-8 p-0"
              >
                {showFilters ? (
                  <FunnelX className="h-4 w-4" />
                ) : (
                  <Funnel className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant={viewMode === "compact" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("compact")}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="1-3">Beginner (1-3)</SelectItem>
                <SelectItem value="4-6">Intermediate (4-6)</SelectItem>
                <SelectItem value="7-8">Advanced (7-8)</SelectItem>
                <SelectItem value="9-10">Expert (9-10)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="difficulty">Sort by Difficulty</SelectItem>
                <SelectItem value="alphabetical">Sort A-Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="flex-1 bg-transparent"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4 mr-2" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-2" />
                )}
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold ">
            <span className=" capitalize">
              {filteredAndSortedTricks.length} {moveName}
              {filteredAndSortedTricks.length !== 1 ? "s" : ""}
            </span>

            {totalPages > 1 && (
              <span className="text-muted-foreground font-normal">
                {" "}
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </h3>
          {hasActiveFilters && (
            <Badge variant="outline" className="text-xs">
              Filtered
            </Badge>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <Button
              variant={showUnlearnedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnlearnedOnly((p) => !p)}
              className="h-8"
            >
              {showUnlearnedOnly ? "Show All" : "Show Unlearned"}
            </Button>
          </div>
        )}
      </div>

      {/* Tricks Grid */}
      {paginatedTricks.length > 0 ? (
        <>
          <div
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {paginatedTricks.map((trick) => {
              const userCanDo = (trick as any).user_can_do;
              return viewMode === "grid" ? (
                <TrickCard
                  key={trick.id}
                  trick={trick}
                  categorySlug={categorySlug}
                  subcategorySlug={trick.subcategory?.slug || ""}
                  difficultyLabels={difficultyLabels}
                  difficultyColors={difficultyColors}
                  userCanDo={userCanDo}
                  onToggleCanDo={
                    user
                      ? () => handleToggleCanDo(trick.id, userCanDo)
                      : undefined
                  }
                />
              ) : (
                <CompactTrickCard
                  key={trick.id}
                  trick={trick}
                  categorySlug={categorySlug}
                  subcategorySlug={trick.subcategory?.slug || ""}
                  difficultyLabels={difficultyLabels}
                  difficultyColors={difficultyColors}
                  userCanDo={userCanDo}
                  onToggleCanDo={
                    user
                      ? () => handleToggleCanDo(trick.id, userCanDo)
                      : undefined
                  }
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground text-lg mb-4">
            {hasActiveFilters
              ? `No ${moveName}s found matching your filters`
              : `No ${moveName}s found in ${categoryName}`}
          </p>
          <Link href={`/${categorySlug}/add-trick`}>
            <Button variant="default" className="mx-2">
              Add New Trick
            </Button>
          </Link>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mx-2">
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
