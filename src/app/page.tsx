"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Icon, type IconName } from "@/components/ui";

/* ============================================================
   Landing (/) — full marketing site (web.html design).
   Sticky nav → hero → stats → features → how it works →
   reviews → CTA band → footer. Mobile collapses to 1 column.
   ============================================================ */

const img = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

const HERO = { name: "Mongi", meta: "Golden Retriever · 3 yrs", front: img("1552053831-71594a27632d"), back: img("1612536057832-2ff7ead58194") };

const STATS: [string, string][] = [
  ["Neighborhood", "Matches start near you"],
  ["Plans → records", "Walks become data"],
  ["Verified · Block", "A safe place to meet"],
];

const FEATURES: { icon: IconName; title: string; desc: string; img: string }[] = [
  {
    icon: "heart",
    title: "Swipe to meet your match",
    desc: "Find friends that fit your neighborhood, size, temperament, and goals. Like them, and a match turns into a chat.",
    img: img("1591768575198-88dac53fbd0a"),
  },
  {
    icon: "walk",
    title: "Plan walks together",
    desc: "Set a date, time, and place right inside chat. When the walk ends, distance and time become records.",
    img: img("1612536057832-2ff7ead58194"),
  },
  {
    icon: "shield",
    title: "A safe place to meet",
    desc: "Face-verification badges, reporting, blocking, and visibility controls — built for meetups you can trust.",
    img: img("1583512603805-3cc6b41f3edb"),
  },
];

const STEPS: [string, string, string][] = [
  ["01", "Create your profile", "Set your photo, neighborhood, and goal, then add your pet."],
  ["02", "Find a walking buddy", "Swipe nearby pets and meet a mate you click with."],
  ["03", "Meet and walk", "Make a plan, walk together, and log the memories."],
];

const REVIEWS: { quote: string; who: string; loc: string; face: string }[] = [
  {
    quote: "My shy dog lights up since finding a walking buddy — and I made a neighborhood friend too.",
    who: "Jisoo & Mongi", loc: "Yeonnam-dong", face: img("1494790108377-be9c29b29330", 200),
  },
  {
    quote: "Planning right inside the chat is so easy. Watching my walk records add up is oddly satisfying.",
    who: "Yeeun & Mungchi", loc: "Yeonhui-dong", face: img("1438761681033-6461ffad8d80", 200),
  },
  {
    quote: "Verification and blocking made first meetups feel safe. We're getting to know each other slowly.",
    who: "Seoyeon & Coco", loc: "Hapjeong-dong", face: img("1517841905240-472988babdf9", 200),
  },
];

function BrandMark({ size = 22 }: { size?: number }) {
  const box = Math.round(size * 1.3);
  return (
    <span className="inline-flex items-center" style={{ gap: 8 }}>
      <span className="grid place-items-center" style={{ width: box, height: box, borderRadius: 9, background: "var(--brand)" }}>
        <Icon name="paw" fill size={Math.round(size * 0.85)} color="#fff" />
      </span>
      <span style={{ fontSize: size, fontWeight: 800, letterSpacing: "-.5px", color: "var(--ink)" }}>PetDate</span>
    </span>
  );
}

function Photo({ src, alt = "", className, style }: { src: string; alt?: string; className?: string; style?: React.CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
      onError={(e) => {
        const i = e.currentTarget;
        if (i.dataset.fb === "1") return;
        i.dataset.fb = "1";
        i.src = "/img/pet-placeholder.svg";
      }}
    />
  );
}

