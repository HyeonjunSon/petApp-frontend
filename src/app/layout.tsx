import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "PetDate — 반려견 산책 메이트",
  description:
    "가까운 동네 보호자와 펫을 만나 같이 걷고, 친구가 되고, 데이트까지 이어져요.",
};

/**
 * RootLayout — global wrapper.
 * Navigation lives in the left sidebar (src/components/shell/SideNav.tsx),
 * mounted by the protected layout. Public pages render with no chrome.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body
        className="min-h-screen antialiased"
        style={{ background: "var(--background)", color: "var(--text)" }}
      >
        {children}
      </body>
    </html>
  );
}
