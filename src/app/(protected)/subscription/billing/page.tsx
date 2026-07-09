"use client";

/** 결제 포털 — subscription status + payment methods (Stripe pending). */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Card as UICard, Button, Input, Field, Badge, Toast, type ToastData } from "@/components/ui";

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

  const pay = async () => {
    setBusy(true);
    try {
      const { data } = await api.post<{ url?: string }>("/billing/checkout", { planCode: "premium_monthly" });
      if (data?.url) window.location.href = data.url;
      else setToast({ msg: "Payments are coming soon.", type: "error" });
    } catch {
      setToast({ msg: "Payments are coming soon.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <Page title="Billing" maxWidth={880}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>Subscription status</h2>
      <UICard>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>Current plan</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
              {premium ? "PetDate Premium" : "Free plan"}
            </div>
          </div>
          <Badge tone={premium ? "brand" : "slate"}>{premium ? "Active" : "Inactive"}</Badge>
        </div>
        {premium && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>Next billing date</div>
              <div style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{fmtDate(nextDate)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>Amount</div>
              <div style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>₩9,900 / mo</div>
            </div>
          </div>
        )}
      </UICard>

      <h2 style={{ margin: "32px 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>Payment method</h2>
      <UICard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            No payment method on file.
          </div>
          <Button variant="secondary" onClick={() => setToast({ msg: "Card management is coming soon.", type: "error" })}>
            Change card
          </Button>
        </div>
      </UICard>

      <h2 style={{ margin: "32px 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>Add payment method</h2>
      <UICard>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Card number"><Input value={cardNo} onChange={(e) => setCardNo(e.target.value)} inputMode="numeric" placeholder="0000 0000 0000 0000" /></Field>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Expiry (MM/YY)"><Input value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/YY" style={{ width: 160 }} /></Field>
            <Field label="CVC"><Input value={cvc} onChange={(e) => setCvc(e.target.value)} inputMode="numeric" style={{ width: 120 }} /></Field>
          </div>
          <Field label="Cardholder name"><Input value={holder} onChange={(e) => setHolder(e.target.value)} /></Field>
          <Button fullWidth size="lg" loading={busy} onClick={pay}>Pay</Button>
        </div>
      </UICard>

      <h2 style={{ margin: "32px 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>Manage subscription</h2>
      <UICard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            If you cancel, benefits last until the expiry date.
          </div>
          <Button
            variant="dangerGhost"
            disabled={!premium}
            onClick={() => setToast({ msg: "Subscription cancellation is coming soon.", type: "error" })}
          >
            Cancel subscription
          </Button>
        </div>
      </UICard>

      <Toast toast={toast} />
    </Page>
  );
}
