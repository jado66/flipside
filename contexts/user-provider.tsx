"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

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

interface UserContextType {
  user: PublicUser | null;
  authUser: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<PublicUser>) => Promise<PublicUser>;
  isAuthenticated: () => boolean;
  hasAdminAccess: () => boolean;
  hasModeratorAccess: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async (id: string) => {
    try {
      // Query the users table in Supabase
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Public user profile not found");
          return null;
        }
        throw error;
      }

      setUser(data);
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error("Could not fetch user", error);
      setError(
        error instanceof Error ? error : new Error("Failed to fetch user")
      );
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    // Set up Supabase auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthUser(session?.user ?? null);

      if (event === "SIGNED_OUT") {
        setUser(null);
        setError(null);
      } else if (session?.user && event === "SIGNED_IN") {
        await fetchUser(session.user.id);
      }
    });

    // Initial check
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setError(error);
          return;
        }

        setAuthUser(session?.user ?? null);

        if (session?.user) {
          await fetchUser(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        setError(
          err instanceof Error ? err : new Error("Auth initialization failed")
        );
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUser(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error(
        "Error signing in:",
        error instanceof Error ? error.message : error
      );
      setError(error instanceof Error ? error : new Error("Failed to sign in"));
      setIsLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setAuthUser(null);
      return { error: null };
    } catch (error) {
      console.error(
        "Error signing out:",
        error instanceof Error ? error.message : error
      );
      setError(
        error instanceof Error ? error : new Error("Failed to sign out")
      );
      return { error };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      setError(null);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        setAuthUser(session.user);
        await fetchUser(session.user.id);
      } else {
        setAuthUser(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Refresh user error:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to refresh user")
      );
      throw err;
    }
  };

  // Update user data
  const updateUser = async (updates: Partial<PublicUser>) => {
    try {
      setError(null);

      if (!authUser) throw new Error("No user logged in");

      const { data, error } = await supabase
        .from("users")
        .update(updates as any)
        .eq("id", authUser.id)
        .select()
        .single();

      if (error) throw error;

      setUser(data as PublicUser);
      return data as PublicUser;
    } catch (err) {
      console.error("Update user error:", err);
      setError(err instanceof Error ? err : new Error("Failed to update user"));
      throw err;
    }
  };

  // Permission helpers
  const isAuthenticated = () => {
    return !!authUser && !!user;
  };

  const hasAdminAccess = () => {
    return user?.role === "administrator";
  };

  const hasModeratorAccess = () => {
    return user?.role === "moderator" || user?.role === "administrator";
  };

  const hasRole = (role: UserRole) => {
    if (!user) return false;
    if (role === "user") return true;
    if (role === "moderator") return hasModeratorAccess();
    if (role === "administrator") return hasAdminAccess();
    return user.role === role;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        authUser,
        isLoading,
        error,
        signIn,
        signOut,
        refreshUser,
        updateUser,
        isAuthenticated,
        hasAdminAccess,
        hasModeratorAccess,
        hasRole,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
