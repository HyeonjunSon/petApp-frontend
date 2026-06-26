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

const FREE_FEATURES = ["스와이프 하루 5회", "매칭 메시지 하루 3건", "기본 필터 (거리·견종)", "광고 포함"];
const PREMIUM_FEATURES = [
  "스와이프 무제한",
  "매칭 메시지 무제한",
  "고급 필터 (성격·산책 스타일·나이)",
  "좋아요 보낸 펫 목록 열람",
  "광고 없음",
  "프리미엄 배지 표시",
];

const FAQ = [
  ["구독은 언제든지 취소할 수 있나요?", "네, 구독 기간 중 언제든지 취소할 수 있으며 만료일까지 혜택이 유지됩니다."],
  ["결제 수단은 무엇을 지원하나요?", "신용카드, 체크카드, 카카오페이, 네이버페이를 지원합니다."],
  ["프리미엄 전환 후 즉시 적용되나요?", "네, 결제가 완료되면 즉시 프리미엄 혜택이 적용됩니다."],
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
      else setToast({ msg: "결제 기능을 준비 중이에요. 곧 오픈됩니다.", type: "error" });
    } catch (e: any) {
      setToast({
        msg: e?.response?.data?.msg || "결제 기능을 준비 중이에요. 곧 오픈됩니다.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="프리미엄 구독" maxWidth={920}>
      <UICard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>현재 구독 상태</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
              {premium ? "PetDate 프리미엄" : "무료 플랜"}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
              {premium ? "모든 프리미엄 혜택 이용 중" : "매일 스와이프 5회 · 매칭 메시지 제한 있음"}
            </div>
          </div>
          {premium ? (
            <Button variant="secondary" onClick={() => router.push("/subscription/billing")}>구독 관리</Button>
          ) : (
            <Button onClick={subscribe} loading={busy}>플랜 업그레이드</Button>
          )}
        </div>
      </UICard>

      <h2 style={{ margin: "32px 0 14px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>플랜 비교</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <PlanCard
          title="무료"
          price="₩0"
          features={FREE_FEATURES}
          cta={<Button variant="secondary" fullWidth disabled>현재 플랜</Button>}
        />
        <PlanCard
          title="프리미엄"
          price="₩9,900"
          highlight
          features={PREMIUM_FEATURES}
          cta={<Button fullWidth loading={busy} onClick={subscribe}>프리미엄 시작하기</Button>}
        />
      </div>

      <h2 style={{ margin: "32px 0 14px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>자주 묻는 질문</h2>
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
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-soft)" }}>/ 월</span>
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
