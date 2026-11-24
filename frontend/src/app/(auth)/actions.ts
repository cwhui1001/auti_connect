"use server";

import { redirect } from "next/navigation";

import { appOrigin } from "@/lib/env";
import { createSupabase } from "@/lib/supabase/server";

export type AuthState = { kind: "error" | "success"; message: string } | null;

const unavailable = { kind: "error", message: "Sign-in is temporarily unavailable." } as const;

function credentials(form: FormData) {
  const email = form.get("email");
  const password = form.get("password");
  if (typeof email !== "string" || typeof password !== "string") return null;
  const address = email.trim();
  if (address.length > 254 || !/^[^\s@]+@[^\s@]+$/.test(address) || !password || password.length > 256) {
    return null;
  }
  return { email: address, password };
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const values = credentials(form);
  if (!values) return { kind: "error", message: "Enter a valid email address and password." };
  const supabase = await createSupabase();
  if (!supabase) return unavailable;

  const { error } = await supabase.auth.signInWithPassword(values);
  if (!error) redirect("/dashboard");
  if (!error.status || error.status >= 500) return unavailable;
  if (error.code === "email_not_confirmed") {
    return { kind: "error", message: "Confirm your email address before signing in." };
  }
  return { kind: "error", message: "Could not sign in. Check your email address and password." };
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const values = credentials(form);
  if (!values || values.password.length < 8 || new TextEncoder().encode(values.password).length > 72) {
    return {
      kind: "error",
      message: "Enter a valid email address and a password of at least 8 characters and at most 72 bytes.",
    };
  }
  const supabase = await createSupabase();
  const siteOrigin = appOrigin();
  if (!supabase || !siteOrigin) return unavailable;

  const { data, error } = await supabase.auth.signUp({
    ...values,
    options: { emailRedirectTo: new URL("/auth/confirm", siteOrigin).href },
  });
  if (error) {
    if (!error.status || error.status >= 500) return unavailable;
    return { kind: "error", message: "Could not create the account. Check the details and try again." };
  }
  if (data.session) redirect("/dashboard");
  return { kind: "success", message: "Check your email for a confirmation link." };
}

export async function signOut() {
  const supabase = await createSupabase();
  if (supabase) {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) redirect("/dashboard?notice=sign-out");
  }
  redirect("/login");
}
