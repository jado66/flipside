import { Trick } from "@/types/trick";
import { supabase } from "../supabase/supabase-client";

// Create new trick
export async function createTrick(
  data: Omit<
    Trick,
    | "id"
    | "created_at"
    | "updated_at"
    | "view_count"
    | "subcategory"
    | "inventor"
  >
): Promise<Trick> {
  // Separate components
  const { components, ...trickData } = data;

  const { data: newTrick, error: insertError } = await supabase
    .from("tricks")
    .insert([
      {
        ...trickData,
        view_count: 0,
      },
    ])
    .select(
      `
      *,
      subcategory:subcategories(
        name,
        slug,
        master_category:master_categories(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `
    )
    .single();

  if (insertError) {
    console.error("Error creating trick:", insertError);
    throw new Error("Failed to create trick");
  }

  // Handle components if is_combo and components provided
  if (newTrick.is_combo && components && components.length > 0) {
    const compInsert = components.map((comp) => ({
      trick_id: newTrick.id,
      component_trick_id: comp.component_trick_id,
      sequence: comp.sequence,
      component_details: comp.component_details || {},
    }));

    const { error: compError } = await supabase
      .from("trick_components")
      .insert(compInsert);

    if (compError) {
      // Optional: rollback trick insert if components fail
      await supabase.from("tricks").delete().eq("id", newTrick.id);
      console.error("Error inserting components:", compError);
      throw new Error("Failed to create trick components");
    }
  }

  // Fetch components to include in return (optional, but for consistency)
  const compData = await getTrickComponents(newTrick.id);
  newTrick.components = compData;

  return newTrick;
}

export async function getAllTricks() {
  // Example with fetch (assume API endpoint)

  // OR with Supabase:
  const { data, error } = await supabase
    .from("tricks")
    .select("id, name, slug")
    .eq("is_published", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

// Update trick
export async function updateTrick(
  id: string,
  data: Partial<Trick>
): Promise<Trick> {
  // Separate components
  const { components, ...trickData } = data;

  const updateData = {
    ...trickData,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedTrick, error: updateError } = await supabase
    .from("tricks")
    .update(updateData)
    .eq("id", id)
    .select(
      `
      *,
      subcategory:subcategories(
        name,
        slug,
        master_category:master_categories(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `
    )
    .single();

  if (updateError) {
    console.error("Error updating trick:", JSON.stringify(updateError));
    throw new Error("Failed to update trick");
  }

  // Handle components: always delete existing first
  const { error: deleteError } = await supabase
    .from("trick_components")
    .delete()
    .eq("trick_id", id);

  if (deleteError) {
    console.error("Error deleting existing components:", deleteError);
    throw new Error("Failed to update trick components");
  }

  // Insert new components if is_combo and components provided
  if (updatedTrick.is_combo && components && components.length > 0) {
    const compInsert = components.map((comp) => ({
      trick_id: id,
      component_trick_id: comp.component_trick_id,
      sequence: comp.sequence,
      component_details: comp.component_details || {},
    }));

    const { error: insertError } = await supabase
      .from("trick_components")
      .insert(compInsert);

    if (insertError) {
      console.error("Error inserting new components:", insertError);
      throw new Error("Failed to update trick components");
    }
  }

  // Fetch components to include in return (optional)
  const compData = await getTrickComponents(id);
  updatedTrick.components = compData;

  return updatedTrick;
}

// Delete trick
export async function deleteTrick(id: string): Promise<void> {
  const { error } = await supabase.from("tricks").delete().eq("id", id);

  if (error) {
    console.error("Error deleting trick:", error);
    throw new Error("Failed to delete trick");
  }
}

// Get navigation data with hierarchical structure for side nav
export async function getNavigationData() {
  const { data, error } = await supabase
    .from("master_categories")
    .select(
      `
      id,
      name,
      slug,
      icon_name,
      color,
      sort_order,
      subcategories(
        id,
        name,
        slug,
        sort_order,
        tricks(
          id,
          name,
          slug,
          is_published
        )
      )
    `
    )
    .eq("is_active", true)
    .eq("subcategories.is_active", true)
    .order("sort_order")
    .order("sort_order", { foreignTable: "subcategories" })
    .order("name", { foreignTable: "subcategories.tricks" });

  if (error) {
    console.error("Error fetching navigation data:", error);
    throw new Error("Failed to fetch navigation data");
  }

  // Filter tricks to only show published ones
  const filteredData = (data || []).map((category) => ({
    ...category,
    subcategories: (category.subcategories || []).map((subcategory) => ({
      ...subcategory,
      tricks: (subcategory.tricks || []).filter((trick) => trick.is_published),
    })),
  }));

  return filteredData;
}

// Get all users for inventor selection in forms
export async function getUsers(): Promise<
  {
    id: string;
    first_name: string;
    last_name: string;
    username?: string | null;
  }[]
> {
  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, username")
    .order("first_name");

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }

  return data || [];
}

export async function getTrickComponents(trickId: string) {
  const { data, error } = await supabase
    .from("trick_components")
    .select("component_trick_id, sequence, component_details")
    .eq("trick_id", trickId)
    .order("sequence", { ascending: true });

  if (error) {
    console.error("Error fetching trick components:", error);
    throw new Error("Failed to fetch trick components");
  }

  return data || [];
}

// Get tricks by inventor (both user and name inventors)
export async function getTricksByInventor(
  inventorType: "user" | "name",
  inventorId: string,
  filters?: {
    limit?: number;
    offset?: number;
  }
): Promise<{ tricks: Trick[]; total: number }> {
  let query = supabase
    .from("tricks")
    .select(
      `
      *,
      subcategory:subcategories(
        name,
        slug,
        master_category:master_categories(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `,
      { count: "exact" }
    )
    .eq("is_published", true);

  if (inventorType === "user") {
    query = query.eq("inventor_user_id", inventorId);
  } else {
    query = query.eq("inventor_name", inventorId);
  }

  // Apply pagination
  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters?.limit || 20) - 1
    );
  } else if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error, count } = await query.order("updated_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching tricks by inventor:", error);
    throw new Error("Failed to fetch tricks by inventor");
  }

  return {
    tricks: data || [],
    total: count || 0,
  };
}

