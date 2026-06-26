"use client";

import { Icon, type IconName } from "@/components/ui";
import { useLocale } from "@/lib/i18n";
import SectionHead from "./SectionHead";

const CARDS: { icon: IconName; key: string }[] = [
  { icon: "paw", key: "land.feat.1" },
  { icon: "walk", key: "land.feat.2" },
  { icon: "clock", key: "land.feat.3" },
];

export default function Features() {
  const { t } = useLocale();
  return (
    <section id="features" className="mx-auto max-w-[1120px] px-6 py-14">
      <SectionHead
        kicker={t("land.feat.kicker")}
        title={t("land.feat.title")}
        subtitle={t("land.feat.sub")}
      />
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <div
            key={c.key}
            className="rounded-2xl border p-6"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              boxShadow: "var(--sh-card)",
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[14px]"
              style={{
                background: "var(--brand-tint)",
                color: "var(--brand-strong)",
              }}
            >
              <Icon name={c.icon} size={24} fill={c.icon === "paw"} />
            </div>
            <div
              className="mt-4 text-[17px] font-bold"
              style={{ color: "var(--ink)" }}
            >
              {t(`${c.key}.title`)}
            </div>
            <div
              className="mt-1.5 text-sm leading-relaxed"
              style={{ color: "var(--ink-soft)" }}
            >
              {t(`${c.key}.desc`)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
