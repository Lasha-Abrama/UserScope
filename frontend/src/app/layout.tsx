import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3001"),
  title: { default: "UserScope", template: "%s · UserScope" },
  description: "A fast, thoughtful workspace for managing user data at scale.",
  openGraph: {
    title: "UserScope",
    description: "A fast, thoughtful workspace for managing user data at scale.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "UserScope",
    description: "A fast, thoughtful workspace for managing user data at scale.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
