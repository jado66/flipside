import { useEffect, useRef, DependencyList } from "react";
import { useAuth } from "@/contexts/auth-provider";

/**
 * A custom hook that provides stable user tracking to prevent unnecessary re-renders
 * and data fetching when the user object reference changes but the actual user hasn't.
 *
 * @param callback - Function to execute when user actually changes
 * @param deps - Additional dependencies (optional)
 * @returns Object with user info and loading state
 */
export function useStableUser(
  callback: (userId: string | null) => void | Promise<void>,
  deps: DependencyList = []
) {
  const { user, loading: authLoading } = useAuth();
  const lastUserId = useRef<string | null>(null);
  const isExecuting = useRef(false);

  useEffect(() => {
    const executeCallback = async () => {
      // Don't execute while auth is still loading initially
      if (authLoading) return;

      // Prevent concurrent executions
      if (isExecuting.current) return;

      const currentUserId = user?.id || null;

      // Skip if user hasn't changed
      if (lastUserId.current === currentUserId) return;

      try {
        isExecuting.current = true;
        lastUserId.current = currentUserId;
        await callback(currentUserId);
      } finally {
        isExecuting.current = false;
      }
    };

    executeCallback();
  }, [user?.id, authLoading, ...deps]);

  return {
    userId: user?.id || null,
    user,
    isAuthenticated: !!user,
    authLoading,
  };
}
