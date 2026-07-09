"use client";

import { Card as UICard, Button } from "@/components/ui";

const BENEFITS = [
  { title: "Unlimited swipes", desc: "Discover pets all day, no limits" },
  { title: "Premium filters", desc: "Search precisely by age, size, and walk style" },
  { title: "Priority matching", desc: "Meet the best matches for your pet first" },
];

export default function SwipeLimit({
  used,
  limit,
  onLater,
  onUpgrade,
}: {
  used: number;
  limit: number;
  onLater: () => void;
  onUpgrade: () => void;
}) {
  return (
    <div style={{ maxWidth: 720 }}>
      <UICard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
              Today's swipe limit
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 14 }}>
              Swipes used
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "var(--ink)",
                marginTop: 4,
              }}
            >
              {used} / {limit}
            </div>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            Resets at midnight
          </div>
        </div>
      </UICard>

      <h3
        style={{
          margin: "28px 0 16px",
          fontSize: 18,
          fontWeight: 800,
          color: "var(--ink)",
        }}
      >
        Upgrade to Premium
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {BENEFITS.map((b) => (
          <div key={b.title}>
            <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>{b.title}</div>
            <div style={{ fontSize: 15, color: "var(--ink)", marginTop: 2 }}>
              {b.desc}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 32,
        }}
      >
        <Button variant="secondary" onClick={onLater}>
          Later
        </Button>
        <Button onClick={onUpgrade}>Get Premium</Button>
      </div>
    </div>
  );
}
