// components/permission-gate.tsx
"use client";

import { useAuth } from "@/contexts/auth-provider";

interface PermissionGateProps {
  children: React.ReactNode;
  requireModerator?: boolean;
  requireAdmin?: boolean;
  requireOwner?: boolean;
  ownerId?: string;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  requireModerator = false,
  requireAdmin = false,
  requireOwner = false,
  ownerId,
  fallback = null,
}: PermissionGateProps) {
  const { user, hasAdminAccess, hasModeratorAccess } = useAuth();

  // Check admin permission
  if (requireAdmin && !hasAdminAccess()) {
    return <>{fallback}</>;
  }

  // Check moderator permission
  if (requireModerator && !hasModeratorAccess()) {
    return <>{fallback}</>;
  }

  // Check owner permission
  if (
    requireOwner &&
    ownerId &&
    user?.id !== ownerId &&
    !hasModeratorAccess()
  ) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
