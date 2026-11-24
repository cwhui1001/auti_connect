import { apiOrigin } from "@/lib/env";

type ApiResult =
  | { status: "unauthenticated" | "unavailable" }
  | { status: "ok"; displayName: string | null };

async function apiRequest(path: string, init?: RequestInit) {
  const url = apiOrigin();
  if (!url) return null;
  try {
    return await fetch(`${url}/api/v1${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    return null;
  }
}

export async function checkApi() {
  const response = await apiRequest("/health");
  if (!response?.ok) return false;
  const body = await response.json().catch(() => null);
  return body?.status === "ok";
}

export async function profileRequest(accessToken: string, displayName?: string): Promise<ApiResult> {
  const headers = new Headers({ Authorization: `Bearer ${accessToken}` });
  if (displayName !== undefined) headers.set("Content-Type", "application/json");
  const response = await apiRequest("/profile", {
    method: displayName === undefined ? "GET" : "PUT",
    headers,
    body: displayName === undefined ? undefined : JSON.stringify({ display_name: displayName }),
  });

  if (response?.status === 401) return { status: "unauthenticated" };
  if (!response?.ok) return { status: "unavailable" };

  const body = await response.json().catch(() => null);
  if (body?.profile === null && displayName === undefined) return { status: "ok", displayName: null };
  if (typeof body?.profile?.display_name !== "string") return { status: "unavailable" };
  return { status: "ok", displayName: body.profile.display_name };
}
