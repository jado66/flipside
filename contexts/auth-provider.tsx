// contexts/auth-provider.tsx
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

      const userProfile: User = {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role || "user",
      };

      setUser((prevUser) => {
        if (!prevUser) return userProfile;
        // Only update if changed
        if (
          prevUser.id === userProfile.id &&
          prevUser.email === userProfile.email &&
          prevUser.firstName === userProfile.firstName &&
          prevUser.lastName === userProfile.lastName &&
          prevUser.role === userProfile.role
        ) {
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", { event, session }); // Debug
      const newAuthUser = session?.user ?? null;
      setAuthUser((prevAuthUser) => {
        if (!prevAuthUser && !newAuthUser) return null;
        if (!prevAuthUser || !newAuthUser) return newAuthUser;
        if (prevAuthUser.id === newAuthUser.id) return prevAuthUser;
        return newAuthUser;
      });

      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
      } else if (newAuthUser) {
        await fetchUser(newAuthUser.id, newAuthUser.email);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Initial session check
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        console.log("Initial session:", { session, error }); // Debug
        if (error) {
          console.error("Initial session error:", error);
          setIsLoading(false);
          return;
        }
        const initialAuthUser = session?.user ?? null;
        setAuthUser(initialAuthUser);
        if (initialAuthUser) {
          fetchUser(initialAuthUser.id, initialAuthUser.email);
        } else {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to get initial session:", err);
        setIsLoading(false);
      });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log("Login response:", { data, error }); // Debug
        if (error) throw error;

        // No need for manual setSession—browser client handles cookies now

        // Fetch user profile
        if (data.user) {
          await fetchUser(data.user.id, data.user.email);
        }

        return { data, error: null };
      } catch (error) {
        console.error("Error signing in:", error);
        return { data: null, error };
      }
    },
    [fetchUser]
  );

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      console.log("Logout response:", { error }); // Debug
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
