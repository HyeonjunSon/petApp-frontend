"use client";

/** 노출 및 필터 설정. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Button, Select, Field, Chip, Banner, Toast, type ToastData } from "@/components/ui";

const REGIONS = [
  { v: "Seoul", label: "Seoul" },
  { v: "Busan", label: "Busan" },
  { v: "Incheon", label: "Incheon" },
  { v: "Daegu", label: "Daegu" },
  { v: "Daejeon", label: "Daejeon" },
  { v: "Gwangju", label: "Gwangju" },
  { v: "Gyeonggi", label: "Gyeonggi" },
  { v: "Other", label: "Other" },
];

const WALK_STYLES = [
  { v: "Calm walk", label: "Calm walk" },
  { v: "Active walk", label: "Active walk" },
  { v: "Training focused", label: "Training focused" },
];

const VISIBILITY = [
  { key: "public", title: "Public", desc: "Everyone can see your profile" },
  { key: "matched", title: "Matches only", desc: "Only well-matched people can see your profile" },
  { key: "private", title: "Private", desc: "Hide your profile and just browse" },
];

const INPUT_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--paper)",
  borderRadius: "var(--radius-input)",
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
      className="card"
      style={{
        textAlign: "left",
        width: "100%",
        padding: active ? 15 : 16,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 14,
        border: active ? "2px solid var(--ink)" : "1px solid var(--line)",
      }}
    >
      <span
        style={{
          width: 18, height: 18, borderRadius: "var(--radius-pill)", flexShrink: 0,
          border: `2px solid ${active ? "var(--ink)" : "var(--line)"}`,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {active && <span style={{ width: 9, height: 9, borderRadius: "var(--radius-pill)", background: "var(--ink)" }} />}
      </span>
      <span>
        <span style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--ink)" }}>
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
      setToast({ msg: "Settings saved", type: "ok" });
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "Failed to save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Visibility & filters" subtitle="Manage your profile visibility and match filters." maxWidth={860}>
      <style>{`.pdi:focus{outline:2px solid var(--ink) !important}`}</style>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <SectionTitle first>Profile visibility</SectionTitle>
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

      <SectionTitle>Pet filters</SectionTitle>
      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Region">
            <Select className="pdi" style={INPUT_STYLE} value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
            </Select>
          </Field>
          <Field label="Pet age range">
            <Select className="pdi" style={INPUT_STYLE} value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
              <option value="0-2">0–2 years</option>
              <option value="3-5">3–5 years</option>
              <option value="6-9">6–9 years</option>
              <option value="10+">10+ years</option>
            </Select>
          </Field>
          <Field label="Pet size">
            <Select className="pdi" style={INPUT_STYLE} value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="s">Small (under 7kg)</option>
              <option value="m">Medium (7–15kg)</option>
              <option value="l">Large (over 15kg)</option>
            </Select>
          </Field>
        </div>
      </section>

      <SectionTitle>Walk style filters</SectionTitle>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {WALK_STYLES.map((s) => (
          <Chip key={s.v} active={styles.includes(s.v)} onClick={() => toggleStyle(s.v)}>{s.label}</Chip>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>Cancel</Button>
        <Button onClick={save} loading={busy} icon="check">Save</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
