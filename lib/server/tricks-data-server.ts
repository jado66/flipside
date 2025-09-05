import {
  PrerequisiteTrick,
  Trick,
  TrickData,
  TrickWithLinkedPrerequisites,
} from "@/types/trick";
import { supabaseServer } from "../supabase/supabase-server";

// Get tricks with filters
export async function getTricks(filters?: {
  category?: string;
  subcategory?: string;
  difficulty?: number;
  search?: string;
  inventor_user_id?: string;
  inventor_name?: string;
  limit?: number;
  offset?: number;
}): Promise<{ tricks: Trick[]; total: number }> {
  let query = supabaseServer
    .from("tricks")
    .select(
      `
      *,
      subcategory:subcategories!inner(
        name,
        slug,
        master_category:master_categories!inner(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `,
      { count: "exact" }
    )
    .eq("is_published", true);

  // Apply category filter using nested filtering
  if (filters?.category) {
    query = query.eq("subcategories.master_categories.slug", filters.category);
  }

  // Apply subcategory filter
  if (filters?.subcategory) {
    query = query.eq("subcategories.slug", filters.subcategory);
  }

  if (filters?.difficulty) {
    query = query.eq("difficulty_level", filters.difficulty);
  }

  if (filters?.search) {
    query = query.textSearch("search_text", filters.search);
  }

  // Filter by inventor
  if (filters?.inventor_user_id) {
    query = query.eq("inventor_user_id", filters.inventor_user_id);
  }

  if (filters?.inventor_name) {
    query = query.eq("inventor_name", filters.inventor_name);
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
    console.error("Error fetching tricks:", error);
    throw new Error("Failed to fetch tricks");
  }

  return {
    tricks: data || [],
    total: count || 0,
  };
}

// Get trick by slug
export async function getTrickBySlug(
  slug: string,
  categorySlug?: string,
  subcategorySlug?: string
): Promise<TrickData | null> {
  let query = supabaseServer
    .from("tricks")
    .select(
      `
      *,
      subcategory:subcategories!inner(
        name,
        slug,
        master_category:master_categories!inner(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `
    )
    .eq("slug", slug)
    .eq("is_published", true);

  // Apply category filter if provided
  if (categorySlug) {
    query = query.eq("subcategories.master_categories.slug", categorySlug);
  }

  // Apply subcategory filter if provided
  if (subcategorySlug) {
    query = query.eq("subcategories.slug", subcategorySlug);
  }

  const { data, error } = await query.single();

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
  slug: string,
  categorySlug?: string,
  subcategorySlug?: string
): Promise<TrickWithLinkedPrerequisites | null> {
  const trick = await getTrickBySlug(slug, categorySlug, subcategorySlug);

  if (!trick || !trick.prerequisites || trick.prerequisites.length === 0) {
    return trick as TrickWithLinkedPrerequisites | null;
  }

  // Fetch linked tricks for prerequisites within the same category context
  const prerequisiteMap = await fetchPrerequisiteTricks(
    trick.prerequisites,
    categorySlug // Pass category context to limit prerequisite search
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
  } as TrickWithLinkedPrerequisites;
}

/**
 * Fetches prerequisite tricks for the given prerequisite names
 * @param prerequisites Array of prerequisite strings
 * @returns Map of prerequisite text to trick data
 */
export async function fetchPrerequisiteTricks(
  prerequisites: string[],
  categorySlug?: string
): Promise<Map<string, PrerequisiteTrick>> {
  const prerequisiteMap = new Map<string, PrerequisiteTrick>();

  if (!prerequisites || prerequisites.length === 0) {
    return prerequisiteMap;
  }

  // Clean up prerequisites for matching (case-insensitive)
  const cleanedPrerequisites = prerequisites.map((p) => p.trim());

  // Build query to find matching tricks
  let query = supabaseServer
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

  // Limit search to specific category if provided
  if (categorySlug) {
    query = query.eq("subcategories.master_categories.slug", categorySlug);
  }

  // Use case-insensitive matching for each prerequisite
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

// Get navigation data with hierarchical structure for side nav (server-side)
export async function getNavigationData() {
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
  const filteredData = (data || []).map(category => ({
    ...category,
    subcategories: (category.subcategories || []).map(subcategory => ({
      ...subcategory,
      tricks: (subcategory.tricks || []).filter(trick => trick.is_published)
    }))
  }));

  return filteredData;
}

// Get master categories with counts (server-side)
export async function getMasterCategories() {
  try {
    const { data, error } = await supabaseServer.rpc(
      "get_master_categories_with_counts"
    );

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching master categories:", error);
    return [];
  }
}
