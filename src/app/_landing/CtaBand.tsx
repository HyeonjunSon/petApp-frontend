"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { useLocale } from "@/lib/i18n";

export default function CtaBand() {
  const { t } = useLocale();
  return (
    <section className="px-6 pb-18">
      <div
        className="mx-auto max-w-[1120px] rounded-3xl px-7 py-11 text-center text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%)",
          boxShadow: "var(--sh-fab)",
        }}
      >
        <h3
          className="m-0 text-[28px] font-extrabold"
          style={{ letterSpacing: "-0.02em" }}
        >
          {t("land.cta.title")}
        </h3>
        <p className="mt-2 text-[15px]" style={{ opacity: 0.9 }}>
          {t("land.cta.sub")}
        </p>
        <div className="mt-5.5">
          <Link href="/login">
            <Button
              size="lg"
              variant="secondary"
              icon="paw"
              style={{ color: "var(--brand-strong)" }}
            >
              {t("land.hero.cta")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
