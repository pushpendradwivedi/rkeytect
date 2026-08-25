import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "rkeytect — Understand AWS architectures",
  description: "Turn AWS architecture blogs into evidence-backed architecture.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
