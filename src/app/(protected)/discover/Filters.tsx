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
      <Labeled label="Distance">
        <Select value={dist} onChange={(e) => setDist(e.target.value)} style={selStyle}>
          <option value="500">Within 500m</option>
          <option value="1000">Within 1km</option>
          <option value="3000">Within 3km</option>
          <option value="10000">Within 10km</option>
        </Select>
      </Labeled>
      <Labeled label="Breed">
        <Select value={breed} onChange={(e) => setBreed(e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
      </Labeled>
      <Labeled label="Temperament">
        <Select value={temper} onChange={(e) => setTemper(e.target.value)} style={selStyle}>
          <option value="all">All</option>
          <option value="active">Energetic</option>
          <option value="calm">Calm</option>
          <option value="social">Social</option>
        </Select>
      </Labeled>
      <Button size="sm" variant="secondary" onClick={onApply}>
        Apply filters
      </Button>
    </div>
  );
}
