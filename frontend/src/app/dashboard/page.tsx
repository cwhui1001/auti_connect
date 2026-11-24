import { Activity, CircleCheck, CircleHelp, UserRound } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm, RetryProfileButton } from "@/components/profile-form";
import { Card } from "@/components/ui/card";
import { checkApi, profileRequest } from "@/lib/api";
import { verifiedAccessToken } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const token = await verifiedAccessToken();
  if (!token) redirect("/login");

  const [profile, apiOnline, { notice }] = await Promise.all([
    profileRequest(token), checkApi(), searchParams,
  ]);
  if (profile.status === "unauthenticated") redirect("/login");

  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Manage your profile and check the workspace connection.</p>
      {notice === "sign-out" && (
        <p role="alert" className="mt-4 text-sm text-destructive">Sign-out was interrupted. Try again.</p>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <Card id="profile" aria-labelledby="profile-heading" className="scroll-mt-6">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-primary">
              <UserRound size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id="profile-heading" className="text-xl font-semibold tracking-tight">Your profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose the name shown in AutiConnect.</p>
            </div>
          </div>
          {profile.status === "ok" ? (
            <>
              {profile.displayName === null && (
                <p className="mt-5 rounded-lg bg-muted p-3 text-sm text-muted-foreground">No display name saved yet.</p>
              )}
              <ProfileForm displayName={profile.displayName} />
            </>
          ) : (
            <div role="status" className="mt-6 space-y-3">
              <p className="text-sm text-destructive">Your profile is temporarily unavailable.</p>
              <RetryProfileButton />
            </div>
          )}
        </Card>

        <Card id="connection" aria-labelledby="connection-heading" className="scroll-mt-6 self-start">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-primary">
              <Activity size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id="connection-heading" className="text-xl font-semibold tracking-tight">Connection</h2>
              <p className="mt-1 text-sm text-muted-foreground">Application API</p>
            </div>
          </div>
          <p className="mt-5 flex items-center gap-2 rounded-lg bg-muted p-3 text-sm font-medium">
            {apiOnline
              ? <><CircleCheck size={17} className="text-primary" aria-hidden="true" /> Connected</>
              : <><CircleHelp size={17} className="text-destructive" aria-hidden="true" /> Temporarily unavailable</>}
          </p>
        </Card>
      </div>
    </>
  );
}
