import { fetchMasterCategories } from "@/lib/fetch-tricks";
import { useState, useEffect } from "react";
import type { MasterCategory } from "@/lib/types/database";

/**
 * Custom hook for fetching master categories
 */
export function useMasterCategories() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const result = await fetchMasterCategories();
      setCategories(result.data);
      setError(null);
    } catch (err) {
      setError(err as string | null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { categories, loading, error, refetch: () => load() };
}
