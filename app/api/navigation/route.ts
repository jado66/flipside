import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";
// Use the singleton Supabase server client
const supabase = supabaseServer;

export async function GET(request: NextRequest) {
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
      return NextResponse.json(
        { error: "Failed to fetch navigation data" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
