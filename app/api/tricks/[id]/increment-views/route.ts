// app/api/tricks/[id]/increment-views/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Trick ID is required" },
        { status: 400 }
      );
    }

    // First, check if the trick exists and is published
    const { data: trick, error: fetchError } = await supabaseService
      .from("tricks")
      .select("id, view_count")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (fetchError || !trick) {
      return NextResponse.json({ error: "Trick not found" }, { status: 404 });
    }

    // Increment the view count using the RPC function or direct update
    // Option 1: Using RPC (if you have the function)
    const { error: rpcError } = await supabaseService.rpc(
      "increment_trick_views",
      {
        trick_id: id,
      }
    );

    if (rpcError) {
      // Option 2: Fallback to direct update
      console.log("RPC failed, using direct update:", rpcError);

      const { error: updateError } = await supabaseService
        .from("tricks")
        .update({
          view_count: (trick.view_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }
    }

    // Get the updated view count
    const { data: updatedTrick, error: getError } = await supabaseService
      .from("tricks")
      .select("view_count")
      .eq("id", id)
      .single();

    if (getError) {
      throw getError;
    }

    return NextResponse.json({
      success: true,
      view_count: updatedTrick.view_count,
    });
  } catch (error) {
    console.error("Error incrementing trick views:", error);
    return NextResponse.json(
      { error: "Failed to increment views" },
      { status: 500 }
    );
  }
}
