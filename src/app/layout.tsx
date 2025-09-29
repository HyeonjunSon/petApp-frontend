
import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import { NavLink } from "./nav-link"; // 아래 2) 참고

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {/* 상단 내비 */}
        <nav className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-4 px-4">
            <Link
              href="/dashboard"
              className="text-lg font-bold tracking-tight text-slate-900"
            >
            🐾&nbsp;&nbsp;&nbsp;PetDate
            </Link>

            <div className="ml-auto flex items-center gap-3 text-sm">
              <NavLink href="/dashboard">대시보드</NavLink>
              <NavLink href="/profile">프로필</NavLink>
              <NavLink href="/pets">내 펫</NavLink>
              <NavLink href="/match">매칭</NavLink>
              <NavLink href="/chat">채팅</NavLink>
              <NavLink href="/safety">신고/차단</NavLink>
              <NavLink href="/settings">설정</NavLink>
            </div>
          </div>
        </nav>

        {/* 본문 래퍼 */}
        <main className="mx-auto w-full max-w-[1120px] px-4 py-5">
          {children}
        </main>
      </body>
    </html>
  );
}
