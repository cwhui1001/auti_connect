function origin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash
    ) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function supabaseConfig() {
  const url = origin(process.env.SUPABASE_URL);
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url?.startsWith("https://") || !publishableKey?.startsWith("sb_publishable_")) {
    return null;
  }
  return { url, publishableKey };
}

export function appOrigin() {
  return origin(process.env.APP_ORIGIN ?? "http://localhost:3000");
}

export function apiOrigin() {
  return origin(process.env.AUTICONNECT_API_URL ?? "http://127.0.0.1:8000");
}
