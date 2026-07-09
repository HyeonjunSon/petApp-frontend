"use client";

/** 프리미엄 구독 — plan comparison + FAQ. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Card as UICard, Button, Toast, type ToastData } from "@/components/ui";

type Plan = {
  code: string;
  label: string;
  priceCents: number;
  currency?: string;
  interval: "month" | "year";
  features?: string[];
};

const FREE_FEATURES = ["5 swipes per day", "3 match messages per day", "Basic filters (distance·breed)", "With ads"];
const PREMIUM_FEATURES = [
  "Unlimited swipes",
  "Unlimited match messages",
  "Advanced filters (temperament·walk style·age)",
  "See who liked you",
  "No ads",
  "Premium badge",
];

const FAQ = [
  ["Can I cancel anytime?", "Yes—cancel anytime; benefits last until the expiry date."],
  ["What payment methods are supported?", "Credit/debit cards, KakaoPay, and NaverPay."],
  ["Do benefits apply immediately?", "Yes—benefits apply as soon as payment completes."],
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
    <Page title="Premium" maxWidth={920}>
      <UICard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>Current plan</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
              {premium ? "PetDate Premium" : "Free plan"}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
              {premium ? "All premium benefits active" : "5 swipes/day · limited match messages"}
            </div>
          </div>
          {premium ? (
            <Button variant="secondary" onClick={() => router.push("/subscription/billing")}>Manage</Button>
          ) : (
            <Button onClick={subscribe} loading={busy}>Upgrade plan</Button>
          )}
        </div>
      </UICard>

      <h2 style={{ margin: "32px 0 14px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>Compare plans</h2>
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
          cta={<Button fullWidth loading={busy} onClick={subscribe}>Get Premium</Button>}
        />
      </div>

      <h2 style={{ margin: "32px 0 14px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>FAQ</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {FAQ.map(([q, a]) => (
          <UICard key={q}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{q}</div>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--ink-soft)" }}>{a}</p>
          </UICard>
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
      style={{
        background: "var(--bg)",
        border: `1px solid ${highlight ? "var(--brand)" : "var(--border)"}`,
        borderRadius: "var(--r-card)",
        boxShadow: "var(--sh-card)",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{title}</div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)" }}>{price}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-soft)" }}>/ mo</span>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "18px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {features.map((f) => (
          <li key={f} style={{ fontSize: 14, color: "var(--ink-soft)" }}>{f}</li>
        ))}
      </ul>
      {cta}
    </div>
  );
}
