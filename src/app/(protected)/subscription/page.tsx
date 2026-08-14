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

const FREE_FEATURES = ["하루 스와이프 5회", "매칭 메시지 하루 3회", "기본 필터 (거리 · 견종)", "광고 포함"];
const PREMIUM_FEATURES = [
  "무제한 스와이프",
  "무제한 매칭 메시지",
  "고급 필터 (성격 · 산책 스타일 · 나이)",
  "나를 좋아한 상대 확인",
  "광고 없음",
  "프리미엄 배지",
];

const FAQ = [
  ["언제든 해지할 수 있나요?", "네, 언제든 해지할 수 있어요. 혜택은 만료일까지 그대로 유지돼요."],
  ["어떤 결제 수단을 지원하나요?", "신용·체크카드, 카카오페이, 네이버페이를 지원해요."],
  ["혜택은 바로 적용되나요?", "네, 결제가 완료되면 즉시 적용돼요."],
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
      else setToast({ msg: "결제 기능을 준비 중이에요.", type: "error" });
    } catch (e: any) {
      setToast({
        msg: e?.response?.data?.msg || "결제 기능을 준비 중이에요.",
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="프리미엄" subtitle="더 많은 매칭과 프리미엄 기능을 만나요." maxWidth={920}>
      <section className="pd-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>현재 플랜</div>
            <div style={{ fontSize: "var(--fs-h2)", fontWeight: 800, color: "var(--text)", marginTop: 4 }}>
              {premium ? "PetDate 프리미엄" : "무료 플랜"}
            </div>
            <div style={{ fontSize: "var(--fs-meta)", color: "var(--text-secondary)", marginTop: 4 }}>
              {premium ? "모든 프리미엄 혜택 이용 중" : "하루 스와이프 5회 · 매칭 메시지 제한"}
            </div>
          </div>
          {premium ? (
            <Button variant="secondary" onClick={() => router.push("/subscription/billing")}>관리</Button>
          ) : (
            <Button onClick={subscribe} loading={busy}>플랜 업그레이드</Button>
          )}
        </div>
      </section>

      <h2 style={{ margin: "32px 0 14px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>플랜 비교</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <PlanCard
          title="무료"
          price="₩0"
          features={FREE_FEATURES}
          cta={<Button variant="secondary" fullWidth disabled>현재 이용 중</Button>}
        />
        <PlanCard
          title="프리미엄"
          price="₩9,900"
          highlight
          features={PREMIUM_FEATURES}
          cta={<Button fullWidth loading={busy} onClick={subscribe}>프리미엄 시작하기</Button>}
        />
      </div>

      <h2 style={{ margin: "32px 0 14px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>자주 묻는 질문</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {FAQ.map(([q, a]) => (
          <section className="pd-card" key={q} style={{ padding: 20 }}>
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
      className="pd-card"
      style={{
        padding: 24,
        position: "relative",
        boxShadow: highlight
          ? "var(--shadow-card), inset 0 0 0 2px var(--primary)"
          : "var(--shadow-card)",
      }}
    >
      {highlight && (
        <span
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "var(--primary-10)",
            color: "var(--primary)",
            fontSize: "var(--fs-micro)",
            fontWeight: 700,
            borderRadius: "var(--radius-pill)",
            padding: "4px 12px",
          }}
        >
          인기
        </span>
      )}
      <div style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--text)" }}>{title}</div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text)" }}>{price}</span>
        <span style={{ fontSize: "var(--fs-body-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>/ 월</span>
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
            <span style={{ color: highlight ? "var(--primary)" : "var(--text-secondary)", display: "flex" }}>
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
