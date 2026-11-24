import { checkApi } from "@/lib/api";

export async function GET() {
  const ok = await checkApi();
  return Response.json(
    { status: ok ? "ok" : "unavailable" },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
