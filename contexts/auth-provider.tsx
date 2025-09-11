"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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

  // Memoize the fetchUser function to prevent unnecessary recreations
  const fetchUser = useCallback(async (id: string, email: string) => {
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

      // Only update user state if the data has actually changed
      setUser((prevUser) => {
        if (!prevUser) return userProfile;

        // Compare all relevant fields
        if (
          prevUser.id === userProfile.id &&
          prevUser.email === userProfile.email &&
          prevUser.firstName === userProfile.firstName &&
          prevUser.lastName === userProfile.lastName &&
          prevUser.role === userProfile.role
        ) {
          // Data hasn't changed, return the previous user object to maintain reference equality
          return prevUser;
        }

        return userProfile;
      });

      setIsLoading(false);
      return userProfile;
    } catch (error) {
      console.error("Could not fetch user", error);
      setIsLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    // Set up Supabase auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newAuthUser = session?.user ?? null;

      // Only update authUser if it's actually different
      setAuthUser((prevAuthUser) => {
        if (!prevAuthUser && !newAuthUser) return null;
        if (!prevAuthUser || !newAuthUser) return newAuthUser;
        if (prevAuthUser.id === newAuthUser.id) return prevAuthUser;
        return newAuthUser;
      });

      if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const initialAuthUser = session?.user ?? null;
      setAuthUser(initialAuthUser);
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
  }, [authUser, fetchUser]);

  // Memoize authentication methods to prevent recreations
  const login = useCallback(async (email: string, password: string) => {
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
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error signing out:", error);
      return { error };
    }
  }, []);

  const hasAdminAccess = useCallback(
    () => user?.role === "administrator",
    [user?.role]
  );
  const hasModeratorAccess = useCallback(
    () => user?.role === "administrator" || user?.role === "moderator",
    [user?.role]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      authUser,
      isLoading,
      login,
      logout,
      hasAdminAccess,
      hasModeratorAccess,
    }),
    [
      user,
      authUser,
      isLoading,
      login,
      logout,
      hasAdminAccess,
      hasModeratorAccess,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
