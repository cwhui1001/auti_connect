import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-10">
      <header><Brand /></header>
      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center py-16">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Welcome to AutiConnect</h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Sign in to open your dashboard and manage your profile.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className={buttonVariants()}>
              Sign in <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/register" className={buttonVariants({ variant: "outline" })}>Create an account</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
