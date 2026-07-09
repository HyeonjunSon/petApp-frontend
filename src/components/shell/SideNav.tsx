"use client";

/**
 * SideNav — left menu rail (wireframe shell).
 * "Menu" label + 5 text links. Active = bold + brand color.
 * Desktop: fixed 232px column. Mobile: slide-in drawer.
 */

import { useRouter, usePathname } from "next/navigation";
import { NAV, isCurrent } from "./nav";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const path = usePathname() || "/";

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-faint)",
          fontWeight: 600,
          padding: "0 4px 10px",
        }}
      >
        Menu
      </div>
      {NAV.map((n) => {
        const active = isCurrent(path, n.href);
        return (
          <button
            key={n.href}
            type="button"
            onClick={() => {
              router.push(n.href);
              onNavigate?.();
            }}
            style={{
              textAlign: "left",
              padding: "8px 4px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: active ? 700 : 500,
              color: active ? "var(--brand-strong)" : "var(--ink-soft)",
              textDecoration: active ? "none" : "underline",
              textUnderlineOffset: 4,
              textDecorationColor: "var(--border-strong)",
            }}
          >
            {n.label}
          </button>
        );
      })}
    </nav>
  );
}

export default function SideNav({
  drawer,
  onClose,
}: {
  drawer: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside
        className="hidden shrink-0 md:block"
        style={{
          width: 232,
          background: "var(--bg-subtle)",
          borderRight: "1px solid var(--border)",
          padding: "24px 18px",
        }}
      >
        <NavLinks />
      </aside>

      {drawer && (
        <div
          onClick={onClose}
          className="md:hidden"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "var(--overlay)",
            animation: "pd-fade .2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 232,
              background: "var(--bg-subtle)",
              borderRight: "1px solid var(--border)",
              padding: "24px 18px",
              animation: "pd-sheet-left .25s ease",
              boxShadow: "var(--sh-pop)",
            }}
          >
            <NavLinks onNavigate={onClose} />
          </div>
        </div>
      )}
    </>
  );
}
