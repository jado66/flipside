"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/utils/supabase/useSupabase";

export type UserRole = "user" | "admin" | "moderator";

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
  updatePublicUser: (updates: Partial<PublicUser>) => Promise<void>;
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

        if (error) throw error;

        setPublicUser(data);
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

  // Initialize auth state - simplified
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Get session first
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          setSession(session);
          setUser(session.user);
          await fetchPublicUser(session.user.id);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        if (mounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to initialize authentication")
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await fetchPublicUser(session.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setPublicUser(null);
      } else if (event === "USER_UPDATED" && session?.user) {
        setUser(session.user);
        await fetchPublicUser(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchPublicUser, supabase]);

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // Auth state change will handle setting user/session
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
        ...userData,
      };

      const { error: publicError } = await supabase
        .from("users")
        .insert(publicUserData);

      if (publicError) {
        console.error("Failed to create public user profile:", publicError);
        // Don't delete the auth user - let them retry
        throw publicError;
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
      // Auth state change will handle clearing state
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchPublicUser(session.user.id);
      }
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
    return !!user && !!publicUser;
  }, [user, publicUser]);

  const hasAdminAccess = useCallback(() => {
    return publicUser?.role === "admin";
  }, [publicUser]);

  const hasModeratorAccess = useCallback(() => {
    return publicUser?.role === "moderator" || publicUser?.role === "admin";
  }, [publicUser]);

  const hasRole = useCallback(
    (role: UserRole) => {
      if (!publicUser) return false;
      if (role === "user") return true;
      if (role === "moderator") return hasModeratorAccess();
      if (role === "admin") return hasAdminAccess();
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
