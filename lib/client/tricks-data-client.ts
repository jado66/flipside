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
    | "like_count"
    | "subcategory"
    | "inventor"
  >
): Promise<Trick> {
  const { data: newTrick, error } = await supabase
    .from("tricks")
    .insert([
      {
        ...data,
        view_count: 0,
        like_count: 0,
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

  if (error) {
    console.error("Error creating trick:", error);
    throw new Error("Failed to create trick");
  }

  return newTrick;
}

// Update trick
export async function updateTrick(
  id: string,
  data: Partial<Trick>
): Promise<Trick> {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedTrick, error } = await supabase
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

  if (error) {
    console.error("Error updating trick:", error);
    throw new Error("Failed to update trick");
  }

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
      subcategories!inner(
        id,
        name,
        slug,
        sort_order,
        tricks!inner(
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
    .eq("subcategories.tricks.is_published", true)
    .order("sort_order")
    .order("sort_order", { foreignTable: "subcategories" })
    .order("name", { foreignTable: "subcategories.tricks" });

  if (error) {
    console.error("Error fetching navigation data:", error);
    throw new Error("Failed to fetch navigation data");
  }

  return data;
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
 * Fetches prerequisite tricks for the given prerequisite names
 * @param prerequisites Array of prerequisite strings
 * @returns Map of prerequisite text to trick data
 */
export async function fetchPrerequisiteTricks(
  prerequisites: string[]
): Promise<Map<string, PrerequisiteTrick>> {
  const prerequisiteMap = new Map<string, PrerequisiteTrick>();

  if (!prerequisites || prerequisites.length === 0) {
    return prerequisiteMap;
  }

  // Clean up prerequisites for matching (case-insensitive)
  const cleanedPrerequisites = prerequisites.map((p) => p.trim());

  // Build query to find matching tricks across all subcategories
  let query = supabase
    .from("tricks")
    .select(
      `
      id,
      name,
      slug,
      subcategory:subcategories!inner(
        slug,
        master_category:master_categories!inner(
          slug
        )
      )
    `
    )
    .eq("is_published", true);

  // Use case-insensitive matching for each prerequisite
  // We'll fetch all potential matches and filter client-side for exact matching
  const orConditions = cleanedPrerequisites
    .map((p) => `name.ilike.%${p}%`)
    .join(",");

  query = query.or(orConditions);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching prerequisite tricks:", error);
    return prerequisiteMap;
  }

  // Create map of prerequisite text to trick data with exact case-insensitive matching
  data?.forEach((trick) => {
    const trickNameLower = trick.name.toLowerCase();
    prerequisites.forEach((prereq) => {
      if (prereq.toLowerCase() === trickNameLower) {
        // @ts-expect-error TODO fix me
        prerequisiteMap.set(prereq, trick as PrerequisiteTrick);
      }
    });
  });

  return prerequisiteMap;
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
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No rows returned
    }
    console.error("Error fetching trick by slug:", error);
    throw new Error("Failed to fetch trick");
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

  if (!trick || !trick.prerequisites || trick.prerequisites.length === 0) {
    return trick;
  }

  // Fetch linked tricks for prerequisites
  const prerequisiteMap = await fetchPrerequisiteTricks(
    trick.prerequisites,
    // @ts-expect-error TODO fix me
    trick.subcategory_id
  );

  // Add the linked tricks to the response, maintaining the original order
  const prerequisiteTricks: PrerequisiteTrick[] = [];
  trick.prerequisites.forEach((prereq) => {
    const linkedTrick = prerequisiteMap.get(prereq);
    if (linkedTrick) {
      prerequisiteTricks.push(linkedTrick);
    }
  });

  return {
    ...trick,
    prerequisite_tricks: prerequisiteTricks,
  };
}

/**
 * Helper to check if a prerequisite string matches a known trick
 */
export function getPrerequisiteLink(
  prerequisiteText: string,
  prerequisiteTricks?: PrerequisiteTrick[]
): PrerequisiteTrick | undefined {
  if (!prerequisiteTricks) return undefined;

  return prerequisiteTricks.find(
    (trick) => trick.name.toLowerCase() === prerequisiteText.toLowerCase()
  );
}

export async function searchPotentialPrerequisites(
  search: string,
  subcategoryId?: string, // Keep for backwards compatibility but don't use
  excludeTrickId?: string
): Promise<{ id: string; name: string; slug: string }[]> {
  // Validate search input
  if (!search || search.trim().length < 2) {
    return [];
  }

  // Build the base query
  const { data, error } = await supabase
    .from("tricks")
    .select("id, name, slug")
    .ilike("name", `%${search.trim()}%`)
    .eq("is_published", true)
    .order("name")
    .limit(10);

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
    console.log(
      `Filtered out trick with ID ${excludeTrickId}, ${results.length} results remaining`
    );
  }

  return results;
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

// Toggle trick like status
export async function toggleTrickLike(
  trickId: string,
  userId: string
): Promise<{ success: boolean; liked?: boolean; likeCount?: number }> {
  try {
    if (!trickId || !userId) {
      throw new Error("Trick ID and User ID are required");
    }

    // First, check if the trick exists and is published
    const { data: trick, error: trickError } = await supabase
      .from("tricks")
      .select("id, like_count")
      .eq("id", trickId)
      .eq("is_published", true)
      .single();

    if (trickError || !trick) {
      throw new Error("Trick not found");
    }

    // Check if user already liked this trick
    const { data: existingLike, error: likeCheckError } = await supabase
      .from("trick_likes")
      .select("id")
      .eq("trick_id", trickId)
      .eq("user_id", userId)
      .maybeSingle();

    if (likeCheckError) {
      throw likeCheckError;
    }

    let liked: boolean;
    let newLikeCount: number;

    if (existingLike) {
      // Remove like
      const { error: deleteError } = await supabase
        .from("trick_likes")
        .delete()
        .eq("trick_id", trickId)
        .eq("user_id", userId);

      if (deleteError) {
        throw deleteError;
      }

      liked = false;
      newLikeCount = Math.max((trick.like_count || 0) - 1, 0);
    } else {
      // Add like
      const { error: insertError } = await supabase.from("trick_likes").insert([
        {
          trick_id: trickId,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      liked = true;
      newLikeCount = (trick.like_count || 0) + 1;
    }

    // Update trick like count
    const { error: updateError } = await supabase
      .from("tricks")
      .update({
        like_count: newLikeCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", trickId);

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      liked,
      likeCount: newLikeCount,
    };
  } catch (error) {
    console.error("Error toggling trick like:", error);
    return { success: false };
  }
}
