import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AutiConnect", template: "%s | AutiConnect" },
  description: "AutiConnect account workspace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only z-10 rounded-lg bg-card p-3 focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
