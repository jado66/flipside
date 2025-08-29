"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { createClient } from "@/lib/client";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const supabase = await createClient();
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

  useEffect(() => {
    // On mount, check for existing session and fetch user profile
    async function fetchUser() {
      try {
        setIsLoading(true);
        const supabaseUser = await getUser();
        if (supabaseUser) {
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
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        const profile = await getUserProfile();
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            role: profile.role,
          });
          return true;
        }
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
      setUser(null);
      const supabase = await createClient();
      await supabase.auth.signOut();
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
