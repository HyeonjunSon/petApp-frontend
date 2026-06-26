"use client";

import { useLocale } from "@/lib/i18n";
import SectionHead from "./SectionHead";

const STEPS = ["land.how.1", "land.how.2", "land.how.3"];

export default function HowItWorks() {
  const { t } = useLocale();
  return (
    <section
      id="how"
      className="border-t border-b"
      style={{
        background: "var(--bg-subtle)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto max-w-[1120px] px-6 py-18">
        <SectionHead
          kicker={t("land.how.kicker")}
          title={t("land.how.title")}
        />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((key, i) => (
            <div key={key}>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-base font-extrabold text-white"
                style={{ background: "var(--brand)" }}
              >
                {i + 1}
              </div>
              <div
                className="mt-3.5 text-lg font-bold"
                style={{ color: "var(--ink)" }}
              >
                {t(`${key}.title`)}
              </div>
              <div
                className="mt-1.5 text-sm leading-relaxed"
                style={{ color: "var(--ink-soft)" }}
              >
                {t(`${key}.desc`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
