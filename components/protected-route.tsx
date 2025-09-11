// components/protected-route.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireModerator?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = false,
  requireModerator = false,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, hasAdminAccess, hasModeratorAccess } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      router.push("/login");
      return;
    }

    if (requireAdmin && !hasAdminAccess()) {
      router.push("/unauthorized");
      return;
    }

    if (requireModerator && !hasModeratorAccess()) {
      router.push("/unauthorized");
      return;
    }
  }, [
    user,
    isLoading,
    requireAuth,
    requireAdmin,
    requireModerator,
    router,
    hasAdminAccess,
    hasModeratorAccess,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (requireAdmin && !hasAdminAccess()) {
    return null;
  }

  if (requireModerator && !hasModeratorAccess()) {
    return null;
  }

  return <>{children}</>;
}
