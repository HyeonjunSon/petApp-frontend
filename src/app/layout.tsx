import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "PetDate — Your pet's walking mate",
  description:
    "Meet nearby pet owners and pets — walk together, become friends, and maybe more.",
};

/**
 * RootLayout — global wrapper.
 * Navigation lives in the left sidebar (src/components/AppSidebar.tsx),
 * mounted by the protected layout. Public pages render with no chrome.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
