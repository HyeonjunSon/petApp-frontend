"use client";

/** 프리미엄 구독 — 플랜 비교 + FAQ. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Button, Icon, Toast, type ToastData } from "@/components/ui";

type Plan = {
  code: string;
  label: string;
  priceCents: number;
  currency?: string;
  interval: "month" | "year";
  features?: string[];
};

const FREE_FEATURES = ["5 swipes per day", "3 match messages per day", "Basic filters (distance & breed)", "Includes ads"];
const PREMIUM_FEATURES = [
  "Unlimited swipes",
  "Unlimited match messages",
  "Advanced filters (temperament, walk style, age)",
  "See who liked you",
  "No ads",
  "Premium badge",
];

const FAQ = [
  ["Can I cancel anytime?", "Yes, you can cancel anytime. Your benefits stay active until the expiration date."],
  ["Which payment methods are supported?", "We support credit/debit cards, KakaoPay, and Naver Pay."],
  ["Do benefits apply right away?", "Yes, they apply immediately once payment is complete."],
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [premium, setPremium] = useState(false);
  const [planCode, setPlanCode] = useState("premium_monthly");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => {
    api.get("/billing/me").then(({ data }) => {
      const active = data?.active || data?.subscription?.status === "active" || data?.plan === "premium";
      setPremium(!!active);
    }).catch(() => {});
    api.get<Plan[]>("/billing/plans").then(({ data }) => {
      const p = (Array.isArray(data) ? data : []).find((x) => x.interval === "month") || data?.[0];
      if (p?.code) setPlanCode(p.code);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  const subscribe = async () => {
    setBusy(true);
    try {
      const { data } = await api.post<{ url?: string }>("/billing/checkout", { planCode });
      if (data?.url) window.location.href = data.url;
      else setToast({ msg: "Payments are coming soon.", type: "error" });
    } catch (e: any) {
      setToast({
        msg: e?.response?.data?.msg || "Payments are coming soon.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Premium" subtitle="Unlock more matches and premium features." maxWidth={920}>
      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>Current plan</div>
            <div style={{ fontSize: "var(--fs-h2)", fontWeight: 800, color: "var(--text)", marginTop: 4 }}>
              {premium ? "Offleash Premium" : "Free plan"}
            </div>
            <div style={{ fontSize: "var(--fs-meta)", color: "var(--text-secondary)", marginTop: 4 }}>
              {premium ? "Enjoying all premium benefits" : "5 swipes per day · limited match messages"}
            </div>
          </div>
          {premium ? (
            <Button variant="secondary" onClick={() => router.push("/subscription/billing")}>Manage</Button>
          ) : (
            <Button onClick={subscribe} loading={busy}>Upgrade plan</Button>
          )}
        </div>
      </section>

      <h2 style={{ margin: "32px 0 14px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>Compare plans</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <PlanCard
          title="Free"
          price="₩0"
          features={FREE_FEATURES}
          cta={<Button variant="secondary" fullWidth disabled>Current plan</Button>}
        />
        <PlanCard
          title="Premium"
          price="₩9,900"
          highlight
          features={PREMIUM_FEATURES}
          cta={<Button fullWidth loading={busy} onClick={subscribe}>Start Premium</Button>}
        />
      </div>

      <h2 style={{ margin: "32px 0 14px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>Frequently asked questions</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {FAQ.map(([q, a]) => (
          <section className="card" key={q} style={{ padding: 20 }}>
            <div style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--text)" }}>{q}</div>
            <p style={{ margin: "8px 0 0", fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>{a}</p>
          </section>
        ))}
      </div>

      <Toast toast={toast} />
    </Page>
  );
}

function PlanCard({
  title,
  price,
  features,
  cta,
  highlight,
}: {
  title: string;
  price: string;
  features: string[];
  cta: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className="card"
      style={{
        padding: highlight ? 23 : 24,
        position: "relative",
        border: highlight ? "2px solid var(--ink)" : "1px solid var(--line)",
      }}
    >
      {highlight && (
        <span
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "var(--ball)",
            color: "var(--ball-ink)",
            fontSize: "var(--fs-micro)",
            fontWeight: 700,
            borderRadius: "var(--radius-pill)",
            padding: "4px 12px",
          }}
        >
          Popular
        </span>
      )}
      <div style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--text)" }}>{title}</div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text)" }}>{price}</span>
        <span style={{ fontSize: "var(--fs-body-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>/ month</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "18px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {features.map((f) => (
          <li
            key={f}
            style={{
              fontSize: "var(--fs-body-sm)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: highlight ? "var(--ink)" : "var(--text-secondary)", display: "flex" }}>
              <Icon name="check" size={15} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );
}
