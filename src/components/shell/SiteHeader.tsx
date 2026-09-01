"use client";

/** Offleash v2 — 상단 헤더: 로고 + (우측) 테마 토글·알림·아바타. */

import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/lib/theme";
import { Avatar } from "@/components/ui";

export default function SiteHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const face =
    (user as any)?.faceUrl ||
    (user?.photos || []).find((p) => p.type === "owner_face")?.url;
  const initial = ((user?.name || "O")[0] || "O").toString();
  const dark = theme === "dark";

  return (
    <header className="site-header">
      <button type="button" className="logo" onClick={() => router.push("/home")} aria-label="Offleash home">
        <span className="logo-dot" />
        Offleash
      </button>
      <div className="grow">
        <button
          type="button"
          className="pill"
          onClick={() => setTheme(dark ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
        <button
          type="button"
          className="pill"
          onClick={() => router.push("/chat")}
          aria-label="Open chat"
        >
          💬 Chat
        </button>
        <button
          type="button"
          onClick={() => router.push("/me")}
          aria-label="My profile"
          style={{ background: "none", border: 0, cursor: "pointer", padding: 0, borderRadius: "50%" }}
        >
          <Avatar src={face} fallbackText={initial} size={36} />
        </button>
      </div>
    </header>
  );
}
