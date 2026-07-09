"use client";

/** 노출 및 필터 설정. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Card as UICard, Button, Select, Field, Chip, Banner, Toast, type ToastData } from "@/components/ui";

const REGIONS = ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Gyeonggi", "Other"];
const WALK_STYLES = ["Calm walk", "Active walk", "Training focused"];

const VISIBILITY = [
  { key: "public", title: "Public", desc: "Everyone can see your profile" },
  { key: "matched", title: "Matches only", desc: "Only shown to compatible users" },
  { key: "private", title: "Private", desc: "Hidden; only visible to users you browse" },
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
        <span style={{ fontSize: 13, fontWeight: 600, color: active ? "var(--brand-strong)" : "var(--ink-soft)" }}>Select</span>
      </div>
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
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Visibility & filters" maxWidth={860}>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>Profile visibility</h2>
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

      <h2 style={{ margin: "32px 0 14px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>My pet filters</h2>
      <UICard>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Location">
            <Select value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Pet age range">
            <Select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
              <option value="0-2">0–2 yrs</option>
              <option value="3-5">3–5 yrs</option>
              <option value="6-9">6–9 yrs</option>
              <option value="10+">10+ yrs</option>
            </Select>
          </Field>
          <Field label="Pet size">
            <Select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="s">Small (≤7kg)</option>
              <option value="m">Medium (7–15kg)</option>
              <option value="l">Large (≥15kg)</option>
            </Select>
          </Field>
        </div>
      </UICard>

      <h2 style={{ margin: "32px 0 14px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>Walk style filter</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {WALK_STYLES.map((s) => (
          <Chip key={s} active={styles.includes(s)} onClick={() => toggleStyle(s)}>{s}</Chip>
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
