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
      else setToast({ msg: "결제 기능을 준비 중이에요. 곧 오픈됩니다.", type: "error" });
    } catch {
      setToast({ msg: "결제 기능을 준비 중이에요. 곧 오픈됩니다.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <Page title="결제 포털" maxWidth={880}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>구독 현황</h2>
      <UICard>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>현재 플랜</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
              {premium ? "PetDate 프리미엄" : "무료 플랜"}
            </div>
          </div>
          <Badge tone={premium ? "brand" : "slate"}>{premium ? "활성" : "비활성"}</Badge>
        </div>
        {premium && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>다음 결제일</div>
              <div style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{fmtDate(nextDate)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>결제 금액</div>
              <div style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>₩9,900 / 월</div>
            </div>
          </div>
        )}
      </UICard>

      <h2 style={{ margin: "32px 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>결제 수단</h2>
      <UICard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            등록된 결제 수단이 없어요.
          </div>
          <Button variant="secondary" onClick={() => setToast({ msg: "결제 수단 관리는 준비 중이에요.", type: "error" })}>
            카드 변경
          </Button>
        </div>
      </UICard>

      <h2 style={{ margin: "32px 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>새 결제 수단 추가</h2>
      <UICard>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="카드 번호"><Input value={cardNo} onChange={(e) => setCardNo(e.target.value)} inputMode="numeric" placeholder="0000 0000 0000 0000" /></Field>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="유효기간 (MM/YY)"><Input value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/YY" style={{ width: 160 }} /></Field>
            <Field label="CVC"><Input value={cvc} onChange={(e) => setCvc(e.target.value)} inputMode="numeric" style={{ width: 120 }} /></Field>
          </div>
          <Field label="카드 소유자 이름"><Input value={holder} onChange={(e) => setHolder(e.target.value)} /></Field>
          <Button fullWidth size="lg" loading={busy} onClick={pay}>결제 진행</Button>
        </div>
      </UICard>

      <h2 style={{ margin: "32px 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>구독 관리</h2>
      <UICard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            구독을 취소하면 만료일까지 혜택이 유지됩니다.
          </div>
          <Button
            variant="dangerGhost"
            disabled={!premium}
            onClick={() => setToast({ msg: "구독 취소는 준비 중이에요.", type: "error" })}
          >
            구독 취소
          </Button>
        </div>
      </UICard>

      <Toast toast={toast} />
    </Page>
  );
}
