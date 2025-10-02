"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  cacheTricks,
  getCachedTricks,
  setLastSync,
  getLastSync,
} from "@/lib/offline-storage";
import { toast } from "sonner";
import type { Trick } from "@/types/trick";

const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

interface TricksContextType {
  // Connectivity / sync
  isOnline: boolean;
  lastSyncTime: number | null;
  isSyncing: boolean;
  syncData: () => Promise<void>; // kept for backward compatibility
  // Data
  tricks: Trick[];
  loading: boolean;
  error: string | null;
  // Helpers
  refetch: () => Promise<void>;
  getTrickById: (id: string) => Trick | undefined;
  getTricksByCategory: (categorySlug: string) => Trick[];
  getTricksBySubcategory: (subcategorySlug: string) => Trick[];
}

const TricksContext = createContext<TricksContextType | undefined>(undefined);

export function TricksProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Tricks data state
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Moved effect below function declarations (see below)

  const checkAndSync = useCallback(async () => {
    const lastSync = await getLastSync();
    const now = Date.now();

    if (!lastSync || now - lastSync > SYNC_INTERVAL) {
      await syncData();
    }
  }, []);

  const syncData = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    setError(null);
    try {
      const response = await fetch("/api/tricks/all");
      if (!response.ok) throw new Error("Failed to fetch tricks");
      const freshTricks: Trick[] = await response.json();
      setTricks(freshTricks);
      // Cache in IndexedDB
      await cacheTricks(freshTricks);
      await setLastSync();
      const newSyncTime = Date.now();
      setLastSyncTime(newSyncTime);
      console.log(
        "Data synced successfully",
        freshTricks.length,
        "tricks cached"
      );
    } catch (e: any) {
      console.error("Sync failed:", e);
      setError(e?.message || "Failed to sync data");
      toast.error("Failed to sync data");
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  const refetch = useCallback(async () => {
    await syncData();
  }, [syncData]);

  // Helper methods (memoized via useCallback where needed)
  const getTrickById = useCallback(
    (id: string) => tricks.find((t) => t.id === id),
    [tricks]
  );

  const getTricksByCategory = useCallback(
    (categorySlug: string) =>
      tricks.filter(
        (t) => t.subcategory?.master_category?.slug === categorySlug
      ),
    [tricks]
  );

  const getTricksBySubcategory = useCallback(
    (subcategorySlug: string) =>
      tricks.filter((t) => t.subcategory?.slug === subcategorySlug),
    [tricks]
  );

  // INITIAL LOAD / EVENT LISTENERS EFFECT
  useEffect(() => {
    let cancelled = false;

    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online! Syncing data...");
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info("You're offline. Using cached data.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load last sync time and cached tricks immediately
    (async () => {
      try {
        const [lastSync, cached] = await Promise.all([
          getLastSync(),
          getCachedTricks(),
        ]);
        if (!cancelled) {
          setLastSyncTime(lastSync);
          if (cached && cached.length) {
            setTricks(cached as Trick[]);
          }
        }
      } catch (e) {
        if (!cancelled) setError("Failed loading cached tricks");
        console.error("Failed to load cached tricks", e);
      } finally {
        if (!cancelled) setLoading(false);
      }

      // After showing cached data, attempt network sync if online
      if (navigator.onLine) {
        checkAndSync();
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkAndSync, syncData]);

  return (
    <TricksContext.Provider
      value={{
        // connectivity
        isOnline,
        lastSyncTime,
        isSyncing,
        syncData,
        // data
        tricks,
        loading,
        error,
        // helpers
        refetch,
        getTrickById,
        getTricksByCategory,
        getTricksBySubcategory,
      }}
    >
      {children}
    </TricksContext.Provider>
  );
}

export function useTricks() {
  const context = useContext(TricksContext);
  if (!context) {
    throw new Error("useTricks must be used within TricksProvider");
  }
  return context;
}
