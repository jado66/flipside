// app/auth/callback/route.ts
import { createServer } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  console.log("OAuth callback received:", {
    code: !!code,
    error,
    error_description,
  });

  if (error) {
    console.error("OAuth error:", error, error_description);
    // Redirect to login with error
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(
        error_description || error
      )}`
    );
  }

  if (code) {
    try {
      const supabase = createServer();

      console.log("Exchanging code for session...");
      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(
            "Authentication failed"
          )}`
        );
      }

      console.log("Session exchange successful:", {
        user: data.user?.email,
        session: !!data.session,
      });

      // Verify the session was created
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      console.log("Session verification:", {
        hasSession: !!sessionData.session,
        error: sessionError,
      });
    } catch (error) {
      console.error("Unexpected error in OAuth callback:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(
          "Authentication failed"
        )}`
      );
    }
  }

  // Redirect to dashboard or home page after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
