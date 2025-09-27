"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { fetchMasterCategories } from "@/lib/fetch-tricks";
import type { MasterCategory } from "@/lib/types/database";

interface CategoriesContextType {
  categories: MasterCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(
  undefined
);

interface CategoriesProviderProps {
  children: ReactNode;
}

export function CategoriesProvider({ children }: CategoriesProviderProps) {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchMasterCategories();

      if (result.success) {
        setCategories(result.data);
      } else {
        setError(result.error || "Failed to fetch categories");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    refetch: loadCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

/**
 * Hook to use master categories from context
 */
export function useMasterCategories() {
  const context = useContext(CategoriesContext);

  if (context === undefined) {
    throw new Error(
      "useMasterCategories must be used within a CategoriesProvider"
    );
  }

  return context;
}
