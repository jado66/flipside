import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login to track your progress" },
        { status: 401 }
      );
    }

    // Get the request body
    const { trickId, canDo } = await request.json();

    if (!trickId) {
      return NextResponse.json(
        { error: "Trick ID is required" },
        { status: 400 }
      );
    }

    if (canDo) {
      // User can now do this trick - upsert the record
      const { error } = await supabase.from("user_tricks").upsert(
        {
          user_id: user.id,
          trick_id: trickId,
          can_do: true,
          achieved_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,trick_id",
        }
      );

      if (error) {
        console.error("Error updating user_tricks:", error);
        return NextResponse.json(
          { error: "Failed to update trick status" },
          { status: 500 }
        );
      }
    } else {
      // User can't do this trick anymore - remove the record
      const { error } = await supabase
        .from("user_tricks")
        .delete()
        .eq("user_id", user.id)
        .eq("trick_id", trickId);

      if (error) {
        console.error("Error deleting user_tricks record:", error);
        return NextResponse.json(
          { error: "Failed to update trick status" },
          { status: 500 }
        );
      }
    }

    // Get the updated count of users who can do this trick
    const { count } = await supabase
      .from("user_tricks")
      .select("*", { count: "exact", head: true })
      .eq("trick_id", trickId)
      .eq("can_do", true);

    return NextResponse.json({
      success: true,
      canDo,
      canDoCount: count || 0,
    });
  } catch (error) {
    console.error("Error in toggle-can-do API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
