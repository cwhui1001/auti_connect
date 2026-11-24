import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { Card } from "@/components/ui/card";
import { appOrigin, supabaseConfig } from "@/lib/env";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
      <p className="mt-2 text-muted-foreground">Set up your AutiConnect account.</p>
      {supabaseConfig() && appOrigin()
        ? <AuthForm mode="register" />
        : <p role="status" className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Registration is unavailable until Supabase and the application URL are configured.
          </p>}
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="font-semibold text-primary underline">Sign in</Link>
      </p>
    </Card>
  );
}
