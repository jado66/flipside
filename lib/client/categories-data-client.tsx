import { supabase } from "@/utils/supabase/client";

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

// Get all master categories (including inactive) - Client version
export async function getAllMasterCategories(): Promise<MasterCategory[]> {
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
    .order("sort_order");

  if (error) {
    console.error("Error fetching all master categories:", error);
    throw new Error("Failed to fetch all master categories");
  }

  // Process the trick count aggregation
  return data.map((category) => ({
    ...category,
    trick_count:
      category.trick_count?.reduce(
        (total: number, subcategory: any) =>
          total + (subcategory.tricks?.[0]?.count || 0),
        0
      ) || 0,
  }));
}

// Delete master category - Client version
export async function deleteMasterCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from("master_categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting master category:", error);
    throw new Error("Failed to delete master category");
  }
}

// Create new master category
export async function createMasterCategory(
  data: Omit<MasterCategory, "id" | "created_at" | "updated_at">
): Promise<MasterCategory> {
  const { data: newCategory, error } = await supabase
    .from("master_categories")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error creating master category:", error);
    throw new Error("Failed to create master category");
  }

  return newCategory;
}

// Update master category
export async function updateMasterCategory(
  id: string,
  data: Partial<MasterCategory>
): Promise<MasterCategory> {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedCategory, error } = await supabase
    .from("master_categories")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating master category:", error);
    throw new Error("Failed to update master category");
  }

  return updatedCategory;
}
