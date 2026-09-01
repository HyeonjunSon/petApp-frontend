import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Offleash — your neighbourhood, off the leash",
  description:
    "A neighbourhood community for dog owners — feed, walk plans, and friends nearby.",
};

/**
 * RootLayout — global wrapper.
 * The app shell (SiteHeader + Sidebar) is mounted by the protected layout;
 * public pages (landing, auth, legal) render with no chrome.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Figtree:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