// Get unique inventors from all tricks (for filtering/search)
export async function getInventors(): Promise<{
  users: {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    username?: string | null;
  }[];
  names: string[];
}> {
  // Get user inventors
  const { data: userInventors, error: userError } = await supabase
    .from("tricks")
    .select(
      `
      inventor_user_id,
      inventor:users!tricks_inventor_user_id_fkey(id, first_name, last_name, username)
    `
    )
    .not("inventor_user_id", "is", null)
    .eq("is_published", true);

  if (userError) {
    console.error("Error fetching user inventors:", userError);
  }

  // Get name inventors
  const { data: nameInventors, error: nameError } = await supabase
    .from("tricks")
    .select("inventor_name")
    .not("inventor_name", "is", null)
    .eq("is_published", true);

  if (nameError) {
    console.error("Error fetching name inventors:", nameError);
  }

  // Process user inventors
  const uniqueUserInventors = new Map();
  (userInventors || []).forEach((trick: any) => {
    if (trick.inventor) {
      const inventor = trick.inventor;
      uniqueUserInventors.set(inventor.id, {
        id: inventor.id,
        name:
          inventor.username || `${inventor.first_name} ${inventor.last_name}`,
        first_name: inventor.first_name,
        last_name: inventor.last_name,
        username: inventor.username,
      });
    }
  });

  // Process name inventors
  const uniqueNameInventors = new Set();
  (nameInventors || []).forEach((trick: any) => {
    if (trick.inventor_name) {
      uniqueNameInventors.add(trick.inventor_name);
    }
  });

  return {
    users: Array.from(uniqueUserInventors.values()),
    names: Array.from(uniqueNameInventors) as string[],
  };
}

// Add these to your existing tricks-data.ts file

// First, add these types at the top of the file
export interface PrerequisiteTrick {
  id: string;
  name: string;
  slug: string;
  subcategory: {
    slug: string;
    master_category: {
      slug: string;
    };
  };
}

export interface TrickWithLinkedPrerequisites extends Trick {
  prerequisite_tricks?: PrerequisiteTrick[];
}

/**
 * Fetches prerequisite tricks for the given prerequisite IDs
 * @param ids Array of prerequisite UUIDs
 * @returns Array of prerequisite trick data
 */
