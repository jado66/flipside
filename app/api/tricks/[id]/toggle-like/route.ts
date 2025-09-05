// app/api/tricks/[id]/toggle-like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/supabase-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trickId = id;
    const body = await request.json();
    const { userId } = body;

    if (!trickId) {
      return NextResponse.json(
        { error: "Trick ID is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // First, check if the trick exists and is published
    const { data: trick, error: trickError } = await supabaseService
      .from("tricks")
      .select("id, like_count")
      .eq("id", trickId)
      .eq("is_published", true)
      .single();

    if (trickError || !trick) {
      return NextResponse.json({ error: "Trick not found" }, { status: 404 });
    }

    // Check if user already liked this trick
    const { data: existingLike, error: likeCheckError } = await supabaseService
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
      const { error: deleteError } = await supabaseService
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
      const { error: insertError } = await supabaseService
        .from("trick_likes")
        .insert([
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
    const { error: updateError } = await supabaseService
      .from("tricks")
      .update({
        like_count: newLikeCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", trickId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      liked,
      likeCount: newLikeCount,
    });
  } catch (error) {
    console.error("Error toggling trick like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
