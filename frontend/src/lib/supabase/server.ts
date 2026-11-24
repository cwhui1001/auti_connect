import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

import { appOrigin, supabaseConfig } from "@/lib/env";

export function sessionCookieOptions() {
  return { httpOnly: true, secure: appOrigin()?.startsWith("https://") ?? false };
}

export function hasAccount(claims?: Record<string, unknown>) {
  return Boolean(
    typeof claims?.sub === "string" &&
    claims.sub &&
    claims.role === "authenticated" &&
    claims.is_anonymous !== true,
  );
}

export async function createSupabase() {
  const config = supabaseConfig();
  if (!config) return null;
  const store = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookieOptions: sessionCookieOptions(),
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try {
          for (const { name, value, options } of values) store.set(name, value, options);
        } catch {
          // Server Components cannot write cookies. The Proxy refreshes dashboard sessions.
        }
      },
    },
  });
}

export const verifiedAccessToken = cache(async function verifiedAccessToken() {
  const supabase = await createSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getClaims();
  if (error || !hasAccount(data?.claims)) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData.session?.access_token ?? null;
});
