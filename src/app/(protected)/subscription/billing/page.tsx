"use client";

/** 결제 포털 — 구독 상태 + 결제 수단 (Stripe 연동 예정). */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Button, Input, Field, Badge, Toast, type ToastData } from "@/components/ui";

const INPUT_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--paper)",
  borderRadius: "var(--radius-input)",
  height: 46,
};

function SectionTitle({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <h2 style={{ margin: first ? "0 0 12px" : "32px 0 12px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>
      {children}
    </h2>
  );
}

export default function BillingPortalPage() {
  const router = useRouter();
  const [premium, setPremium] = useState(false);
  const [nextDate, setNextDate] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);

  const [cardNo, setCardNo] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [holder, setHolder] = useState("");

  useEffect(() => {
    api.get("/billing/me").then(({ data }) => {
      const active = data?.active || data?.subscription?.status === "active" || data?.plan === "premium";
      setPremium(!!active);
      setNextDate(data?.currentPeriodEnd || data?.subscription?.currentPeriodEnd || null);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  const refresh = () =>
    api.get("/billing/me").then(({ data }) => {
      const active = data?.active || data?.subscription?.status === "active";
      setPremium(!!active);
      setNextDate(data?.subscription?.currentPeriodEnd || null);
    }).catch(() => {});

  const pay = async () => {
    setBusy(true);
    try {
      const { data } = await api.post<{ url?: string; ok?: boolean }>("/billing/checkout", { planCode: "premium_monthly" });
      if (data?.url) {
        window.location.href = data.url; // Stripe checkout
      } else if (data?.ok) {
        setToast({ msg: "Payment complete — Premium is active! 🎾", type: "ok" });
        refresh();
      } else {
        setToast({ msg: "Payments are coming soon.", type: "error" });
      }
    } catch {
      setToast({ msg: "Payments are coming soon.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/billing/cancel");
      setToast({
        msg: data?.currentPeriodEnd
          ? `Canceled — benefits stay until ${fmtDate(data.currentPeriodEnd)}.`
          : "Subscription canceled.",
        type: "ok",
      });
      refresh();
    } catch (e: any) {
      setToast({ msg: e?.response?.data?.msg || "Couldn't cancel. Please try again.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <Page title="Manage subscription" subtitle="Manage your subscription status and payment method." maxWidth={880}>
      <style>{`.pdi:focus{outline:2px solid var(--ink) !important}`}</style>

      <SectionTitle first>Subscription status</SectionTitle>
      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>Current plan</div>
            <div style={{ fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)", marginTop: 4 }}>
              {premium ? "Offleash Premium" : "Free plan"}
            </div>
          </div>
          <Badge tone={premium ? "brand" : "slate"}>{premium ? "Active" : "Inactive"}</Badge>
        </div>
        {premium && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>Next billing date</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginTop: 4 }}>{fmtDate(nextDate)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>Billing amount</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginTop: 4 }}>₩9,900 / month</div>
            </div>
          </div>
        )}
      </section>

      <SectionTitle>Payment method</SectionTitle>
      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
            No payment method on file.
          </div>
          <Button variant="secondary" onClick={() => setToast({ msg: "Card management is coming soon.", type: "error" })}>
            Change card
          </Button>
        </div>
      </section>

      <SectionTitle>Add payment method</SectionTitle>
      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Card number">
            <Input className="pdi" style={INPUT_STYLE} value={cardNo} onChange={(e) => setCardNo(e.target.value)} inputMode="numeric" placeholder="0000 0000 0000 0000" />
          </Field>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Expiry (MM/YY)">
              <Input className="pdi" style={{ ...INPUT_STYLE, width: 160 }} value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/YY" />
            </Field>
            <Field label="CVC">
              <Input className="pdi" style={{ ...INPUT_STYLE, width: 120 }} value={cvc} onChange={(e) => setCvc(e.target.value)} inputMode="numeric" />
            </Field>
          </div>
          <Field label="Cardholder name">
            <Input className="pdi" style={INPUT_STYLE} value={holder} onChange={(e) => setHolder(e.target.value)} />
          </Field>
          <Button fullWidth size="lg" loading={busy} onClick={pay}>Pay now</Button>
        </div>
      </section>

      <SectionTitle>Cancel subscription</SectionTitle>
      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
            Your benefits stay active until the expiration date even after canceling.
          </div>
          <Button variant="dangerGhost" disabled={!premium || busy} onClick={cancel}>
            Cancel subscription
          </Button>
        </div>
      </section>

      <Toast toast={toast} />
    </Page>
  );
}
