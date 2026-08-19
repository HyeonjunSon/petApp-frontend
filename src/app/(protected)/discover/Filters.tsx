"use client";

import { useState } from "react";
import { Icon, Select } from "@/components/ui";

/* 시안 칩: 기존 크기 필터 옵션(전체/소형/중형/대형)을 한국어 칩으로 */
const SIZE_CHIPS = [
  { value: "all", label: "All" },
  { value: "small", label: "🐕 Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "🦮 Large" },
];

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: "var(--fs-caption)",
          color: "var(--text-secondary)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

const selStyle: React.CSSProperties = { height: 40, width: 130, fontSize: "var(--fs-meta)" };

export default function Filters({ onApply }: { onApply: () => void }) {
  const [dist, setDist] = useState("500");
  const [breed, setBreed] = useState("all");
  const [temper, setTemper] = useState("all");
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {SIZE_CHIPS.map((c) => {
          const active = breed === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                setBreed(c.value);
                onApply();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "7px 14px",
                border: "none",
                borderRadius: "var(--radius-pill)",
                background: active ? "var(--primary)" : "var(--input-bg)",
                color: active ? "var(--white)" : "var(--text-secondary)",
                fontSize: "var(--fs-meta)",
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "opacity .12s",
              }}
            >
              {c.label}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "var(--input-bg)",
            color: "var(--text-secondary)",
            fontSize: "var(--fs-meta)",
            fontWeight: 600,
            fontFamily: "inherit",
            borderRadius: "var(--radius-md)",
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          <Icon name="filter" size={16} />
          Filters
        </button>
      </div>

      {open && (
        <div
          style={{
            marginTop: 12,
            background: "var(--surface)",
            borderRadius: "var(--radius-2xl)",
            boxShadow: "var(--shadow-card)",
            padding: 16,
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Labeled label="Distance">
            <Select value={dist} onChange={(e) => setDist(e.target.value)} style={selStyle}>
              <option value="500">Within 500m</option>
              <option value="1000">Within 1km</option>
              <option value="3000">Within 3km</option>
              <option value="10000">Within 10km</option>
            </Select>
          </Labeled>
          <Labeled label="Temperament">
            <Select value={temper} onChange={(e) => setTemper(e.target.value)} style={selStyle}>
              <option value="all">All</option>
              <option value="active">Energetic</option>
              <option value="calm">Calm</option>
              <option value="social">Friendly</option>
            </Select>
          </Labeled>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onApply();
            }}
            style={{
              border: "none",
              background: "var(--primary)",
              color: "var(--white)",
              fontSize: "var(--fs-meta)",
              fontWeight: 700,
              fontFamily: "inherit",
              borderRadius: "var(--radius-md)",
              padding: "11px 16px",
              cursor: "pointer",
            }}
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
