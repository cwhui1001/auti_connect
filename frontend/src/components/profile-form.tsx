"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";

import { saveProfile } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileForm({ displayName }: { displayName: string | null }) {
  const [name, setName] = useState(displayName ?? "");
  const [state, action, pending] = useActionState(saveProfile, null);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="space-y-2">
        <label htmlFor="display-name" className="block text-sm font-semibold">Display name</label>
        <Input
          id="display-name"
          name="displayName"
          autoComplete="nickname"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={state?.kind === "fieldError" || undefined}
          aria-describedby="profile-feedback"
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
        <div id="profile-feedback" aria-live="polite" aria-atomic="true">
          {state && <p className={state.kind === "success" ? "text-sm text-primary" : "text-sm text-destructive"}>
            {state.message}
          </p>}
        </div>
      </div>
    </form>
  );
}

export function RetryProfileButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="outline" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
      {pending ? "Retrying…" : "Try again"}
    </Button>
  );
}
