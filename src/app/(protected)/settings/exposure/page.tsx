"use client";

/** 노출 및 필터 설정. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Card as UICard, Button, Select, Field, Chip, Banner, Toast, type ToastData } from "@/components/ui";

const REGIONS = ["서울", "부산", "인천", "대구", "대전", "광주", "경기", "기타"];
const WALK_STYLES = ["차분한 산책", "활발한 산책", "훈련 중심"];

const VISIBILITY = [
  { key: "public", title: "전체 공개", desc: "모든 사용자에게 프로필이 보입니다" },
  { key: "matched", title: "매칭 사용자만", desc: "내 반려동물과 조건이 맞는 사용자에게만 공개됩니다" },
  { key: "private", title: "비공개", desc: "프로필을 숨기고 내가 검색한 사용자에게만 보입니다" },
];

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
      style={{
        textAlign: "left",
        width: "100%",
        border: `1px solid ${active ? "var(--brand)" : "var(--border)"}`,
        borderRadius: "var(--r-card)",
        background: active ? "var(--brand-tint)" : "var(--bg)",
        padding: 16,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>{title}</div>
      <div style={{ fontSize: 14, color: "var(--ink)", margin: "6px 0 12px" }}>{desc}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 18, height: 18, borderRadius: "50%",
            border: `2px solid ${active ? "var(--brand)" : "var(--border-strong)"}`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {active && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--brand)" }} />}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: active ? "var(--brand-strong)" : "var(--ink-soft)" }}>선택</span>
      </div>
    </button>
  );
}

export default function ExposurePage() {
  const router = useRouter();
  const [visibility, setVisibility] = useState("public");
  const [region, setRegion] = useState("서울");
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
      setToast({ msg: "설정을 저장했어요", type: "ok" });
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="노출 및 필터 설정" maxWidth={860}>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>프로필 노출 범위</h2>
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

      <h2 style={{ margin: "32px 0 14px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>나의 반려동물 정보 필터</h2>
      <UICard>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="거주 지역">
            <Select value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="반려동물 나이 범위">
            <Select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
              <option value="0-2">0~2세</option>
              <option value="3-5">3~5세</option>
              <option value="6-9">6~9세</option>
              <option value="10+">10세 이상</option>
            </Select>
          </Field>
          <Field label="반려동물 크기">
            <Select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="s">소형 (7kg 이하)</option>
              <option value="m">중형 (7~15kg)</option>
              <option value="l">대형 (15kg 이상)</option>
            </Select>
          </Field>
        </div>
      </UICard>

      <h2 style={{ margin: "32px 0 14px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>산책 스타일 필터</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {WALK_STYLES.map((s) => (
          <Chip key={s} active={styles.includes(s)} onClick={() => toggleStyle(s)}>{s}</Chip>
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
