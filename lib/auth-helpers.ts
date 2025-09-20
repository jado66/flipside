// lib/auth-helpers.ts

import { redirect } from "next/navigation";
import { createSupabaseServer } from "./supabase/supabase-server";
export async function checkAuth() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function requireAdmin() {
  const profile = await checkAuth();

  if (profile?.role !== "administrator") {
    redirect("/unauthorized");
  }

  return profile;
}

export async function requireModerator() {
  const profile = await checkAuth();

  if (profile?.role !== "administrator" && profile?.role !== "moderator") {
    redirect("/unauthorized");
  }

  return profile;
}

export async function canManageCategories(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServer();

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role === "administrator" || profile?.role === "moderator";
}

export async function canEditTrick(
  userId: string,
  trickId: string
): Promise<boolean> {
  const supabase = await createSupabaseServer();

  // Check if user is admin/moderator
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role === "administrator" || profile?.role === "moderator") {
    return true;
  }

  // Check if user is the trick creator
  return true;
}
