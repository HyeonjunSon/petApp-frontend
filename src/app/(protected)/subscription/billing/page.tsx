"use client";

/** 결제 포털 (RTK Query) — 상태/해지 즉시 반영. Stripe 연동 시 url 리다이렉트만 추가됨. */

import { useEffect, useState } from "react";
import { Page } from "@/components/shell/Page";
import { Button, Input, Field, Badge, Toast, type ToastData } from "@/components/ui";
import {
  useBillingMeQuery,
  useCheckoutMutation,
  useCancelSubscriptionMutation,
} from "@/store/api";

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
  const { data: billing } = useBillingMeQuery();
  const [checkout, { isLoading: paying }] = useCheckoutMutation();
  const [cancelSub, { isLoading: canceling }] = useCancelSubscriptionMutation();
  const [toast, setToast] = useState<ToastData>(null);

  const [cardNo, setCardNo] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [holder, setHolder] = useState("");

  const premium = !!billing?.active;
  const nextDate = billing?.subscription?.currentPeriodEnd || null;
  const cancelPending = !!billing?.subscription?.cancelAtPeriodEnd;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  const pay = async () => {
    try {
      const data = await checkout({ planCode: "premium_monthly" }).unwrap();
      if (data?.url) window.location.href = data.url; // Stripe checkout
      else if (data?.ok) setToast({ msg: "Payment complete — Premium is active! 🎾", type: "ok" });
      else setToast({ msg: "Payments are coming soon.", type: "error" });
    } catch {
      setToast({ msg: "Payments are coming soon.", type: "error" });
    }
  };

  const cancel = async () => {
    try {
      const data = await cancelSub().unwrap();
      setToast({
        msg: data?.currentPeriodEnd
          ? `Canceled — benefits stay until ${fmtDate(data.currentPeriodEnd)}.`
          : "Subscription canceled.",
        type: "ok",
      });
    } catch (e: any) {
      setToast({ msg: e?.data?.msg || "Couldn't cancel. Please try again.", type: "error" });
    }
  };

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
          <Badge tone={premium ? "brand" : "slate"}>
            {premium ? (cancelPending ? "Active · ends soon" : "Active") : "Inactive"}
          </Badge>
        </div>
        {premium && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>
                {cancelPending ? "Benefits end on" : "Next billing date"}
              </div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginTop: 4 }}>{fmtDate(nextDate)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>Billing amount</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginTop: 4 }}>$9.99 / month</div>
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
          <Button fullWidth size="lg" loading={paying} onClick={pay}>Pay now</Button>
        </div>
      </section>

      <SectionTitle>Cancel subscription</SectionTitle>
      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
            Your benefits stay active until the expiration date even after canceling.
          </div>
          <Button variant="dangerGhost" disabled={!premium || canceling || cancelPending} onClick={cancel}>
            {cancelPending ? "Cancellation scheduled" : "Cancel subscription"}
          </Button>
        </div>
      </section>

      <Toast toast={toast} />
    </Page>
  );
}
