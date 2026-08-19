"use client";

const BENEFITS = [
  { title: "Unlimited swipes", desc: "Meet friends all day with no limits" },
  { title: "Premium filters", desc: "Search precisely by age, size, and walk style" },
  { title: "Priority matching", desc: "Meet the best matches for your pet first" },
];

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "12px 18px",
  fontSize: "var(--fs-meta)",
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "opacity .15s",
};

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
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-card)",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "var(--fs-h3)",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Today's Swipe Limit
            </div>
            <div
              style={{
                fontSize: "var(--fs-meta)",
                color: "var(--text-secondary)",
                marginTop: 14,
              }}
            >
              Swipes used
            </div>
            <div
              style={{
                fontSize: "var(--fs-display)",
                fontWeight: 800,
                color: "var(--text)",
                marginTop: 4,
              }}
            >
              {used} / {limit}
            </div>
          </div>
          <div style={{ fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}>
            Resets at midnight
          </div>
        </div>
      </div>

      <h3
        style={{
          margin: "28px 0 16px",
          fontSize: "var(--fs-h3)",
          fontWeight: 800,
          color: "var(--text)",
        }}
      >
        Upgrade to Premium
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {BENEFITS.map((b) => (
          <div key={b.title}>
            <div
              style={{
                fontSize: "var(--fs-meta)",
                fontWeight: 700,
                color: "var(--primary)",
              }}
            >
              {b.title}
            </div>
            <div
              style={{
                fontSize: "var(--fs-body)",
                color: "var(--text)",
                marginTop: 2,
              }}
            >
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
        <button
          type="button"
          onClick={onLater}
          style={{
            ...btnBase,
            background: "var(--input-bg)",
            color: "var(--text-secondary)",
          }}
        >
          Later
        </button>
        <button
          type="button"
          onClick={onUpgrade}
          style={{
            ...btnBase,
            background: "var(--primary)",
            color: "var(--white)",
          }}
        >
          Start Premium
        </button>
      </div>
    </div>
  );
}
