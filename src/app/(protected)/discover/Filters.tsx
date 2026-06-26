"use client";

import { useState } from "react";
import { Button, Select } from "@/components/ui";

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const selStyle: React.CSSProperties = { height: 40, width: 120, fontSize: 13 };

export default function Filters({ onApply }: { onApply: () => void }) {
  const [dist, setDist] = useState("500");
  const [breed, setBreed] = useState("all");
  const [temper, setTemper] = useState("all");

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
      <Labeled label="지역·거리">
        <Select value={dist} onChange={(e) => setDist(e.target.value)} style={selStyle}>
          <option value="500">500m 이내</option>
          <option value="1000">1km 이내</option>
          <option value="3000">3km 이내</option>
          <option value="10000">10km 이내</option>
        </Select>
      </Labeled>
      <Labeled label="견종">
        <Select value={breed} onChange={(e) => setBreed(e.target.value)} style={selStyle}>
          <option value="all">전체</option>
          <option value="small">소형견</option>
          <option value="medium">중형견</option>
          <option value="large">대형견</option>
        </Select>
      </Labeled>
      <Labeled label="성격">
        <Select value={temper} onChange={(e) => setTemper(e.target.value)} style={selStyle}>
          <option value="all">전체</option>
          <option value="active">활발함</option>
          <option value="calm">차분함</option>
          <option value="social">사교적</option>
        </Select>
      </Labeled>
      <Button size="sm" variant="secondary" onClick={onApply}>
        필터 적용
      </Button>
    </div>
  );
}
