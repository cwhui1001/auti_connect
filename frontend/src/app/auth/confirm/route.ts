import { type NextRequest, NextResponse } from "next/server";

import { appOrigin } from "@/lib/env";
import { createSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const siteOrigin = appOrigin();
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const supabase = await createSupabase();
  let destination = "/login?notice=confirmation";

  if (siteOrigin && supabase) {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) destination = "/dashboard";
    } else if (tokenHash && params.get("type") === "email") {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
      if (!error) destination = "/dashboard";
    }
  }

  const response = NextResponse.redirect(new URL(destination, siteOrigin ?? request.nextUrl.origin));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
