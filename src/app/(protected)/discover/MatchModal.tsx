"use client";

import { Button, Chip, Avatar } from "@/components/ui";
import { ImagePlaceholder } from "@/components/shell/Page";
import { type Card } from "@/lib/card";

export default function MatchModal({
  card,
  onChat,
  onLater,
}: {
  card: Card;
  onChat: () => void;
  onLater: () => void;
}) {
  return (
    <div
      onClick={onLater}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "var(--overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "pd-fade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--bg)",
          borderRadius: "var(--r-card)",
          boxShadow: "var(--sh-pop)",
          padding: 28,
          animation: "pd-pop .25s ease",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "var(--ink)" }}>
          It's a match!
        </h2>
        <p style={{ margin: "8px 0 18px", fontSize: 15, color: "var(--ink-soft)" }}>
          You both liked each other
        </p>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <ImagePlaceholder
            src={card.photos[0]}
            label="Pet"
            height={200}
            radius={10}
          />
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
              {card.petName || "Pet"}
            </span>
            <span style={{ fontSize: 14, color: "var(--ink-soft)", marginLeft: 8 }}>
              {[card.breed, card.age != null ? `${card.age} yrs` : ""]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
          {(card.temperament || []).length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {card.temperament!.slice(0, 3).map((t, i) => (
                <Chip key={i}>{t}</Chip>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={card.ownerFace} fallbackText="User" size={40} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
              {card.ownerName || "User"}
            </div>
            {card.location && (
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                {card.location}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 22,
          }}
        >
          <Button variant="secondary" onClick={onLater}>
            Later
          </Button>
          <Button onClick={onChat}>Chat</Button>
        </div>
      </div>
    </div>
  );
}
