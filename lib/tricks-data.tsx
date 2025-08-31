import { supabase } from "./supbase";

export interface Trick {
  id: string;
  subcategory_id: string;
  name: string;
  slug: string;
  description: string | null;
  difficulty_level: number | null;
  prerequisites: string[] | null;
  step_by_step_guide:
    | {
        step: number;
        title: string;
        description: string;
        tips?: string[];
      }[]
    | null;
  tips_and_tricks: string | null;
  common_mistakes: string | null;
  safety_notes: string | null;
  video_urls: string[] | null;
  image_urls: string[] | null;
  tags: string[] | null;
  view_count: number;
  like_count: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // New inventor fields
  inventor_user_id: string | null;
  inventor_name: string | null;
  // Joined data
  subcategory?: {
    name: string;
    slug: string;
    master_category: {
      name: string;
      slug: string;
      color: string | null;
    };
  };
  author?: {
    first_name: string;
    last_name: string;
    profile_image_url?: string | null;
  };
  inventor?: {
    first_name: string;
    last_name: string;
    username?: string | null;
    profile_image_url?: string | null;
  };
}

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
  let query = supabase
    .from("tricks")
    .select(
      `
      *,
      subcategory:subcategories!inner(
        name,
        slug,
        master_category:master_categories!inner(name, slug, color)
      ),
      author:users!tricks_created_by_fkey(first_name, last_name, profile_image_url),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `,
      { count: "exact" }
    )
    .eq("is_published", true);

  // Apply filters - first get subcategory_id if filtering by subcategory slug
  if (filters?.subcategory) {
    // First, get the subcategory by slug to get its ID
    const { data: subcategoryData } = await supabase
      .from("subcategories")
      .select("id")
      .eq("slug", filters.subcategory)
      .single();

    if (subcategoryData) {
      query = query.eq("subcategory_id", subcategoryData.id);
    }
  }

  // For category filter, we need to join through subcategories
  if (filters?.category && !filters?.subcategory) {
    // Get all subcategories for this category
    const { data: categoryData } = await supabase
      .from("master_categories")
      .select("id")
      .eq("slug", filters.category)
      .single();

    if (categoryData) {
      const { data: subcategoriesData } = await supabase
        .from("subcategories")
        .select("id")
        .eq("master_category_id", categoryData.id);

      if (subcategoriesData && subcategoriesData.length > 0) {
        const subcategoryIds = subcategoriesData.map((s) => s.id);
        query = query.in("subcategory_id", subcategoryIds);
      }
    }
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
      author:users!tricks_created_by_fkey(first_name, last_name, profile_image_url),
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
    | "author"
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
      author:users!tricks_created_by_fkey(first_name, last_name, profile_image_url),
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
      author:users!tricks_created_by_fkey(first_name, last_name, profile_image_url),
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
      author:users!tricks_created_by_fkey(first_name, last_name, profile_image_url),
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
