import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseConfig } from "@/lib/env";
import { hasAccount, sessionCookieOptions } from "@/lib/supabase/server";

export async function proxy(request: NextRequest) {
  const settings = supabaseConfig();
  let response = NextResponse.next({ request });

  if (settings) {
    const supabase = createServerClient(settings.url, settings.publishableKey, {
      cookieOptions: sessionCookieOptions(),
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          for (const { name, value } of values) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of values) response.cookies.set(name, value, options);
        },
      },
    });

    const { data, error } = await supabase.auth.getClaims();
    if (!error && hasAccount(data?.claims)) {
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  const signIn = NextResponse.redirect(new URL("/login", request.url));
  for (const cookie of response.cookies.getAll()) signIn.cookies.set(cookie);
  signIn.headers.set("Cache-Control", "private, no-store");
  return signIn;
}

export const config = { matcher: ["/dashboard/:path*"] };
