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
import { getSupabaseClient } from "@/utils/supabase/client"; // Import singleton

// Types
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
  canAccess: (requirements: AccessRequirements) => boolean;
}

interface AccessRequirements {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  allowedRoles?: UserRole[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
  initialAuthUser = null,
}: {
  children: React.ReactNode;
  initialUser?: PublicUser | null;
  initialAuthUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialAuthUser);
  const [publicUser, setPublicUser] = useState<PublicUser | null>(initialUser);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use the singleton client
  const supabase = getSupabaseClient();

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

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Skip if we already have initial data
        if (initialAuthUser && initialUser) {
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        // Get initial session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (mounted && session) {
          setSession(session);
          if (!initialAuthUser) {
            setUser(session.user);
          }

          if (!initialUser) {
            await fetchPublicUser(session.user.id);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("Error initializing auth:", err);
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

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchPublicUser(session.user.id);
      } else {
        setPublicUser(null);
      }

      switch (event) {
        case "SIGNED_OUT":
          setPublicUser(null);
          break;
        case "USER_UPDATED":
          if (session?.user) {
            await fetchPublicUser(session.user.id);
          }
          break;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchPublicUser, initialUser, initialAuthUser, supabase]);

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
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
        await supabase.auth.admin.deleteUser(authData.user.id);
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

      setUser(null);
      setPublicUser(null);
      setSession(null);
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
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("No user found");

      setUser(user);
      await fetchPublicUser(user.id);
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

        console.log("AuthProvider updatePublicUser called with:", updates);

        const { data, error } = await supabase
          .from("users")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          .select()
          .single();

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

        console.log("Update successful, data:", data);
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

  // Permission helper functions
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

      if (role === "user") {
        return true;
      }

      if (role === "moderator") {
        return hasModeratorAccess();
      }

      if (role === "admin") {
        return hasAdminAccess();
      }

      return publicUser.role === role;
    },
    [publicUser, hasAdminAccess, hasModeratorAccess]
  );

  const canAccess = useCallback(
    (requirements: AccessRequirements) => {
      if (requirements.requireAuth && !isAuthenticated()) {
        return false;
      }

      if (requirements.requireAdmin && !hasAdminAccess()) {
        return false;
      }

      if (requirements.requireModerator && !hasModeratorAccess()) {
        return false;
      }

      if (requirements.allowedRoles && requirements.allowedRoles.length > 0) {
        return requirements.allowedRoles.some((role) => hasRole(role));
      }

      return true;
    },
    [isAuthenticated, hasAdminAccess, hasModeratorAccess, hasRole]
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
    canAccess,
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

// Optional: HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    allowedRoles?: UserRole[];
  }
) {
  return function ProtectedComponent(props: P) {
    const { user, publicUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user && options?.redirectTo && router) {
        router.push(options.redirectTo);
      }

      if (!loading && publicUser && options?.allowedRoles) {
        const hasRole = options.allowedRoles.includes(publicUser.role);
        if (!hasRole && options.redirectTo && router) {
          router.push(options.redirectTo);
        }
      }
    }, [loading, user, publicUser, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (options?.allowedRoles && publicUser) {
      const hasRole = options.allowedRoles.includes(publicUser.role);
      if (!hasRole) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600">
                You don&apos;t have permission to access this page.
              </p>
            </div>
          </div>
        );
      }
    }

    return <Component {...props} />;
  };
}
