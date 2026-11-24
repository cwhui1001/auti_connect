import type { ReactNode } from "react";

import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-6 sm:px-10">
      <header><Brand /></header>
      <main id="main-content" tabIndex={-1} className="grid flex-1 place-items-center py-10">
        {children}
      </main>
    </div>
  );
}
