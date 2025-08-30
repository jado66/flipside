"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  fetchMasterCategories,
  fetchSubcategoriesByCategory,
  fetchTricksBySubcategory,
} from "@/lib/fetch-tricks";
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

  // Load initial categories on mount
  useEffect(() => {
    async function initializeCategories() {
      try {
        setIsLoading(true);
        const result = await fetchMasterCategories();

        if (result.success) {
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

    initializeCategories();
  }, []);

  const loadSubcategories = async (categorySlug: string) => {
    const categoryIndex = categories.findIndex((c) => c.slug === categorySlug);
    if (categoryIndex === -1) return;

    const category = categories[categoryIndex];

    // Don't reload if already loaded or loading
    if (category.subcategoriesLoaded || category.subcategoriesLoading) {
      return;
    }

    // Mark as loading
    setCategories((prev) => {
      const updated = [...prev];
      updated[categoryIndex] = {
        ...updated[categoryIndex],
        subcategoriesLoading: true,
      };
      return updated;
    });

    try {
      const result = await fetchSubcategoriesByCategory(categorySlug);

      if (result.success) {
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

        setCategories((prev) => {
          const updated = [...prev];
          updated[categoryIndex] = {
            ...updated[categoryIndex],
            subcategories,
            subcategoriesLoaded: true,
            subcategoriesLoading: false,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to load subcategories:", error);

      // Reset loading state on error
      setCategories((prev) => {
        const updated = [...prev];
        updated[categoryIndex] = {
          ...updated[categoryIndex],
          subcategoriesLoading: false,
        };
        return updated;
      });
    }
  };

  const loadTricks = async (categorySlug: string, subcategorySlug: string) => {
    const categoryIndex = categories.findIndex((c) => c.slug === categorySlug);
    if (categoryIndex === -1) return;

    const subcategoryIndex = categories[categoryIndex].subcategories?.findIndex(
      (s) => s.slug === subcategorySlug
    );
    if (subcategoryIndex === -1 || subcategoryIndex === undefined) return;

    const subcategory =
      categories[categoryIndex].subcategories![subcategoryIndex];

    // Don't reload if already loaded or loading
    if (subcategory.tricksLoaded || subcategory.tricksLoading) {
      return;
    }

    // Mark as loading
    setCategories((prev) => {
      const updated = [...prev];
      updated[categoryIndex].subcategories![subcategoryIndex] = {
        ...updated[categoryIndex].subcategories![subcategoryIndex],
        tricksLoading: true,
      };
      return updated;
    });

    try {
      const result = await fetchTricksBySubcategory(subcategorySlug, {
        pageSize: 100,
      });

      if (result.success) {
        const tricks: NavigationTrick[] = result.data.map((trick) => ({
          id: trick.id,
          name: trick.name,
          slug: trick.slug,
        }));

        setCategories((prev) => {
          const updated = [...prev];
          updated[categoryIndex].subcategories![subcategoryIndex] = {
            ...updated[categoryIndex].subcategories![subcategoryIndex],
            tricks,
            tricksLoaded: true,
            tricksLoading: false,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to load tricks:", error);

      // Reset loading state on error
      setCategories((prev) => {
        const updated = [...prev];
        updated[categoryIndex].subcategories![subcategoryIndex] = {
          ...updated[categoryIndex].subcategories![subcategoryIndex],
          tricksLoading: false,
        };
        return updated;
      });
    }
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
