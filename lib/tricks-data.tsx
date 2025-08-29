import { createClient } from "./client";

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
}

// Get tricks with filters
export async function getTricks(filters?: {
  category?: string;
  subcategory?: string;
  difficulty?: number;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ tricks: Trick[]; total: number }> {
  const supabase = await createClient();

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
      author:users(first_name, last_name, profile_image_url)
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
  const supabase = await createClient();

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
      author:users(first_name, last_name, profile_image_url)
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
  >
): Promise<Trick> {
  const supabase = await createClient();

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
      author:users(first_name, last_name, profile_image_url)
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
  const supabase = await createClient();

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
      author:users(first_name, last_name, profile_image_url)
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
  const supabase = await createClient();

  const { error } = await supabase.from("tricks").delete().eq("id", id);

  if (error) {
    console.error("Error deleting trick:", error);
    throw new Error("Failed to delete trick");
  }
}

// Increment trick view count
export async function incrementTrickViews(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_trick_views", {
    trick_id: id,
  });

  if (error) {
    console.error("Error incrementing trick views:", error);
    // Don't throw error for view count increment failures
  }
}

// Toggle trick like (you'll need to implement a likes table)
export async function toggleTrickLike(
  trickId: string,
  userId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const supabase = await createClient();

  // Check if user already liked this trick
  const { data: existingLike } = await supabase
    .from("trick_likes")
    .select("id")
    .eq("trick_id", trickId)
    .eq("user_id", userId)
    .single();

  let liked: boolean;

  if (existingLike) {
    // Remove like
    await supabase
      .from("trick_likes")
      .delete()
      .eq("trick_id", trickId)
      .eq("user_id", userId);
    liked = false;
  } else {
    // Add like
    await supabase
      .from("trick_likes")
      .insert([{ trick_id: trickId, user_id: userId }]);
    liked = true;
  }

  // Get updated like count
  const { count } = await supabase
    .from("trick_likes")
    .select("*", { count: "exact", head: true })
    .eq("trick_id", trickId);

  // Update trick like count
  await supabase
    .from("tricks")
    .update({ like_count: count || 0 })
    .eq("id", trickId);

  return { liked, likeCount: count || 0 };
}

// Get navigation data with hierarchical structure for side nav
export async function getNavigationData() {
  const supabase = await createClient();

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
