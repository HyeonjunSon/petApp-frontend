"use client";

/** Shared layout for static legal pages — brand bar + max-w content. */

import Link from "next/link";
import { Icon } from "@/components/ui";

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-dvh"
      style={{ background: "var(--bg-subtle)", color: "var(--ink)" }}
    >
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(255,255,255,.85)",
          backdropFilter: "saturate(180%) blur(12px)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto flex max-w-[880px] items-center gap-2 px-5 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-2 no-underline"
          >
            <Icon name="paw" size={22} fill color="var(--brand)" />
            <span
              className="text-base font-extrabold"
              style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
            >
              PetDate
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-5 pt-10 pb-20">
        <h1
          className="m-0 text-[32px] font-extrabold"
          style={{ color: "var(--ink)", letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>
        <div
          className="mt-2 text-[13px]"
          style={{ color: "var(--ink-faint)" }}
        >
          Last updated · {updated}
        </div>

        <div className="prose mt-8">{children}</div>
      </main>

      <footer
        className="border-t py-8 text-center text-xs"
        style={{
          background: "var(--bg)",
          borderColor: "var(--border)",
          color: "var(--ink-faint)",
        }}
      >
        © {new Date().getFullYear()} PetDate ·{" "}
        <Link
          href="/privacy"
          className="no-underline"
          style={{ color: "var(--ink-soft)" }}
        >
          Privacy
        </Link>{" "}
        ·{" "}
        <Link
          href="/terms"
          className="no-underline"
          style={{ color: "var(--ink-soft)" }}
        >
          Terms
        </Link>{" "}
        ·{" "}
        <Link
          href="/content-policy"
          className="no-underline"
          style={{ color: "var(--ink-soft)" }}
        >
          Content policy
        </Link>
      </footer>
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-10 mb-2 text-[20px] font-extrabold"
      style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
    >
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="my-3 text-[15px] leading-relaxed"
      style={{ color: "var(--ink)" }}
    >
      {children}
    </p>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className="my-3 ml-5 list-disc text-[15px] leading-relaxed"
      style={{ color: "var(--ink)" }}
    >
      {children}
    </ul>
  );
}
