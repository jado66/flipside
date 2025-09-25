// ===== /contexts/auth-provider.tsx =====
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import { useSupabase } from "@/utils/supabase/use-supabase";

export type UserRole = "user" | "administrator" | "moderator";

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_image_url?: string;
  phone?: string;
  date_of_birth?: string;
  created_at?: string;
  updated_at?: string;
  username?: string;
  users_sports_ids?: string[];
  referrals?: number;
  xp?: number;
}

interface AuthContextType {
  user: User | null;
  publicUser: PublicUser | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData?: Partial<PublicUser>
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updatePublicUser: (updates: Partial<PublicUser>) => Promise<PublicUser>;
  isAuthenticated: () => boolean;
  hasAdminAccess: () => boolean;
  hasModeratorAccess: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [publicUser, setPublicUser] = useState<PublicUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const mountedRef = useRef(true);
  const pathname = usePathname();
  const supabase = useSupabase();

  // Fetch public user data
  const fetchPublicUser = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          // Handle case where user profile doesn't exist yet
          if (error.code === "PGRST116") {
            console.log("Public user profile not found, will be created");
            return null;
          }
          throw error;
        }

        return data;
      } catch (err) {
        console.error("Error fetching public user:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user data")
        );
        return null;
      }
    },
    [supabase]
  );

  // Core session refresh function
  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (session?.user && mountedRef.current) {
        setSession(session);
        setUser(session.user);
        const userData = await fetchPublicUser(session.user.id);
        if (mountedRef.current) {
          setPublicUser(userData);
        }
        return true;
      } else if (mountedRef.current) {
        setSession(null);
        setUser(null);
        setPublicUser(null);
        return false;
      }
    } catch (err) {
      console.error("Error refreshing session:", err);
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err : new Error("Failed to refresh session")
        );
      }
      return false;
    }
  }, [supabase, fetchPublicUser]);

  // Initialize auth and listen for changes
  useEffect(() => {
    mountedRef.current = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        await refreshSession();
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      console.log("Auth state change:", event);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await refreshSession();
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setPublicUser(null);
      } else if (event === "USER_UPDATED") {
        await refreshSession();
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [refreshSession, supabase]);

  // CRITICAL: Refresh session on route changes
  // This ensures we pick up auth changes from server actions
  useEffect(() => {
    // Skip on initial mount
    if (loading) return;

    // Refresh session when navigating to a new page
    refreshSession();
  }, [pathname, loading]);

  // Also refresh on window focus for long-running sessions
  useEffect(() => {
    const handleFocus = () => {
      if (!loading && document.hasFocus()) {
        refreshSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshSession, loading]);

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Immediately update state
      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        const userData = await fetchPublicUser(data.user.id);
        setPublicUser(userData);
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err instanceof Error ? err : new Error("Failed to sign in"));
      throw err;
    }
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    userData?: Partial<PublicUser>
  ) => {
    try {
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      const publicUserData = {
        id: authData.user.id,
        email,
        role: "user" as UserRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData,
      };

      const { error: publicError } = await supabase
        .from("users")
        .insert(publicUserData);

      if (publicError) {
        console.error("Failed to create public user profile:", publicError);
        throw publicError;
      }

      // Update state if we got a session
      if (authData.session) {
        setSession(authData.session);
        setUser(authData.user);
        setPublicUser(publicUserData as PublicUser);
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err instanceof Error ? err : new Error("Failed to sign up"));
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear state immediately
      setSession(null);
      setUser(null);
      setPublicUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err instanceof Error ? err : new Error("Failed to sign out"));
      throw err;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      setError(null);
      await refreshSession();
    } catch (err) {
      console.error("Refresh user error:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to refresh user")
      );
      throw err;
    }
  };

  // Update public user data
  const updatePublicUser = useCallback(
    async (updates: Partial<PublicUser>) => {
      try {
        setError(null);

        if (!user) throw new Error("No user logged in");

        const { data, error } = await supabase
          .from("users")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          .select()
          .single();

        if (error) throw error;

        setPublicUser(data);
        return data;
      } catch (err) {
        console.error("Update user error:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to update user")
        );
        throw err;
      }
    },
    [user, supabase]
  );

  // Permission helpers
  const isAuthenticated = useCallback(() => {
    return !!user && !!session;
  }, [user, session]);

  const hasAdminAccess = useCallback(() => {
    return publicUser?.role === "administrator";
  }, [publicUser]);

  const hasModeratorAccess = useCallback(() => {
    console.log(publicUser?.role);

    return (
      publicUser?.role === "moderator" || publicUser?.role === "administrator"
    );
  }, [publicUser]);

  const hasRole = useCallback(
    (role: UserRole) => {
      if (!publicUser) return false;
      if (role === "user") return true;
      if (role === "moderator") return hasModeratorAccess();
      if (role === "administrator") return hasAdminAccess();
      return publicUser.role === role;
    },
    [publicUser, hasAdminAccess, hasModeratorAccess]
  );

  const value = {
    user,
    publicUser,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
    updatePublicUser,
    isAuthenticated,
    hasAdminAccess,
    hasModeratorAccess,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
