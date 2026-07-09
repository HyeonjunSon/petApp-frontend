"use client";

/**
 * TopBar — full-width app header (wireframe shell).
 * Left: PetDate wordmark. Right: search box + account avatar with menu.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { Icon, Avatar, Spinner } from "@/components/ui";

export default function TopBar({
  onMenu,
}: {
  onMenu?: () => void;
}) {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

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
  const initial = ((user?.name || "Profile")[0] || "P").toString();

  return (
    <header
      style={{
        height: 64,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 24px",
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {onMenu && (
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open menu"
          className="md:hidden"
          style={iconBtn}
        >
          <Icon name="filter" size={20} />
        </button>
      )}

      <button
        type="button"
        onClick={() => router.push("/discover")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          padding: 0,
        }}
      >
        <Icon name="paw" size={24} fill color="var(--brand)" />
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
          }}
        >
          PetDate
        </span>
      </button>

      <div style={{ flex: 1 }} />

      <div
        className="hidden sm:flex"
        style={{
          alignItems: "center",
          gap: 8,
          width: "min(420px, 38vw)",
          height: 44,
          padding: "0 14px",
          borderRadius: "var(--r-input)",
          border: "1px solid var(--border)",
          background: "var(--bg)",
          color: "var(--ink-soft)",
        }}
      >
        <Icon name="filter" size={18} style={{ opacity: 0 }} />
        <SearchGlyph />
        <input
          placeholder="Search"
          aria-label="Search"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 14,
            color: "var(--ink)",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div ref={ref} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-label="Account menu"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
            borderRadius: "50%",
          }}
        >
          <Avatar src={face} fallbackText={initial} size={40} />
        </button>
        {menu && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 48,
              minWidth: 176,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              boxShadow: "var(--sh-pop)",
              padding: 6,
              zIndex: 70,
              animation: "pd-fade .15s ease",
            }}
          >
            <MenuRow
              onClick={() => {
                setMenu(false);
                router.push("/settings");
              }}
              icon="cog"
              label="Settings"
            />
            <MenuRow
              onClick={() => {
                setMenu(false);
                router.push("/subscription");
              }}
              icon="info"
              label="Manage subscription"
            />
            <div
              style={{
                height: 1,
                background: "var(--border)",
                margin: "6px 4px",
              }}
            />
            <button
              type="button"
              onClick={onLogout}
              disabled={busy}
              style={{
                ...menuRowStyle,
                color: "var(--danger)",
              }}
            >
              {busy ? <Spinner /> : <Icon name="logout" size={18} />}
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuRow({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
}) {
  return (
    <button type="button" onClick={onClick} style={menuRowStyle}>
      <Icon name={icon} size={18} />
      {label}
    </button>
  );
}

const menuRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "9px 10px",
  borderRadius: 8,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 600,
  color: "var(--ink)",
  textAlign: "left",
};

const iconBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  border: "none",
  background: "transparent",
  color: "var(--ink-soft)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function SearchGlyph() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={1.9} />
      <path
        d="M20 20l-3.2-3.2"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </svg>
  );
}
