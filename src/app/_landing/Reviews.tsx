"use client";

import { useLocale } from "@/lib/i18n";
import SectionHead from "./SectionHead";

const KEYS = [
  { quote: "land.reviews.1", by: "land.reviews.1.by" },
  { quote: "land.reviews.2", by: "land.reviews.2.by" },
  { quote: "land.reviews.3", by: "land.reviews.3.by" },
];

export default function Reviews() {
  const { t } = useLocale();
  return (
    <section id="reviews" className="mx-auto max-w-[1120px] px-6 py-18">
      <SectionHead
        kicker={t("land.reviews.kicker")}
        title={t("land.reviews.title")}
      />
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {KEYS.map((r) => (
          <div
            key={r.quote}
            className="rounded-2xl border p-5.5"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              boxShadow: "var(--sh-card)",
              padding: 22,
            }}
          >
            <div
              className="mb-1.5 text-2xl leading-none"
              style={{ color: "var(--brand)" }}
              aria-hidden
            >
              "
            </div>
            <p
              className="text-[14.5px] leading-relaxed"
              style={{ color: "var(--ink)" }}
            >
              {t(r.quote)}
            </p>
            <div
              className="mt-3.5 text-[13px] font-semibold"
              style={{ color: "var(--ink-soft)" }}
            >
              {t(r.by)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
