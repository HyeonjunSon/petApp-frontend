"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";

/* ---- tiny inline icon set (stroke, 24 viewBox) ---- */
const PATHS: Record<string, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  heart:
    "M12 21s-7.5-4.6-10-9.2C.6 9 1.6 5.5 4.8 4.6 7 4 9 5 12 8c3-3 5-4 7.2-3.4C22.4 5.5 23.4 9 22 11.8 19.5 16.4 12 21 12 21z",
  walk: "M13 4a1.6 1.6 0 100-3.2A1.6 1.6 0 0013 4zM11 21l1.5-5L10 13l1-5 3 1 2 3M9 9l2-1M12 16l-2 5",
  chat: "M21 11.5a8.4 8.4 0 01-12 7.6L3 21l1.9-5.6A8.4 8.4 0 1121 11.5z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-6 8-6s8 2 8 6",
  paw: "M11 14c-2 0-3.5 1.3-4 3-.3 1.2.6 2 1.8 2 1 0 1.5-.5 2.2-.5s1.2.5 2.2.5c1.2 0 2.1-.8 1.8-2-.5-1.7-2-3-4-3zM6.5 9.5a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zm11 0a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zM9.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  logout:
    "M15 12H4m0 0l4-4m-4 4l4 4M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4",
};

function Icon({
  name,
  size = 22,
  fill = false,
}: {
  name: keyof typeof PATHS;
  size?: number;
  fill?: boolean;
}) {
  const solid = fill && (name === "heart" || name === "paw");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solid ? "currentColor" : "none"}
      stroke={solid ? "none" : "currentColor"}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

const NAV: { href: string; label: string; icon: keyof typeof PATHS }[] = [
  { href: "/dashboard", label: "Home", icon: "grid" },
  { href: "/match", label: "Discover", icon: "heart" },
  { href: "/walks", label: "Walks", icon: "walk" },
  { href: "/chat", label: "Chat", icon: "chat" },
  { href: "/profile", label: "Profile", icon: "user" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      if (typeof window !== "undefined") localStorage.removeItem("token");
      setUser(null);
      router.replace("/login");
    }
  };

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <aside className="sticky top-0 flex h-dvh w-[72px] shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 md:w-[248px] md:px-4">
      {/* logo */}
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-2 px-1 md:px-2"
      >
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-emerald-600 text-white">
          <Icon name="paw" fill size={20} />
        </span>
        <span className="hidden text-[22px] font-extrabold tracking-tight md:block">
          PetDate
        </span>
      </Link>

      {/* nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-11 items-center justify-center gap-3 rounded-xl px-0 text-[15px] font-medium transition md:justify-start md:px-3 ${
                active
                  ? "bg-emerald-50 font-bold text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
              title={item.label}
            >
              <Icon
                name={item.icon}
                fill={active && item.icon === "heart"}
                size={21}
              />
              <span className="hidden md:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* user card */}
      <Link
        href="/profile"
        className="mt-2 flex items-center gap-2.5 rounded-xl bg-slate-50 p-2 md:p-2.5"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
          {initial}
        </span>
        <span className="hidden min-w-0 md:block">
          <span className="block truncate text-sm font-bold">
            {user?.name || "User"}
          </span>
          <span className="block truncate text-xs text-slate-400">
            {user?.email || ""}
          </span>
        </span>
      </Link>

      {/* logout */}
      <button
        onClick={onLogout}
        disabled={loggingOut}
        className="mt-1.5 flex h-10 items-center justify-center gap-2.5 rounded-xl px-0 text-[13px] font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-60 md:justify-start md:px-3"
        title="Log out"
      >
        <Icon name="logout" size={18} />
        <span className="hidden md:block">
          {loggingOut ? "Logging out…" : "Log out"}
        </span>
      </button>
    </aside>
  );
}
