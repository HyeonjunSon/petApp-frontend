"use client";

/**
 * SideNav — 시안의 좌측 사이드바.
 * 워드마크(🐾 PetDate) + 아이콘 네비 5개(활성 = primary-10 배경) +
 * 하단 내 계정(아바타·이름·로그아웃).
 * 데스크톱 232px, 900px 미만에서는 64px 아이콘 전용으로 축소.
 */

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { Icon, Avatar, Spinner } from "@/components/ui";
import { NAV, isCurrent } from "./nav";

export default function SideNav() {
  const router = useRouter();
  const path = usePathname() || "/";
  const { user, setUser, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const onLogout = async () => {
    setBusy(true);
    try {
      await api.post("/auth/logout");
    } catch {}
    logout();
    setUser(null);
    router.replace("/login");
  };

  const face =
    (user as any)?.faceUrl ||
    (user?.photos || []).find((p) => p.type === "owner_face")?.url;
  const name = user?.name || "사용자";
  const initial = (name[0] || "P").toString();

  return (
    <aside
      className="flex w-16 shrink-0 flex-col md:w-[232px]"
      style={{
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "20px 12px",
      }}
    >
      {/* 워드마크 */}
      <button
        type="button"
        onClick={() => router.push("/home")}
        className="flex items-center gap-2"
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontFamily: "inherit",
          padding: "4px 12px 18px",
          fontSize: "var(--fs-h1)",
          fontWeight: 800,
          color: "var(--primary)",
          letterSpacing: "var(--ls-snug)",
        }}
      >
        <Icon name="paw" size={24} fill />
        <span className="hidden md:inline">PetDate</span>
      </button>

      {/* 네비 */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((n) => {
          const active = isCurrent(path, n.href);
          return (
            <button
              key={n.href}
              type="button"
              onClick={() => router.push(n.href)}
              className="flex items-center justify-center gap-3 md:justify-start"
              style={{
                padding: "11px 12px",
                borderRadius: "var(--radius-md)",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "var(--fs-body)",
                fontWeight: active ? 700 : 600,
                textAlign: "left",
                background: active ? "var(--primary-10)" : "transparent",
                color: active ? "var(--primary)" : "var(--text-secondary)",
              }}
            >
              <Icon name={n.icon} size={20} fill={active && n.icon === "heart"} />
              <span className="hidden md:inline">{n.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 내 계정 */}
      <div
        className="mt-auto flex items-center justify-center gap-2.5 md:justify-start"
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 14,
          paddingLeft: 4,
        }}
      >
        <Avatar src={face} fallbackText={initial} size={38} />
        <span className="hidden min-w-0 flex-1 md:block">
          <b
            className="pd-line1"
            style={{ display: "block", fontSize: "var(--fs-body-sm)", fontWeight: 700 }}
          >
            {name}
          </b>
          <span
            className="pd-line1"
            style={{
              display: "block",
              fontSize: "var(--fs-caption)",
              color: "var(--text-secondary)",
            }}
          >
            {user?.locationName || user?.email || ""}
          </span>
        </span>
        <button
          type="button"
          onClick={onLogout}
          disabled={busy}
          title="로그아웃"
          aria-label="로그아웃"
          className="hidden md:grid"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-secondary)",
            placeItems: "center",
            padding: 4,
          }}
        >
          {busy ? <Spinner /> : <Icon name="logout" size={18} />}
        </button>
      </div>
    </aside>
  );
}
