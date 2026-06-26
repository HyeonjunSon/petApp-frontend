"use client";

import { Icon } from "@/components/ui";
import { useLocale } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t"
      style={{
        background: "var(--bg-subtle)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-6 py-8 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Icon name="paw" size={20} fill color="var(--brand)" />
          <span className="font-bold" style={{ color: "var(--ink)" }}>
            PetDate
          </span>
        </div>
        <div className="flex-1" />
        <nav className="flex flex-wrap gap-[18px] text-[13px]">
          <a
            href="/terms"
            className="no-underline"
            style={{ color: "var(--ink-soft)" }}
          >
            {t("land.footer.terms")}
          </a>
          <a
            href="/privacy"
            className="no-underline"
            style={{ color: "var(--ink-soft)" }}
          >
            {t("land.footer.privacy")}
          </a>
          <a
            href="/content-policy"
            className="no-underline"
            style={{ color: "var(--ink-soft)" }}
          >
            {t("land.footer.content")}
          </a>
        </nav>
        <div className="text-[13px]" style={{ color: "var(--ink-faint)" }}>
          © {year} PetDate
        </div>
      </div>
    </footer>
  );
}
