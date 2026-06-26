"use client";

import { Icon, type IconName } from "@/components/ui";
import { useLocale } from "@/lib/i18n";

const ITEMS: { icon: IconName; key: string }[] = [
  { icon: "pin", key: "land.stat.1" },
  { icon: "walk", key: "land.stat.2" },
  { icon: "shield", key: "land.stat.3" },
];

export default function StatsBar() {
  const { t } = useLocale();
  return (
    <section className="mx-auto max-w-[1120px] px-6 pb-14">
      <div
        className="grid grid-cols-1 gap-6 rounded-[20px] border p-6 md:grid-cols-3"
        style={{
          background: "var(--bg-subtle)",
          borderColor: "var(--border)",
        }}
      >
        {ITEMS.map((it) => (
          <div key={it.key} className="flex items-start gap-3.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "var(--brand-tint)",
                color: "var(--brand-strong)",
              }}
            >
              <Icon name={it.icon} size={22} />
            </div>
            <div>
              <div
                className="text-[15px] font-bold"
                style={{ color: "var(--ink)" }}
              >
                {t(`${it.key}.title`)}
              </div>
              <div
                className="mt-0.5 text-[13px] leading-relaxed"
                style={{ color: "var(--ink-soft)" }}
              >
                {t(`${it.key}.desc`)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
