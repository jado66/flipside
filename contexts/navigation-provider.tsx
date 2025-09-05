"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// import removed fetch functions, now using /api/navigation route
import type {
  NavigationCategory,
  NavigationSubcategory,
  NavigationTrick,
} from "@/components/side-nav/types";

interface NavigationContextType {
  categories: NavigationCategory[];
  isLoading: boolean;
  error: string | null;
  loadSubcategories: (categorySlug: string) => Promise<void>;
  loadTricks: (categorySlug: string, subcategorySlug: string) => Promise<void>;
  expandedItems: Set<string>;
  setExpandedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<NavigationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Load all navigation data from /api/navigation on mount
  useEffect(() => {
    async function fetchNavigation() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/navigation");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          // Transform API data to NavigationCategory[]
          const transformedCategories: NavigationCategory[] = data.map(
            (category: any) => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
              icon_name: category.icon_name,
              color: category.color,
              sort_order: category.sort_order,
              subcategories: (category.subcategories || []).map((sub: any) => ({
                id: sub.id,
                name: sub.name,
                slug: sub.slug,
                sort_order: sub.sort_order,
                tricks: (sub.tricks || []).map((trick: any) => ({
                  id: trick.id,
                  name: trick.name,
                  slug: trick.slug,
                })),
                tricksLoaded: true,
                tricksLoading: false,
              })),
              subcategoriesLoaded: true,
              subcategoriesLoading: false,
            })
          );
          setCategories(transformedCategories);
          setError(null);
        } else {
          setError(data?.error || "Failed to load navigation data");
        }
      } catch (err) {
        console.error("Failed to fetch navigation data:", err);
        setError("Failed to load navigation data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchNavigation();
  }, []);

  // No-op: subcategories are loaded with initial fetch
  const loadSubcategories = async (_categorySlug: string) => {
    // Already loaded in initial fetch
    return;
  };

  // No-op: tricks are loaded with initial fetch
  const loadTricks = async (
    _categorySlug: string,
    _subcategorySlug: string
  ) => {
    // Already loaded in initial fetch
    return;
  };

  const contextValue: NavigationContextType = {
    categories,
    isLoading,
    error,
    loadSubcategories,
    loadTricks,
    expandedItems,
    setExpandedItems,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
