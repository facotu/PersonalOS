import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";

  // OPEN REDIRECT AUDIT & PROTECT:
  // Ensure 'next' param is a relative path starting with a single '/' and no leading protocol/domain
  if (!next.startsWith("/") || next.startsWith("//") || next.includes(":\\")) {
    next = "/dashboard";
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Ensure profile exists in profiles table
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            avatar_url: user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to login with sanitized error indicator
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
