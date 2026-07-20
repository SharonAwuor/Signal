import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal — check it before you trust it",
  description: "Community-verified scam checks for phone numbers, businesses, names, and social accounts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
