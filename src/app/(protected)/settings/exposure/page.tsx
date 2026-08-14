"use client";

/** 노출 및 필터 설정. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Button, Select, Field, Chip, Banner, Toast, type ToastData } from "@/components/ui";

const REGIONS = [
  { v: "Seoul", label: "서울" },
  { v: "Busan", label: "부산" },
  { v: "Incheon", label: "인천" },
  { v: "Daegu", label: "대구" },
  { v: "Daejeon", label: "대전" },
  { v: "Gwangju", label: "광주" },
  { v: "Gyeonggi", label: "경기" },
  { v: "Other", label: "기타" },
];

const WALK_STYLES = [
  { v: "Calm walk", label: "차분한 산책" },
  { v: "Active walk", label: "활동적인 산책" },
  { v: "Training focused", label: "훈련 위주" },
];

const VISIBILITY = [
  { key: "public", title: "전체 공개", desc: "모든 사용자에게 내 프로필이 보여요" },
  { key: "matched", title: "매칭 상대만", desc: "잘 맞는 상대에게만 프로필이 보여요" },
  { key: "private", title: "비공개", desc: "내 프로필을 숨기고 탐색만 해요" },
];

const INPUT_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--input-bg)",
  borderRadius: 10,
  height: 46,
};

function SectionTitle({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <h2 style={{ margin: first ? "0 0 14px" : "32px 0 14px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>
      {children}
    </h2>
  );
}

function RadioCard({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pd-card"
      style={{
        textAlign: "left",
        width: "100%",
        border: "none",
        padding: 16,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: active
          ? "var(--shadow-card), inset 0 0 0 2px var(--primary)"
          : "var(--shadow-card)",
      }}
    >
      <span
        style={{
          width: 18, height: 18, borderRadius: "var(--radius-pill)", flexShrink: 0,
          border: `2px solid ${active ? "var(--primary)" : "var(--border)"}`,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {active && <span style={{ width: 9, height: 9, borderRadius: "var(--radius-pill)", background: "var(--primary)" }} />}
      </span>
      <span>
        <span style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 700, color: active ? "var(--primary)" : "var(--text)" }}>
          {title}
        </span>
        <span style={{ display: "block", fontSize: "var(--fs-meta)", color: "var(--text-secondary)", marginTop: 4 }}>
          {desc}
        </span>
      </span>
    </button>
  );
}

export default function ExposurePage() {
  const router = useRouter();
  const [visibility, setVisibility] = useState("public");
  const [region, setRegion] = useState("Seoul");
  const [ageRange, setAgeRange] = useState("0-2");
  const [size, setSize] = useState("s");
  const [styles, setStyles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      if (data?.discoverable === false) setVisibility("private");
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const toggleStyle = (v: string) =>
    setStyles((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.put("/settings", {
        discoverable: visibility !== "private",
        species: "all",
        ageRange,
        size,
        walkStyles: styles,
        locationName: region,
      });
      setToast({ msg: "설정이 저장되었어요", type: "ok" });
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="노출 · 필터 설정" subtitle="프로필 공개 범위와 추천 필터를 관리해요." maxWidth={860}>
      <style>{`.pdi:focus{box-shadow:0 0 0 2px var(--primary)}`}</style>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <SectionTitle first>프로필 공개 범위</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {VISIBILITY.map((v) => (
          <RadioCard
            key={v.key}
            active={visibility === v.key}
            title={v.title}
            desc={v.desc}
            onClick={() => setVisibility(v.key)}
          />
        ))}
      </div>

      <SectionTitle>상대 펫 필터</SectionTitle>
      <section className="pd-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="지역">
            <Select className="pdi" style={INPUT_STYLE} value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
            </Select>
          </Field>
          <Field label="펫 나이대">
            <Select className="pdi" style={INPUT_STYLE} value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
              <option value="0-2">0–2살</option>
              <option value="3-5">3–5살</option>
              <option value="6-9">6–9살</option>
              <option value="10+">10살 이상</option>
            </Select>
          </Field>
          <Field label="펫 크기">
            <Select className="pdi" style={INPUT_STYLE} value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="s">소형 (7kg 이하)</option>
              <option value="m">중형 (7–15kg)</option>
              <option value="l">대형 (15kg 이상)</option>
            </Select>
          </Field>
        </div>
      </section>

      <SectionTitle>산책 스타일 필터</SectionTitle>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {WALK_STYLES.map((s) => (
          <Chip key={s.v} active={styles.includes(s.v)} onClick={() => toggleStyle(s.v)}>{s.label}</Chip>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>취소</Button>
        <Button onClick={save} loading={busy} icon="check">저장</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
