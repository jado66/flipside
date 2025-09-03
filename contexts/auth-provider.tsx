"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supbase";

export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "administrator" | "moderator" | "user";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasAdminAccess: () => boolean;
  hasModeratorAccess: () => boolean;
  refreshAuth: () => Promise<void>;
}

// Create context with default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs to track component state and prevent race conditions
  const mountedRef = useRef(true);
  const lastUserIdRef = useRef<string | null>(null);
  const fetchingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Function to fetch and set user profile with better error handling
  const fetchUserProfile = useCallback(
    async (supabaseUser: SupabaseUser | null, forceRefresh = false) => {
      // Prevent concurrent fetches for the same user
      if (fetchingRef.current && !forceRefresh) {
        return;
      }

      // Skip if user ID hasn't changed and not forcing refresh
      if (!forceRefresh && supabaseUser?.id === lastUserIdRef.current) {
        return;
      }

      fetchingRef.current = true;

      try {
        if (supabaseUser) {
          console.log("Fetching profile for user:", supabaseUser.email);

          // First verify the user is still valid
          const {
            data: { user: currentUser },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !currentUser || currentUser.id !== supabaseUser.id) {
            console.log("User verification failed, clearing auth state");
            if (mountedRef.current) {
              setUser(null);
              lastUserIdRef.current = null;
            }
            return;
          }

          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", supabaseUser.id)
            .single();

          if (profileError) {
            console.error("Error fetching user profile:", profileError);

            // If profile doesn't exist but user is authenticated, handle gracefully
            if (profileError.code === "PGRST116") {
              // No rows returned
              console.log(
                "User profile not found, user may need to complete profile setup"
              );
              if (mountedRef.current) {
                setUser(null);
                lastUserIdRef.current = null;
              }
              return;
            }

            throw profileError;
          }

          if (profile && mountedRef.current) {
            const userData = {
              id: profile.id,
              email: profile.email,
              firstName: profile.first_name,
              lastName: profile.last_name,
              role: profile.role,
            };

            console.log("Setting user profile:", userData.email);
            setUser(userData);
            lastUserIdRef.current = supabaseUser.id;
          }
        } else {
          console.log("No user, clearing auth state");
          if (mountedRef.current) {
            setUser(null);
            lastUserIdRef.current = null;
          }
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
        if (mountedRef.current) {
          setUser(null);
          lastUserIdRef.current = null;
        }
      } finally {
        fetchingRef.current = false;
      }
    },
    []
  );

  // Manual refresh function
  const refreshAuth = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setIsLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error refreshing session:", error);
        setUser(null);
        lastUserIdRef.current = null;
        return;
      }

      await fetchUserProfile(session?.user || null, true);
    } catch (error) {
      console.error("Error in refreshAuth:", error);
      setUser(null);
      lastUserIdRef.current = null;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchUserProfile]);

  // Handle visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && isInitialized) {
        console.log("Tab became visible, refreshing auth state");
        await refreshAuth();
      }
    };

    const handleFocus = async () => {
      if (isInitialized) {
        console.log("Window gained focus, refreshing auth state");
        await refreshAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isInitialized, refreshAuth]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        setIsLoading(true);

        // Get initial session with retry logic
        let retries = 3;
        let session: Session | null = null;
        let error: { message: string } | null = null;

        while (retries > 0 && mounted) {
          const result = await supabase.auth.getSession();
          session = result.data.session;
          error = result.error;

          if (!error || retries === 1) break;

          console.log(
            `Session fetch failed, retrying... (${retries} attempts left)`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          retries--;
        }

        if (error) {
          console.error("Failed to get initial session after retries:", error);
          if (mounted && mountedRef.current) {
            setUser(null);
            setIsLoading(false);
            setIsInitialized(true);
          }
          return;
        }

        if (mounted && mountedRef.current) {
          await fetchUserProfile(session?.user || null);
          setIsLoading(false);
          setIsInitialized(true);
          console.log("Auth initialization complete");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted && mountedRef.current) {
          setUser(null);
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [fetchUserProfile]);

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener...");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      console.log(
        "Auth state changed:",
        event,
        session?.user?.email || "no user"
      );

      // Don't set loading for token refresh events to avoid UI flicker
      if (event !== "TOKEN_REFRESHED") {
        setIsLoading(true);
      }

      try {
        // Handle different auth events
        switch (event) {
          case "SIGNED_IN":
          case "TOKEN_REFRESHED":
            await fetchUserProfile(session?.user || null);
            break;
          case "SIGNED_OUT":
            setUser(null);
            lastUserIdRef.current = null;
            break;
          case "USER_UPDATED":
            // Force refresh on user update
            await fetchUserProfile(session?.user || null, true);
            break;
          default:
            await fetchUserProfile(session?.user || null);
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        setUser(null);
        lastUserIdRef.current = null;
      } finally {
        if (mountedRef.current && event !== "TOKEN_REFRESHED") {
          setIsLoading(false);
        }
      }
    });

    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        return false;
      }

      // Don't manually fetch profile here - let the auth state listener handle it
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      // Don't set loading to false here - let the auth state listener handle it
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("Logging out...");
      setIsLoading(true);
      await supabase.auth.signOut();
      // The auth state listener will handle clearing the user state
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const hasAdminAccess = useCallback(
    () => user?.role === "administrator",
    [user?.role]
  );
  const hasModeratorAccess = useCallback(
    () => user?.role === "administrator" || user?.role === "moderator",
    [user?.role]
  );

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasAdminAccess,
    hasModeratorAccess,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
