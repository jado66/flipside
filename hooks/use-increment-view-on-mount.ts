import { incrementTrickViews } from "@/lib/server/tricks-data-server";
import { useEffect, useRef, useState } from "react";

/**
 * Hook-like function for React components to handle view increment on mount
 */
export function useIncrementViewOnMount(
  trickId: string,
  shouldIncrement: boolean = true
) {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const incrementedRef = useRef(false);

  useEffect(() => {
    if (shouldIncrement && trickId && !incrementedRef.current) {
      incrementedRef.current = true;
      setLoading(true);

      incrementTrickViews(trickId)
        .then((response) => {
          if (response.success) {
            setViewCount(response.view_count);
          }
        })
        .catch((error) => {
          console.error("Failed to increment views:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [trickId, shouldIncrement]);

  return { viewCount, loading };
}
