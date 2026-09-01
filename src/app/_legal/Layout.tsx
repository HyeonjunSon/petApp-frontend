"use client";

/** 정적 법적 고지 페이지 공통 레이아웃 — 브랜드 바 + 본문 카드. */

import Link from "next/link";

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
      style={{ background: "var(--background)", color: "var(--text)" }}
    >
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "color-mix(in srgb, var(--surface) 85%, transparent)",
          backdropFilter: "saturate(180%) blur(12px)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto flex max-w-[880px] items-center gap-2 px-5 py-3.5">
          <Link
            href="/"
            className="flex items-center gap-2 no-underline"
          >
            <span className="logo-dot" />
            <span
              className="text-base"
              style={{
                color: "var(--text)",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Offleash
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-5 pt-10 pb-20">
        <h1
          className="m-0"
          style={{
            color: "var(--text)",
            fontSize: "var(--fs-h1)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <div
          className="mt-2"
          style={{ fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}
        >
          Last updated · {updated}
        </div>

        <div className="pd-card mt-8" style={{ padding: "12px 28px 28px" }}>
          {children}
        </div>
      </main>

      <footer
        className="border-t py-8 text-center"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
          fontSize: "var(--fs-caption)",
        }}
      >
        © {new Date().getFullYear()} Offleash ·{" "}
        <Link
          href="/privacy"
          className="no-underline"
          style={{ color: "var(--text-secondary)" }}
        >
          Privacy Policy
        </Link>{" "}
        ·{" "}
        <Link
          href="/terms"
          className="no-underline"
          style={{ color: "var(--text-secondary)" }}
        >
          Terms of Service
        </Link>{" "}
        ·{" "}
        <Link
          href="/content-policy"
          className="no-underline"
          style={{ color: "var(--text-secondary)" }}
        >
          Content Policy
        </Link>
      </footer>
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-10 mb-2"
      style={{
        color: "var(--text)",
        fontSize: "var(--fs-h3)",
        fontWeight: 800,
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="my-3 leading-relaxed"
      style={{ color: "var(--text)", fontSize: "var(--fs-body)" }}
    >
      {children}
    </p>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className="my-3 ml-5 list-disc leading-relaxed"
      style={{ color: "var(--text)", fontSize: "var(--fs-body)" }}
    >
      {children}
    </ul>
  );
}
