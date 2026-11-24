"use client";

import { useActionState } from "react";

import { signIn, signUp } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [state, action, pending] = useActionState(register ? signUp : signIn, null);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold">Email address</label>
        <Input id="email" name="email" type="email" autoComplete="email" required maxLength={254} />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold">Password</label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          required
          minLength={register ? 8 : undefined}
          maxLength={register ? 72 : 256}
          aria-describedby={register ? "password-hint" : undefined}
        />
        {register && <p id="password-hint" className="text-sm text-muted-foreground">Use at least 8 characters.</p>}
      </div>
      <div aria-live="polite" aria-atomic="true">
        {state && <p className={state.kind === "error" ? "text-sm text-destructive" : "text-sm text-primary"}>{state.message}</p>}
      </div>
      <Button className="w-full" type="submit" disabled={pending}>
        {register ? (pending ? "Creating account…" : "Create account") : (pending ? "Signing in…" : "Sign in")}
      </Button>
    </form>
  );
}