export default function Landing() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      setRedirecting(true);
      router.replace("/dashboard");
    }
  }, [router]);

  if (redirecting) return null;

  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {/* nav */}
      <header className="sticky top-0 z-20 border-b" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
        <div className="mx-auto flex h-[68px] max-w-[1120px] items-center justify-between px-5 md:px-10">
          <BrandMark size={23} />
          <nav className="flex items-center gap-1">
            <a href="#features" className="hidden px-3 py-2 text-sm font-semibold sm:inline-block" style={{ color: "var(--ink-soft)" }}>Features</a>
            <a href="#how" className="hidden px-3 py-2 text-sm font-semibold sm:inline-block" style={{ color: "var(--ink-soft)" }}>How it works</a>
            <a href="#reviews" className="hidden px-3 py-2 text-sm font-semibold sm:inline-block" style={{ color: "var(--ink-soft)" }}>Reviews</a>
            <Link href="/login" className="px-3 py-2 text-sm font-bold" style={{ color: "var(--ink)" }}>Log in</Link>
            <Link href="/login"><Button>Get started</Button></Link>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section style={{ background: "var(--brand-tint)" }}>
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-14 md:grid-cols-[1.05fr_.95fr] md:gap-14 md:px-10 md:py-20">
          <div>
            <span className="mb-5 inline-flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[13px] font-bold" style={{ background: "var(--bg)", color: "var(--brand-strong)", boxShadow: "var(--sh-card)" }}>
              🐾 Your pet&apos;s walking mate
            </span>
            <h1 className="text-[40px] leading-[1.12] tracking-[-1px] md:text-[56px]" style={{ fontWeight: 800, margin: 0 }}>
              Find your dog&apos;s<br />next favorite<br /><span style={{ color: "var(--brand)" }}>walking buddy</span>
            </h1>
            <p className="mt-5 text-[17px] leading-[1.6] md:text-[19px]" style={{ color: "var(--ink-soft)" }}>
              Meet pets and owners nearby — walk together, become friends, and maybe more.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/login"><Button size="lg">Get started free</Button></Link>
              <a href="#how"><Button size="lg" variant="secondary">See how it works</Button></a>
            </div>
          </div>

          <div className="relative hidden min-h-[420px] justify-center md:flex">
            <div className="absolute right-5 top-7 w-[280px] overflow-hidden opacity-90" style={{ transform: "rotate(4deg)", boxShadow: "var(--sh-swipe)", borderRadius: "var(--r-card)" }}>
              <div style={{ aspectRatio: "4 / 5", background: "var(--surface-2)" }}><Photo src={HERO.back} /></div>
            </div>
            <div className="relative z-[2] w-[300px] overflow-hidden" style={{ transform: "rotate(-4deg)", boxShadow: "var(--sh-swipe)", borderRadius: "var(--r-card)" }}>
              <div style={{ aspectRatio: "4 / 5", background: "var(--surface-2)" }}><Photo src={HERO.front} /></div>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,.78) 0%, transparent 46%)" }} />
              <div style={{ position: "absolute", left: 18, right: 18, bottom: 16, color: "#fff" }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{HERO.name}</div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>{HERO.meta}</div>
              </div>
              <div className="grid place-items-center" style={{ position: "absolute", right: 14, bottom: 70, width: 52, height: 52, borderRadius: "50%", background: "var(--brand)", color: "#fff", boxShadow: "var(--sh-fab)" }}>
                <Icon name="heart" fill size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="mx-auto max-w-[1120px] px-5 py-10 md:px-10">
        <div className="grid gap-5 text-center sm:grid-cols-3">
          {STATS.map(([a, b]) => (
            <div key={a} className="p-5">
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--brand-strong)" }}>{a}</div>
              <div className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>{b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-[1120px] scroll-mt-20 px-5 py-12 md:px-10">
        <div className="mb-10 text-center">
          <h2 className="text-[28px] tracking-[-.6px] md:text-[36px]" style={{ fontWeight: 800, margin: 0 }}>Meetups where pets come first</h2>
          <p className="mt-3 text-[15px] md:text-[17px]" style={{ color: "var(--ink-soft)" }}>From discovery to walks to safety — all in one place.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="overflow-hidden" style={{ background: "var(--bg)", borderRadius: "var(--r-card)", boxShadow: "var(--sh-card)", border: "1px solid var(--border)" }}>
              <div style={{ aspectRatio: "16 / 10", background: "var(--surface-2)" }}><Photo src={f.img} /></div>
              <div className="p-[22px]">
                <div className="mb-3 grid place-items-center" style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand-soft)", color: "var(--brand-strong)" }}>
                  <Icon name={f.icon} size={22} />
                </div>
                <div style={{ fontSize: 19, fontWeight: 700 }}>{f.title}</div>
                <div className="mt-2 text-sm leading-[1.6]" style={{ color: "var(--ink-soft)" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section style={{ background: "var(--bg-subtle)" }}>
        <div id="how" className="mx-auto max-w-[1120px] scroll-mt-20 px-5 py-14 md:px-10">
          <div className="mb-10 text-center">
            <h2 className="text-[28px] tracking-[-.6px] md:text-[36px]" style={{ fontWeight: 800, margin: 0 }}>How it works</h2>
            <p className="mt-3 text-[15px] md:text-[17px]" style={{ color: "var(--ink-soft)" }}>Three steps to your first walk.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map(([n, t, d]) => (
              <div key={n} className="p-7" style={{ background: "var(--bg)", borderRadius: "var(--r-card)", boxShadow: "var(--sh-card)" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--brand)" }}>{n}</div>
                <div className="mt-2.5" style={{ fontSize: 19, fontWeight: 700 }}>{t}</div>
                <div className="mt-2 text-sm leading-[1.6]" style={{ color: "var(--ink-soft)" }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* reviews */}
      <section id="reviews" className="mx-auto max-w-[1120px] scroll-mt-20 px-5 py-14 md:px-10">
        <div className="mb-10 text-center">
          <h2 className="text-[28px] tracking-[-.6px] md:text-[36px]" style={{ fontWeight: 800, margin: 0 }}>Neighbors who joined first</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.who} className="p-6" style={{ background: "var(--bg)", borderRadius: "var(--r-card)", boxShadow: "var(--sh-card)", border: "1px solid var(--border)" }}>
              <div style={{ color: "var(--brand)", fontSize: 22 }}>★★★★★</div>
              <p className="my-3 mb-[18px] text-[15px] leading-[1.65]" style={{ color: "var(--ink)" }}>“{r.quote}”</p>
              <div className="flex items-center gap-2.5">
                <span className="overflow-hidden rounded-full" style={{ width: 40, height: 40, background: "var(--surface-2)", display: "block" }}><Photo src={r.face} /></span>
                <div>
                  <div className="text-sm" style={{ fontWeight: 700 }}>{r.who}</div>
                  <div className="text-xs" style={{ color: "var(--ink-faint)" }}>{r.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-[1120px] px-5 pb-16 md:px-10">
        <div className="px-6 py-12 text-center text-white md:px-10 md:py-14" style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%)", borderRadius: 24 }}>
          <h2 className="text-[28px] tracking-[-.6px] md:text-[38px]" style={{ fontWeight: 800, margin: 0 }}>Meet a walking buddy today</h2>
          <p className="mx-auto mt-3.5 mb-7 max-w-[520px] text-[16px] md:text-[17px]" style={{ opacity: 0.92 }}>
            Signing up is free. Let&apos;s find your pet&apos;s first walking mate.
          </p>
          <Link href="/login"><Button size="lg" style={{ background: "#fff", color: "var(--brand-strong)" }}>Get started free</Button></Link>
        </div>
      </section>

      {/* footer */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
        <div className="mx-auto flex max-w-[1120px] flex-wrap justify-between gap-6 px-5 py-9 md:px-10">
          <div className="max-w-[280px]">
            <BrandMark size={20} />
            <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: "var(--ink-faint)" }}>
              A matching service where pet owners walk together and become friends.
            </p>
          </div>
          <div className="flex gap-12 md:gap-14">
            {([
              ["Service", ["Discover", "Walks", "Chat"]],
              ["Company", ["About", "Blog", "Careers"]],
              ["Support", ["Help center", "Partnerships", "Report"]],
            ] as [string, string[]][]).map(([h, items]) => (
              <div key={h}>
                <div className="mb-3 text-[13px]" style={{ fontWeight: 700 }}>{h}</div>
                {items.map((it) => (
                  <div key={it} className="mb-2 text-[13px]" style={{ color: "var(--ink-soft)" }}>{it}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 text-center text-xs md:px-10" style={{ borderTop: "1px solid var(--border)", color: "var(--ink-faint)" }}>
          © 2026 PetDate · Your pet&apos;s walking mate
        </div>
      </footer>
    </div>
  );
}
