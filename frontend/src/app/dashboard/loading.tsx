import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <Card role="status" aria-live="polite">
      <h1 className="text-2xl font-semibold">Loading dashboard…</h1>
      <p className="mt-2 text-sm text-muted-foreground">Getting your profile and connection status.</p>
    </Card>
  );
}
