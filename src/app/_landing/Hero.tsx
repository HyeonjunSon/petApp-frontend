"use client";

import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import { useLocale } from "@/lib/i18n";

export default function Hero() {
  const { t } = useLocale();
  return (
    <section className="mx-auto max-w-[1120px] px-6 pt-18 pb-14">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
            style={{
              background: "var(--brand-tint)",
              color: "var(--brand-strong)",
            }}
          >
            <Icon name="paw" size={14} fill /> {t("land.hero.kicker")}
          </span>
          <h1
            className="mt-5 text-[44px] leading-tight font-extrabold md:text-[56px]"
            style={{ color: "var(--ink)", letterSpacing: "-0.03em" }}
          >
            {t("land.hero.title.1")}
            <br />
            {t("land.hero.title.2")}
          </h1>
          <p
            className="mt-5 max-w-[520px] text-[17px] leading-relaxed"
            style={{ color: "var(--ink-soft)" }}
          >
            {t("land.hero.sub")}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/login">
              <Button size="lg" icon="paw">
                {t("land.hero.cta")}
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="secondary" icon="fwd">
                {t("land.hero.see")}
              </Button>
            </a>
          </div>
          <div className="mt-6 text-[13px]" style={{ color: "var(--ink-faint)" }}>
            {t("land.hero.note")}
          </div>
        </div>

        <Mockup />
      </div>
    </section>
  );
}

function Mockup() {
  return (
    <div className="relative flex h-[460px] items-center justify-center">
      <Card rotate={-6} offsetX={-40} z={1} name="Coco" sub="Pomeranian · 3y" tags={["Treats", "Slow"]} dim />
      <Card rotate={5} offsetX={28} z={2} name="Bori" sub="Maltese · 2y" tags={["Park", "Calm", "Sit"]} />
    </div>
  );
}

function Card({
  rotate,
  offsetX,
  z,
  name,
  sub,
  tags,
  dim,
}: {
  rotate: number;
  offsetX: number;
  z: number;
  name: string;
  sub: string;
  tags: string[];
  dim?: boolean;
}) {
  return (
    <div
      className="absolute h-[380px] w-[280px] overflow-hidden rounded-[20px] border"
      style={{
        background: "var(--bg)",
        borderColor: "var(--border)",
        boxShadow: "var(--sh-swipe)",
        transform: `translateX(${offsetX}px) rotate(${rotate}deg)`,
        zIndex: z,
        opacity: dim ? 0.6 : 1,
      }}
    >
      <div
        className="flex h-[240px] items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-tint), var(--brand-soft))",
          color: "var(--brand-strong)",
        }}
      >
        <Icon name="paw" size={80} fill />
      </div>
      <div className="p-4">
        <div className="flex items-baseline gap-2">
          <span
            className="text-xl font-extrabold"
            style={{ color: "var(--ink)" }}
          >
            {name}
          </span>
          <span className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
            {sub}
          </span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {tags.map((tagText) => (
            <span
              key={tagText}
              className="rounded-full px-2 py-1 text-[11px] font-semibold"
              style={{
                background: "var(--brand-soft)",
                color: "var(--brand-strong)",
              }}
            >
              {tagText}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
