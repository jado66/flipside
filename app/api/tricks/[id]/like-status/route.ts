// app/api/tricks/[id]/like-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/supabase-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trickId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!trickId) {
      return NextResponse.json(
        { error: "Trick ID is required" },
        { status: 400 }
      );
    }

    // Get trick like count
    const { data: trick, error: trickError } = await supabaseService
      .from("tricks")
      .select("like_count")
      .eq("id", trickId)
      .eq("is_published", true)
      .single();

    if (trickError || !trick) {
      return NextResponse.json({ error: "Trick not found" }, { status: 404 });
    }

    let liked = false;

    // Check if user has liked this trick (only if userId is provided)
    if (userId) {
      const { data: existingLike, error: likeError } = await supabaseService
        .from("trick_likes")
        .select("id")
        .eq("trick_id", trickId)
        .eq("user_id", userId)
        .maybeSingle();

      if (likeError) {
        console.error("Error checking like status:", likeError);
        // Don't throw error, just continue with liked = false
      } else {
        liked = !!existingLike;
      }
    }

    return NextResponse.json({
      success: true,
      liked,
      likeCount: trick.like_count || 0,
    });
  } catch (error) {
    console.error("Error getting like status:", error);
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trickId } = await params;
    const body = await request.json();
    const { userIds } = body; // Array of user IDs to check

    if (!trickId) {
      return NextResponse.json(
        { error: "Trick ID is required" },
        { status: 400 }
      );
    }

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    // Get trick like count
    const { data: trick, error: trickError } = await supabaseService
      .from("tricks")
      .select("like_count")
      .eq("id", trickId)
      .eq("is_published", true)
      .single();

    if (trickError || !trick) {
      return NextResponse.json({ error: "Trick not found" }, { status: 404 });
    }

    // Get all likes for this trick from the provided user IDs
    const { data: likes, error: likesError } = await supabaseService
      .from("trick_likes")
      .select("user_id")
      .eq("trick_id", trickId)
      .in("user_id", userIds);

    if (likesError) {
      throw likesError;
    }

    // Create a map of userId -> liked status
    const likedByUser = userIds.reduce((acc, userId) => {
      acc[userId] = likes?.some((like) => like.user_id === userId) || false;
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json({
      success: true,
      likeCount: trick.like_count || 0,
      likedByUser,
    });
  } catch (error) {
    console.error("Error getting bulk like status:", error);
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 }
    );
  }
}
