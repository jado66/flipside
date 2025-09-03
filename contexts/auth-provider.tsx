"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supbase";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simple function to get user profile
  const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
      };
    } catch {
      return null;
    }
  };

  // Initialize auth and listen for changes
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.log("Auth init error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth changed:", event);

      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return !error;
    } catch {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const hasAdminAccess = () => user?.role === "administrator";
  const hasModeratorAccess = () =>
    user?.role === "administrator" || user?.role === "moderator";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        hasAdminAccess,
        hasModeratorAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
