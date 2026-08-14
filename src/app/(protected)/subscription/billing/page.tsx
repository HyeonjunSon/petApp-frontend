"use client";

/** 결제 포털 — 구독 상태 + 결제 수단 (Stripe 연동 예정). */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Button, Input, Field, Badge, Toast, type ToastData } from "@/components/ui";

const INPUT_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--input-bg)",
  borderRadius: 10,
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

  const pay = async () => {
    setBusy(true);
    try {
      const { data } = await api.post<{ url?: string }>("/billing/checkout", { planCode: "premium_monthly" });
      if (data?.url) window.location.href = data.url;
      else setToast({ msg: "결제 기능을 준비 중이에요.", type: "error" });
    } catch {
      setToast({ msg: "결제 기능을 준비 중이에요.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <Page title="구독 관리" subtitle="구독 상태와 결제 수단을 관리해요." maxWidth={880}>
      <style>{`.pdi:focus{box-shadow:0 0 0 2px var(--primary)}`}</style>

      <SectionTitle first>구독 상태</SectionTitle>
      <section className="pd-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>현재 플랜</div>
            <div style={{ fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)", marginTop: 4 }}>
              {premium ? "PetDate 프리미엄" : "무료 플랜"}
            </div>
          </div>
          <Badge tone={premium ? "brand" : "slate"}>{premium ? "이용 중" : "미이용"}</Badge>
        </div>
        {premium && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>다음 결제일</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginTop: 4 }}>{fmtDate(nextDate)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>결제 금액</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginTop: 4 }}>₩9,900 / 월</div>
            </div>
          </div>
        )}
      </section>

      <SectionTitle>결제 수단</SectionTitle>
      <section className="pd-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
            등록된 결제 수단이 없어요.
          </div>
          <Button variant="secondary" onClick={() => setToast({ msg: "카드 관리 기능을 준비 중이에요.", type: "error" })}>
            카드 변경
          </Button>
        </div>
      </section>

      <SectionTitle>결제 수단 추가</SectionTitle>
      <section className="pd-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="카드 번호">
            <Input className="pdi" style={INPUT_STYLE} value={cardNo} onChange={(e) => setCardNo(e.target.value)} inputMode="numeric" placeholder="0000 0000 0000 0000" />
          </Field>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="유효기간 (MM/YY)">
              <Input className="pdi" style={{ ...INPUT_STYLE, width: 160 }} value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/YY" />
            </Field>
            <Field label="CVC">
              <Input className="pdi" style={{ ...INPUT_STYLE, width: 120 }} value={cvc} onChange={(e) => setCvc(e.target.value)} inputMode="numeric" />
            </Field>
          </div>
          <Field label="카드 소유자 이름">
            <Input className="pdi" style={INPUT_STYLE} value={holder} onChange={(e) => setHolder(e.target.value)} />
          </Field>
          <Button fullWidth size="lg" loading={busy} onClick={pay}>결제하기</Button>
        </div>
      </section>

      <SectionTitle>구독 해지</SectionTitle>
      <section className="pd-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
            해지해도 혜택은 만료일까지 그대로 유지돼요.
          </div>
          <Button
            variant="dangerGhost"
            disabled={!premium}
            onClick={() => setToast({ msg: "구독 해지 기능을 준비 중이에요.", type: "error" })}
          >
            구독 해지
          </Button>
        </div>
      </section>

      <Toast toast={toast} />
    </Page>
  );
}
