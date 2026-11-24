import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";
import { supabaseConfig } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  return (
    <Card className="w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-muted-foreground">Open your AutiConnect dashboard.</p>
      {notice === "confirmation" && (
        <p role="alert" className="mt-4 text-sm text-destructive">This confirmation link could not be used. Sign in or request a new link.</p>
      )}
      {supabaseConfig()
        ? <AuthForm mode="login" />
        : <p role="status" className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Sign-in is unavailable until Supabase is configured.
          </p>}
      <p className="mt-6 text-sm text-muted-foreground">
        New to AutiConnect? <Link href="/register" className="font-semibold text-primary underline">Create an account</Link>
      </p>
    </Card>
  );
}