export async function fetchPrerequisiteTricksByIds(
  ids: string[]
): Promise<PrerequisiteTrick[]> {
  if (!ids || ids.length === 0) return [];
  const { data, error } = await supabase
    .from("tricks")
    .select(
      `id, name, slug, subcategory:subcategories(slug, master_category:master_categories(slug))`
    )
    .in("id", ids)
    .eq("is_published", true);
  if (error) {
    console.error("Error fetching prerequisite tricks:", error);
    return [];
  }
  // @ts-expect-error FIX ME
  return data || [];
}
// Get trick by slug
export async function getTrickBySlug(slug: string): Promise<Trick | null> {
  const { data, error } = await supabase
    .from("tricks")
    .select(
      `
      *,
      subcategory:subcategories(
        name,
        slug,
        master_category:master_categories(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url),
      trick_components!trick_id(
        component_trick_id,
        sequence,
        component_details
      )
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single()
    // @ts-expect-error FIX ME
    .order("sequence", { foreignTable: "trick_components", ascending: true });

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No rows returned
    }
    console.error("Error fetching trick by slug:", error);
    throw new Error("Failed to fetch trick");
  }

  // Rename trick_components to components for consistency
  if (data && data.trick_components) {
    data.components = data.trick_components;
    delete data.trick_components;
  }

  return data;
}
/**
 * Enhanced getTrickBySlug that includes linked prerequisite tricks
 */
export async function getTrickBySlugWithLinks(
  slug: string
): Promise<TrickWithLinkedPrerequisites | null> {
  const trick = await getTrickBySlug(slug);

  if (
    !trick ||
    !trick.prerequisite_ids ||
    trick.prerequisite_ids.length === 0
  ) {
    return trick;
  }

  // Fetch linked tricks for prerequisites by IDs
  const prerequisiteTricks = await fetchPrerequisiteTricksByIds(
    trick.prerequisite_ids
  );

  return {
    ...trick,
    prerequisite_tricks: prerequisiteTricks,
  };
}

export async function toggleUserCanDoTrick(
  trickId: string,
  userId: string,
  canDo: boolean
): Promise<{ success: boolean; canDoCount: number }> {
  try {
    if (canDo) {
      // User can now do this trick - upsert the record
      const { error } = await supabase.from("user_tricks").upsert(
        {
          user_id: userId,
          trick_id: trickId,
          can_do: true,
          achieved_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,trick_id",
        }
      );

      if (error) throw error;
    } else {
      // User can't do this trick anymore - remove the record
      const { error } = await supabase
        .from("user_tricks")
        .delete()
        .eq("user_id", userId)
        .eq("trick_id", trickId);

      if (error) throw error;
    }

    // Get updated count
    const { count } = await supabase
      .from("user_tricks")
      .select("*", { count: "exact", head: true })
      .eq("trick_id", trickId)
      .eq("can_do", true);

    return {
      success: true,
      canDoCount: count || 0,
    };
  } catch (error) {
    console.error("Failed to toggle can-do status:", error);
    return {
      success: false,
      canDoCount: 0,
    };
  }
}

/**
 * Get user's progress statistics for a category
 */
export async function getUserProgressStats(
  userId: string,
  categorySlug?: string,
  subcategorySlug?: string
) {
  try {
    let query = supabase
      .from("user_tricks")
      .select(
        `
        trick:tricks!inner(
          difficulty_level,
          subcategory:subcategories!inner(
            slug,
            master_category:master_categories!inner(slug)
          )
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .eq("can_do", true);

    if (categorySlug) {
      query = query.eq(
        "tricks.subcategories.master_categories.slug",
        categorySlug
      );
    }

    if (subcategorySlug) {
      query = query.eq("tricks.subcategories.slug", subcategorySlug);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Group by difficulty level
    const byDifficulty = (data || []).reduce(
      (acc: Record<number, number>, item: any) => {
        const difficulty = item.trick.difficulty_level;
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      },
      {}
    );

    // Calculate progress by difficulty range
    const beginnerCount =
      (byDifficulty[1] || 0) + (byDifficulty[2] || 0) + (byDifficulty[3] || 0);
    const intermediateCount =
      (byDifficulty[4] || 0) + (byDifficulty[5] || 0) + (byDifficulty[6] || 0);
    const advancedCount = (byDifficulty[7] || 0) + (byDifficulty[8] || 0);
    const expertCount = (byDifficulty[9] || 0) + (byDifficulty[10] || 0);

    return {
      total: count || 0,
      byDifficulty,
      byRange: {
        beginner: beginnerCount,
        intermediate: intermediateCount,
        advanced: advancedCount,
        expert: expertCount,
      },
    };
  } catch (error) {
    console.error("Error fetching user progress stats:", error);
    return {
      total: 0,
      byDifficulty: {},
      byRange: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0,
      },
    };
  }
}

/**
 * Check if user can do a specific trick
 */
export async function checkUserCanDoTrick(
  userId: string,
  trickId: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("user_tricks")
      .select("can_do")
      .eq("user_id", userId)
      .eq("trick_id", trickId)
      .single();

    return data?.can_do || false;
  } catch (error) {
    console.error("Error checking can-do status:", error);
    return false;
  }
}

