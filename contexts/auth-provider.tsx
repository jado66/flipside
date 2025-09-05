"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/supabase-client";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "administrator" | "moderator" | "user";
}

interface AuthContextType {
  user: User | null;
  authUser: any;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any }>;
  logout: () => Promise<{ error: any }>;
  hasAdminAccess: () => boolean;
  hasModeratorAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (id: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        console.log("No user profile found");
        setUser(null);
        setIsLoading(false);
        return null;
      }

      const userProfile = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role || "user",
      };

      setUser(userProfile);
      setIsLoading(false);
      return userProfile;
    } catch (error) {
      console.error("Could not fetch user", error);
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
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      if (authUser) {
        await fetchUser(authUser.id, authUser.email);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [authUser]);

  // Authentication methods
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error signing in:", error);
      return { data: null, error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error signing out:", error);
      return { error };
    }
  };

  const hasAdminAccess = () => user?.role === "administrator";
  const hasModeratorAccess = () =>
    user?.role === "administrator" || user?.role === "moderator";

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        isLoading,
        login,
        logout,
        hasAdminAccess,
        hasModeratorAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
