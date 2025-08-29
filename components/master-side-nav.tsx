"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Zap,
  Target,
  Dumbbell,
  Layers,
  Loader2,
  RotateCcw,
  Activity,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Import your secure fetch functions
import {
  fetchMasterCategories,
  fetchSubcategoriesByCategory,
  fetchTricksBySubcategory,
} from "@/lib/api"; // Adjust path as needed

// Types for navigation data
interface NavigationTrick {
  id: string;
  name: string;
  slug: string;
}

interface NavigationSubcategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  tricks?: NavigationTrick[];
  tricksLoaded?: boolean;
  tricksLoading?: boolean;
}

interface NavigationCategory {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  color: string | null;
  sort_order: number;
  subcategories?: NavigationSubcategory[];
  subcategoriesLoaded?: boolean;
  subcategoriesLoading?: boolean;
}

const iconMap = {
  zap: Zap,
  target: Target,
  dumbbell: Dumbbell,
  layers: Layers,
  "rotate-ccw": RotateCcw,
  activity: Activity,
  bounce: Zap, // Using Zap as fallback for bounce
  circle: Circle,
  // Legacy support for old naming convention
  Zap,
  Target,
  Dumbbell,
  Layers,
};

interface NavItemProps {
  item: NavigationCategory;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onLoadSubcategories: (categorySlug: string) => Promise<void>;
}

function NavItem({
  item,
  level,
  isExpanded,
  onToggle,
  onLoadSubcategories,
}: NavItemProps) {
  const Icon = item.icon_name
    ? iconMap[item.icon_name as keyof typeof iconMap]
    : Circle;

  const handleToggle = async () => {
    if (
      !isExpanded &&
      !item.subcategoriesLoaded &&
      !item.subcategoriesLoading
    ) {
      await onLoadSubcategories(item.slug);
    }
    onToggle();
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={handleToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left font-normal font-medium"
          )}
          style={item.color ? { borderLeft: `3px solid ${item.color}` } : {}}
        >
          <div className="flex items-center gap-2 flex-1">
            <Icon className="h-4 w-4" />
            <span className="truncate">{item.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {item.subcategoriesLoading && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-1">
        {item.subcategories?.map((subcategory) => (
          <SubcategoryItem
            key={subcategory.id}
            subcategory={subcategory}
            categorySlug={item.slug}
            onLoadTricks={onLoadSubcategories} // We'll use the same handler
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface SubcategoryItemProps {
  subcategory: NavigationSubcategory;
  categorySlug: string;
  onLoadTricks: (
    categorySlug: string,
    subcategorySlug?: string
  ) => Promise<void>;
}

function SubcategoryItem({
  subcategory,
  categorySlug,
  onLoadTricks,
}: SubcategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = async () => {
    if (
      !isExpanded &&
      !subcategory.tricksLoaded &&
      !subcategory.tricksLoading
    ) {
      await onLoadTricks(categorySlug, subcategory.slug);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={handleToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-left font-normal pl-6 text-sm"
        >
          <div className="flex items-center gap-2 flex-1">
            <span className="truncate">{subcategory.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {subcategory.tricksLoading && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-1">
        {subcategory.tricks?.map((trick) => (
          <TrickItem key={trick.id} trick={trick} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function TrickItem({ trick }: { trick: NavigationTrick }) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-left font-normal pl-10 text-xs"
      asChild
    >
      <a href={`/trickipedia/tricks/${trick.slug}`}>
        <span className="truncate">{trick.name}</span>
      </a>
    </Button>
  );
}

export function MasterSideNav() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<NavigationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const result = await fetchMasterCategories();

        if (result.success) {
          // Transform the data to match our navigation structure
          const transformedCategories: NavigationCategory[] = result.data.map(
            (category) => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
              icon_name: category.icon_name,
              color: category.color,
              sort_order: category.sort_order,
              subcategories: [],
              subcategoriesLoaded: false,
              subcategoriesLoading: false,
            })
          );

          setCategories(transformedCategories);
          setError(null);
        } else {
          setError(result.error || "Failed to load categories");
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load navigation data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Load subcategories and tricks on demand
  const loadSubcategoriesAndTricks = async (
    categorySlug: string,
    subcategorySlug?: string
  ) => {
    if (subcategorySlug) {
      // Load tricks for a specific subcategory
      const categoryIndex = categories.findIndex(
        (c) => c.slug === categorySlug
      );
      if (categoryIndex === -1) return;

      const subcategoryIndex = categories[
        categoryIndex
      ].subcategories?.findIndex((s) => s.slug === subcategorySlug);
      if (subcategoryIndex === -1 || subcategoryIndex === undefined) return;

      // Mark as loading
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex].subcategories![
        subcategoryIndex
      ].tricksLoading = true;
      setCategories(updatedCategories);

      try {
        const result = await fetchTricksBySubcategory(subcategorySlug, {
          pageSize: 100,
        });

        if (result.success) {
          // Transform tricks data
          const tricks: NavigationTrick[] = result.data.map((trick) => ({
            id: trick.id,
            name: trick.name,
            slug: trick.slug,
          }));

          // Update state
          const finalCategories = [...categories];
          finalCategories[categoryIndex].subcategories![subcategoryIndex] = {
            ...finalCategories[categoryIndex].subcategories![subcategoryIndex],
            tricks,
            tricksLoaded: true,
            tricksLoading: false,
          };
          setCategories(finalCategories);
        }
      } catch (error) {
        console.error("Failed to load tricks:", error);
        // Reset loading state on error
        const errorCategories = [...categories];
        errorCategories[categoryIndex].subcategories![
          subcategoryIndex
        ].tricksLoading = false;
        setCategories(errorCategories);
      }
    } else {
      // Load subcategories for a category
      const categoryIndex = categories.findIndex(
        (c) => c.slug === categorySlug
      );
      if (categoryIndex === -1) return;

      // Mark as loading
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex].subcategoriesLoading = true;
      setCategories(updatedCategories);

      try {
        const result = await fetchSubcategoriesByCategory(categorySlug);

        if (result.success) {
          // Transform subcategories data
          const subcategories: NavigationSubcategory[] = result.data.map(
            (sub) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              sort_order: sub.sort_order,
              tricks: [],
              tricksLoaded: false,
              tricksLoading: false,
            })
          );

          // Update state
          const finalCategories = [...categories];
          finalCategories[categoryIndex] = {
            ...finalCategories[categoryIndex],
            subcategories,
            subcategoriesLoaded: true,
            subcategoriesLoading: false,
          };
          setCategories(finalCategories);
        }
      } catch (error) {
        console.error("Failed to load subcategories:", error);
        // Reset loading state on error
        const errorCategories = [...categories];
        errorCategories[categoryIndex].subcategoriesLoading = false;
        setCategories(errorCategories);
      }
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {error}
            </div>
          ) : (
            categories.map((category) => (
              <NavItem
                key={category.id}
                item={category}
                level={0}
                isExpanded={expandedItems.has(category.id)}
                onToggle={() => toggleExpanded(category.id)}
                onLoadSubcategories={loadSubcategoriesAndTricks}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
