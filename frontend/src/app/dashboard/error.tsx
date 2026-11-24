"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <Card>
      <h1 className="text-2xl font-semibold">Dashboard unavailable</h1>
      <p role="alert" className="mt-2 text-sm text-muted-foreground">The dashboard could not load. Try again.</p>
      <Button className="mt-5" onClick={reset}>Try again</Button>
    </Card>
  );
}