/**
 * Get all tricks a user can do
 */
export async function getUserCanDoTricks(
  userId: string,
  limit?: number,
  offset?: number
) {
  try {
    let query = supabase
      .from("user_tricks")
      .select(
        `
        achieved_at,
        notes,
        trick:tricks!inner(
          id,
          name,
          slug,
          difficulty_level,
          subcategory:subcategories!inner(
            name,
            slug,
            master_category:master_categories!inner(
              name,
              slug,
              color
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("can_do", true)
      .order("achieved_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching user's tricks:", error);
    return [];
  }
}

/**
 * Helper to check if a prerequisite string matches a known trick
 */
export function getPrerequisiteLink(
  prerequisiteId: string,
  prerequisiteTricks?: PrerequisiteTrick[]
): PrerequisiteTrick | undefined {
  if (!prerequisiteTricks) return undefined;
  return prerequisiteTricks.find((trick) => trick.id === prerequisiteId);
}

export async function searchPotentialPrerequisites(
  search: string,
  subcategoryId?: string,
  excludeTrickId?: string,
  categorySlug?: string // New parameter for category filtering
): Promise<
  {
    id: string;
    name: string;
    slug: string;
    category: string;
    categorySlug: string;
    subcategory: string;
    subcategorySlug: string;
  }[]
> {
  // Validate search input
  if (!search || search.trim().length < 2) {
    return [];
  }

  // Build the base query with category and subcategory info
  let query = supabase
    .from("tricks")
    .select(
      `
      id, 
      name, 
      slug,
      subcategory:subcategories(
        name,
        slug,
        master_category:master_categories(name, slug)
      )
    `
    )
    .ilike("name", `%${search.trim()}%`)
    .eq("is_published", true)
    .order("name")
    .limit(15);

  // FIXED: Add subcategory filter if provided
  if (subcategoryId) {
    query = query.eq("subcategory_id", subcategoryId);
  }

  // Add category filter if provided
  if (categorySlug) {
    query = query.eq("subcategories.master_categories.slug", categorySlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error searching prerequisites:", error);
    return [];
  }

  // If no data returned
  if (!data || data.length === 0) {
    console.log("No tricks found for search:", search);
    return [];
  }

  // Filter out the current trick if excludeTrickId is provided
  let results = data;
  if (excludeTrickId) {
    results = data.filter((trick) => trick.id !== excludeTrickId);
  }

  // Transform the results to include flattened category info
  return results.map((trick: any) => ({
    id: trick.id,
    name: trick.name,
    slug: trick.slug,
    category: trick.subcategory?.master_category?.name || "Unknown Category",
    categorySlug: trick.subcategory?.master_category?.slug || "",
    subcategory: trick.subcategory?.name || "Unknown Subcategory",
    subcategorySlug: trick.subcategory?.slug || "",
  }));
}

// Increment trick view count
export async function incrementTrickViews(
  trickId: string
): Promise<{ success: boolean; view_count?: number }> {
  try {
    // First, check if the trick exists and is published
    const { data: trick, error: fetchError } = await supabase
      .from("tricks")
      .select("id, view_count")
      .eq("id", trickId)
      .eq("is_published", true)
      .single();

    if (fetchError || !trick) {
      throw new Error("Trick not found");
    }

    // Update the view count
    const { error: updateError } = await supabase
      .from("tricks")
      .update({
        view_count: (trick.view_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", trickId);

    if (updateError) {
      throw updateError;
    }

    // Get the updated view count
    const { data: updatedTrick, error: getError } = await supabase
      .from("tricks")
      .select("view_count")
      .eq("id", trickId)
      .single();

    if (getError) {
      throw getError;
    }

    return {
      success: true,
      view_count: updatedTrick.view_count,
    };
  } catch (error) {
    console.error("Error incrementing trick views:", error);
    return { success: false };
  }
}
