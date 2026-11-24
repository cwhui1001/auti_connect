"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { profileRequest } from "@/lib/api";
import { verifiedAccessToken } from "@/lib/supabase/server";

export type ProfileState = { kind: "error" | "fieldError" | "success"; message: string } | null;

export async function saveProfile(_: ProfileState, form: FormData): Promise<ProfileState> {
  const accessToken = await verifiedAccessToken();
  if (!accessToken) redirect("/login");

  const input = form.get("displayName");
  const name = typeof input === "string" ? input.trim() : "";
  if (!name || [...name].length > 80 || /[\p{Cc}\p{Zl}\p{Zp}]/u.test(name)) {
    return { kind: "fieldError", message: "Enter a single-line display name of 1 to 80 characters." };
  }
  const result = await profileRequest(accessToken, name);
  if (result.status === "unauthenticated") redirect("/login");
  if (result.status !== "ok") return { kind: "error", message: "Your profile could not be saved. Try again." };

  revalidatePath("/dashboard");
  return { kind: "success", message: "Profile saved." };
}
