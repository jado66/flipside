"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import type { User as SupabaseUser } from "@supabase/supabase-js";
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
}

// Create context with default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch and set user profile
  const fetchUserProfile = async (supabaseUser: SupabaseUser | null) => {
    if (supabaseUser) {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            role: profile.role,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await fetchUserProfile(session?.user || null);
      } catch (error) {
        console.error("Error getting initial session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setIsLoading(true);
      await fetchUserProfile(session?.user || null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        // The auth state listener will handle updating the user state
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      // The auth state listener will handle clearing the user state
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const hasAdminAccess = () => user?.role === "administrator";
  const hasModeratorAccess = () =>
    user?.role === "administrator" || user?.role === "moderator";

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasAdminAccess,
    hasModeratorAccess,
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
