"use client";

/** Offleash v2 — 좌측 사이드바: 동네 후드 + 네비 5개 + New post + 내 계정.
    720px 미만에서는 하단 탭바로 변신 (globals.css .sidebar 미디어쿼리). */

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api"; // logout만
import { usePetsQuery } from "@/store/api";

const items = [
  { href: "/home", label: "Home" },
  { href: "/walks", label: "Walks" },
  { href: "/pack", label: "Pack" },
  { href: "/chat", label: "Chat" },
  { href: "/me", label: "Me" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { user, setUser, logout } = useAuth();
  const { data: pets = [] } = usePetsQuery();

  const onLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    logout();
    setUser(null);
    router.replace("/login");
  };

  const hood = user?.locationName || "My neighbourhood";
  const petLine =
    pets.length === 0
      ? user?.name || "Owner"
      : pets.length === 1
        ? pets[0].name
        : `${pets[0].name} & ${pets.length - 1} more`;

  return (
    <aside className="sidebar">
      <div className="sidebar-hood">
        <h2>{hood}</h2>
        <span>
          Nearby ·{" "}
          <a
            href="/settings/exposure"
            onClick={(e) => {
              e.preventDefault();
              router.push("/settings/exposure");
            }}
          >
            change
          </a>
        </span>
      </div>
      <nav aria-label="Main">
        {items.map((it) => {
          const on = pathname.startsWith(it.href);
          return (
            <button
              key={it.href}
              type="button"
              onClick={() => router.push(it.href)}
              className={`nav-link${on ? " on" : ""}`}
              aria-current={on ? "page" : undefined}
            >
              <span className="nav-ico" aria-hidden="true" />
              {it.label}
            </button>
          );
        })}
      </nav>
      <button type="button" className="btn btn-ball" onClick={() => router.push("/home")}>
        New post
      </button>
      <div className="sidebar-me">
        <span className="avatar avatar-md">{(petLine[0] || "O").toUpperCase()}</span>
        <span>
          {petLine}
          <small>
            {user?.name || "Owner"} ·{" "}
            <button
              type="button"
              onClick={onLogout}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                font: "inherit",
                color: "var(--fence)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </small>
        </span>
      </div>
    </aside>
  );
}
