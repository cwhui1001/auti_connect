import { Activity, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { signOut } from "@/app/(auth)/actions";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { verifiedAccessToken } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard#profile", label: "Profile", icon: UserRound },
  { href: "/dashboard#connection", label: "Connection", icon: Activity },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!await verifiedAccessToken()) redirect("/login");

  return (
    <div className="min-h-screen md:grid md:grid-cols-[14.5rem_minmax(0,1fr)]">
      <header className="border-b border-border bg-card px-5 py-5 md:min-h-screen md:border-r md:border-b-0 md:px-6 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 md:block">
          <Brand />
          <form action={signOut} className="md:mt-8">
            <Button variant="outline" type="submit" className="md:w-full">
              <LogOut size={16} aria-hidden="true" /> Sign out
            </Button>
          </form>
        </div>
        <nav aria-label="Dashboard" className="mt-5 flex flex-wrap gap-1 md:mt-8 md:flex-col">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={href === "/dashboard" ? "page" : undefined}
              className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:text-primary"
            >
              <Icon size={17} aria-hidden="true" /> {label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main-content" tabIndex={-1} className="min-w-0 px-5 py-8 sm:px-9 sm:py-10 lg:px-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
