"use client";

import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import { useLocale } from "@/lib/i18n";

export default function TopNav() {
  const { t } = useLocale();
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(255,255,255,.8)",
        backdropFilter: "saturate(180%) blur(12px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Icon name="paw" size={26} fill color="var(--brand)" />
          <span
            className="text-lg font-extrabold"
            style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
          >
            PetDate
          </span>
        </Link>

        <nav className="ml-8 hidden gap-[22px] md:flex">
          <NavLink href="#features">{t("land.nav.features")}</NavLink>
          <NavLink href="#how">{t("land.nav.how")}</NavLink>
          <NavLink href="#reviews">{t("land.nav.reviews")}</NavLink>
        </nav>

        <div className="flex-1" />

        <Link
          href="/login"
          className="text-sm font-semibold no-underline"
          style={{ color: "var(--ink-soft)" }}
        >
          {t("land.nav.login")}
        </Link>
        <Link href="/login">
          <Button size="sm">{t("land.nav.start")}</Button>
        </Link>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-sm font-medium no-underline"
      style={{ color: "var(--ink-soft)" }}
    >
      {children}
    </a>
  );
}
