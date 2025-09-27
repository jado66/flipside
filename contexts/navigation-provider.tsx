"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { useUser } from "./user-provider";
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

export function NavigationProvider({
  children,
  initialData = [],
}: {
  children: ReactNode;
  initialData?: NavigationCategory[];
}) {
  const { user: publicUser } = useUser();
  // Filter categories based on user's selected sports
  const categories = useMemo(() => {
    if (
      !publicUser?.users_sports_ids ||
      publicUser.users_sports_ids.length === 0
    ) {
      // If user has no sports selected, show all categories
      return initialData;
    }

    // Filter to only show categories user has selected
    return initialData.filter((category) =>
      publicUser.users_sports_ids!.includes(category.id)
    );
  }, [initialData, publicUser?.users_sports_ids]);

  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // No-op: data is already loaded server-side
  const loadSubcategories = async (_categorySlug: string) => {
    return;
  };

  // No-op: data is already loaded server-side
  const loadTricks = async (
    _categorySlug: string,
    _subcategorySlug: string
  ) => {
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
