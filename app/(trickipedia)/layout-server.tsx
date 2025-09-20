//app\(trickipedia)\layout-server.tsx
import { TrickipediaLayoutClient } from "./TrickipediaLayoutClient";
import { AuthProvider } from "@/contexts/auth-provider";
import type { NavigationCategory } from "@/components/side-nav/types";
import { createSupabaseServer } from "@/lib/supabase/supabase-server";

export const revalidate = 60;
// // Or for on-demand revalidation, use:
// import { revalidatePath } from 'next/cache';

// In your API routes or server actions that modify navigation data:
// revalidatePath('/', 'layout');

async function getNavigationData(): Promise<NavigationCategory[]> {
  const supabaseServer = await createSupabaseServer();
  try {
    const { data, error } = await supabaseServer
      .from("master_categories")
      .select(
        `
        id,
        name,
        slug,
        icon_name,
        color,
        sort_order,
        status,
        subcategories(
          id,
          name,
          slug,
          sort_order,
          tricks(
            id,
            name,
            slug,
            difficulty_level,
            is_published
          )
        )
      `
      )
      .eq("is_active", true)
      .eq("subcategories.is_active", true)
      .order("sort_order")
      .order("sort_order", { foreignTable: "subcategories" })
      .order("difficulty_level", { foreignTable: "subcategories.tricks" });

    if (error) {
      console.error("Error fetching navigation data:", error);
      return [];
    }

    // Transform the data to match NavigationCategory type
    const transformedCategories: NavigationCategory[] = (data || []).map(
      (category: any) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon_name: category.icon_name,
        color: category.color,
        sort_order: category.sort_order,
        status: category.status,
        subcategories: (category.subcategories || []).map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          sort_order: sub.sort_order,
          tricks: (sub.tricks || [])
            .filter((trick: any) => trick.is_published)
            .sort(
              (a: any, b: any) =>
                (a.difficulty_level || 0) - (b.difficulty_level || 0)
            )
            .map((trick: any) => ({
              id: trick.id,
              name: trick.name,
              slug: trick.slug,
            })),
          tricksLoaded: true,
          tricksLoading: false,
        })),
        subcategoriesLoaded: true,
        subcategoriesLoading: false,
      })
    );

    return transformedCategories;
  } catch (error) {
    console.error("Unexpected error fetching navigation:", error);
    return [];
  }
}
// app/(trickipedia)/layout-server.tsx
export async function TrickipediaLayoutServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationData = await getNavigationData();
  const supabase = await createSupabaseServer();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  let hydratedUser: any = null;
  let userSportsIds: string[] = [];
  if (authUser) {
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();
    if (profile) {
      hydratedUser = {
        id: profile.id,
        email: profile.email,
        role: profile.role || "user",
        first_name: profile.first_name,
        last_name: profile.last_name,
        users_sports_ids: profile.users_sports_ids || [],
      };
      userSportsIds = profile.users_sports_ids || [];
    }
  }

  // Filter navigation data based on user's selected sports
  // Note: We'll do this filtering on the client side to allow real-time updates
  // when user changes their sports selection
  const filteredNavigationData = navigationData;

  if (error) {
    console.error("Server auth error (layout):", error);
  }

  return (
    <AuthProvider initialUser={hydratedUser} initialAuthUser={authUser}>
      <TrickipediaLayoutClient
        initialNavigationData={filteredNavigationData}
        user={authUser}
      >
        {children}
      </TrickipediaLayoutClient>
    </AuthProvider>
  );
}
