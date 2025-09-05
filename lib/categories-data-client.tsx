import { supabase } from "./supabase/supabase-client";

export interface MasterCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon_name: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trick_count?: number;
}
// Get master category by slug
export async function getMasterCategoryBySlug(
  slug: string
): Promise<MasterCategory | null> {
  const { data, error } = await supabase
    .from("master_categories")
    .select(
      `
      *,
      trick_count:subcategories(
        tricks(count)
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No rows returned
    }
    console.error("Error fetching master category by slug:", error);
    throw new Error("Failed to fetch master category");
  }

  // Process the trick count aggregation
  return {
    ...data,
    trick_count:
      data.trick_count?.reduce(
        (total: number, subcategory: any) =>
          total + (subcategory.tricks?.[0]?.count || 0),
        0
      ) || 0,
  };
}
