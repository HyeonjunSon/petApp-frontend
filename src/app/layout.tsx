import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import { NavLink } from "./nav-link"; // 아래 2) 참고

/**
*RootLayout - global layout wrapper, Includes top navigation bar and page container.
*/
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-4 px-4">
            <Link
              href="/dashboard"
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              🐾&nbsp;&nbsp;&nbsp;PetDate
            </Link>

            <div className="ml-auto flex items-center gap-3 text-sm">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/profile">Profile</NavLink>
              <NavLink href="/pets">My Pets</NavLink>
              <NavLink href="/match">Matching</NavLink>
              <NavLink href="/chat">Chat</NavLink>
              <NavLink href="/safety">Report / Block</NavLink>
              <NavLink href="/settings">Settings</NavLink>
            </div>
          </div>
        </nav>

        {/* Main Content Wrapper */}
        <main className="mx-auto w-full max-w-[1120px] px-4 py-5">
          {children}
        </main>
      </body>
    </html>
  );
}
