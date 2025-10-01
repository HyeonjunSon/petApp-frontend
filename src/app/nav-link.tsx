"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * NavLink - navigation link with active state styling.
 */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`relative px-2 py-1 text-slate-600 hover:text-slate-900 ${
        active ? "font-medium text-emerald-700" : ""
      }`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-1 -bottom-[9px] block h-[2px] rounded-full bg-emerald-600" />
      )}
    </Link>
  );
}
