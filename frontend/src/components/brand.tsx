import { Waypoints } from "lucide-react";
import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="inline-flex w-fit items-center gap-2.5 rounded-lg text-lg font-bold tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Waypoints size={19} aria-hidden="true" />
      </span>
      AutiConnect
    </Link>
  );
}
