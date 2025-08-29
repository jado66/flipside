import { createClient } from "./client";

export interface Subcategory {
  id: string;
  master_category_id: string;
  name: string;
  description: string | null;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trick_count?: number;
  master_category?: {
    name: string;
    slug: string;
    color: string | null;
  };
}

// Get subcategories by master category ID
export async function getSubcategoriesByMasterCategory(
  masterCategoryId: string
): Promise<Subcategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subcategories")
    .select(
      `
      *,
      trick_count:tricks(count),
      master_category:master_categories(name, slug, color)
    `
    )
    .eq("master_category_id", masterCategoryId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("Error fetching subcategories by master category:", error);
    throw new Error("Failed to fetch subcategories");
  }

  return data.map((subcategory) => ({
    ...subcategory,
    trick_count: subcategory.trick_count?.[0]?.count || 0,
    master_category: subcategory.master_category,
  }));
}

// Get all subcategories
export async function getAllSubcategories(): Promise<Subcategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subcategories")
    .select(
      `
      *,
      trick_count:tricks(count),
      master_category:master_categories(name, slug, color)
    `
    )
    .order("sort_order");

  if (error) {
    console.error("Error fetching all subcategories:", error);
    throw new Error("Failed to fetch all subcategories");
  }

  return data.map((subcategory) => ({
    ...subcategory,
    trick_count: subcategory.trick_count?.[0]?.count || 0,
    master_category: subcategory.master_category,
  }));
}

// Get subcategory by master category slug and subcategory slug
export async function getSubcategoryBySlug(
  masterCategorySlug: string,
  subcategorySlug: string
): Promise<Subcategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subcategories")
    .select(
      `
      *,
      trick_count:tricks(count),
      master_category:master_categories!inner(name, slug, color)
    `
    )
    .eq("slug", subcategorySlug)
    .eq("master_categories.slug", masterCategorySlug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No rows returned
    }
    console.error("Error fetching subcategory by slug:", error);
    throw new Error("Failed to fetch subcategory");
  }

  return {
    ...data,
    trick_count: data.trick_count?.[0]?.count || 0,
    master_category: data.master_category,
  };
}

// Create new subcategory
export async function createSubcategory(
  data: Omit<
    Subcategory,
    "id" | "created_at" | "updated_at" | "master_category"
  >
): Promise<Subcategory> {
  const supabase = await createClient();

  const { data: newSubcategory, error } = await supabase
    .from("subcategories")
    .insert([data])
    .select(
      `
      *,
      master_category:master_categories(name, slug, color)
    `
    )
    .single();

  if (error) {
    console.error("Error creating subcategory:", error);
    throw new Error("Failed to create subcategory");
  }

  return {
    ...newSubcategory,
    trick_count: 0,
    master_category: newSubcategory.master_category,
  };
}

// Update subcategory
export async function updateSubcategory(
  id: string,
  data: Partial<Subcategory>
): Promise<Subcategory> {
  const supabase = await createClient();

  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedSubcategory, error } = await supabase
    .from("subcategories")
    .update(updateData)
    .eq("id", id)
    .select(
      `
      *,
      trick_count:tricks(count),
      master_category:master_categories(name, slug, color)
    `
    )
    .single();

  if (error) {
    console.error("Error updating subcategory:", error);
    throw new Error("Failed to update subcategory");
  }

  return {
    ...updatedSubcategory,
    trick_count: updatedSubcategory.trick_count?.[0]?.count || 0,
    master_category: updatedSubcategory.master_category,
  };
}

// Delete subcategory
export async function deleteSubcategory(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("subcategories").delete().eq("id", id);

  if (error) {
    console.error("Error deleting subcategory:", error);
    throw new Error("Failed to delete subcategory");
  }
}
