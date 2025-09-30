"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { supabase } from "@/utils/supabase/client";
import type { Trick } from "@/types/trick";
import {
  loadTricksFromIndexedDB,
  saveTricksToIndexedDB,
  isIndexedDBSupported,
} from "@/lib/indexeddb/tricks-db";

// Initialize debug utilities in development
if (process.env.NODE_ENV === "development") {
  import("@/lib/indexeddb/debug");
}

interface TricksContextType {
  tricks: Trick[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getTrickById: (id: string) => Trick | undefined;
  getTricksByCategory: (categorySlug: string) => Trick[];
  getTricksBySubcategory: (subcategorySlug: string) => Trick[];
}

const TricksContext = createContext<TricksContextType | undefined>(undefined);

interface TricksProviderProps {
  children: ReactNode;
}

/**
 * Fetch all published tricks with basic info
 */
async function fetchAllTricks(signal?: AbortSignal): Promise<Trick[]> {
  try {
    // Create a promise that rejects on abort
    const abortPromise = new Promise<never>((_, reject) => {
      signal?.addEventListener("abort", () => {
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    // Race between the actual query and the abort
    const queryPromise = supabase
      .from("tricks")
      .select(
        `
          id,
          name,
          slug,
          description,
          difficulty_level,
          prerequisite_ids,
          subcategory:subcategories(
            id,
            name,
            slug,
            master_category:master_categories(
              id,
              name,
              slug
            )
          )
        `
      )
      .eq("is_published", true)
      .order("name", { ascending: true });

    const result = await Promise.race([queryPromise, abortPromise]);

    const { data: tricks, error } = result as any;

    if (error) throw error;

    return tricks || [];
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.log("Fetch aborted");
    } else {
      console.error("Error fetching tricks:", error);
    }
    throw error;
  }
}

/**
 * Compare two arrays of tricks to see if they're different
 */
function tricksHaveChanged(oldTricks: Trick[], newTricks: Trick[]): boolean {
  if (oldTricks.length !== newTricks.length) return true;
  
  // Create a quick hash of IDs and updated_at timestamps
  const oldHash = oldTricks.map(t => `${t.id}-${t.slug}`).sort().join("|");
  const newHash = newTricks.map(t => `${t.id}-${t.slug}`).sort().join("|");
  
  return oldHash !== newHash;
}

export function TricksProvider({ children }: TricksProviderProps) {
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indexedDBAvailable, setIndexedDBAvailable] = useState(false);

  // Check IndexedDB availability
  useEffect(() => {
    setIndexedDBAvailable(isIndexedDBSupported());
  }, []);

  async function loadTricks(signal?: AbortSignal) {
    try {
      setLoading(true);
      setError(null);

      // Load from IndexedDB first for instant display
      if (indexedDBAvailable) {
        const cachedTricks = await loadTricksFromIndexedDB();
        if (cachedTricks.length > 0) {
          console.log(`Loaded ${cachedTricks.length} tricks from IndexedDB`);
          setTricks(cachedTricks);
          setLoading(false); // Show cached data immediately
        }
      }

      // Fetch fresh data from server in background
      const fetchedTricks = await fetchAllTricks(signal);

      // Only update if data has changed
      setTricks((prev) => {
        const hasChanged = tricksHaveChanged(prev, fetchedTricks);

        if (hasChanged) {
          console.log(`Tricks updated: ${fetchedTricks.length} tricks`);
          
          // Save to IndexedDB
          if (indexedDBAvailable) {
            saveTricksToIndexedDB(fetchedTricks).catch((err) => {
              console.error("Failed to save tricks to IndexedDB:", err);
            });
          }
          
          return fetchedTricks;
        }
        
        console.log("Tricks unchanged, keeping cached version");
        return prev;
      });
    } catch (err: any) {
      // Don't set error for abort
      if (err?.name !== "AbortError") {
        console.error("Error loading tricks:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
      // Keep existing cached data on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    loadTricks(controller.signal);

    return () => {
      controller.abort();
    };
  }, [indexedDBAvailable]);

  // Helper function to get a trick by ID
  const getTrickById = (id: string): Trick | undefined => {
    return tricks.find((trick) => trick.id === id);
  };

  // Helper function to get tricks by category slug
  const getTricksByCategory = (categorySlug: string): Trick[] => {
    return tricks.filter(
      (trick) => trick.subcategory?.master_category?.slug === categorySlug
    );
  };

  // Helper function to get tricks by subcategory slug
  const getTricksBySubcategory = (subcategorySlug: string): Trick[] => {
    return tricks.filter((trick) => trick.subcategory?.slug === subcategorySlug);
  };

  const value: TricksContextType = {
    tricks,
    loading,
    error,
    refetch: () => loadTricks(),
    getTrickById,
    getTricksByCategory,
    getTricksBySubcategory,
  };

  return (
    <TricksContext.Provider value={value}>{children}</TricksContext.Provider>
  );
}

/**
 * Hook to use tricks from context
 */
export function useTricks() {
  const context = useContext(TricksContext);

  if (context === undefined) {
    throw new Error("useTricks must be used within a TricksProvider");
  }

  return context;
}
