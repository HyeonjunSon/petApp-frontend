"use client";

import { Avatar } from "@/components/ui";
import { ImagePlaceholder } from "@/components/shell/Page";
import { type Card } from "@/lib/card";
import { TagPill } from "./DiscoverCard";

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "11px 18px",
  fontSize: "var(--fs-meta)",
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "opacity .15s",
};

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
          background: "var(--surface)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-card-strong)",
          padding: 28,
          animation: "pd-pop .25s ease",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "var(--fs-h1)",
            fontWeight: 800,
            color: "var(--text)",
          }}
        >
          It's a match! 🎉
        </h2>
        <p
          style={{
            margin: "8px 0 18px",
            fontSize: "var(--fs-body)",
            color: "var(--text-secondary)",
          }}
        >
          You liked each other.
        </p>

        <div
          style={{
            background: "var(--input-bg)",
            borderRadius: "var(--radius-xl)",
            padding: 14,
          }}
        >
          <ImagePlaceholder src={card.photos[0]} label="Pet photo" height={200} radius={10} />
          <div style={{ marginTop: 12 }}>
            <span
              style={{
                fontSize: "var(--fs-h3)",
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              {card.petName || "Friend"}
            </span>
            <span
              style={{
                fontSize: "var(--fs-body-sm)",
                color: "var(--text-secondary)",
                marginLeft: 8,
              }}
            >
              {[card.breed, card.age != null ? `${card.age} yrs` : ""]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
          {(card.temperament || []).length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {card.temperament!.slice(0, 3).map((t, i) => (
                <TagPill key={i}>{t}</TagPill>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={card.ownerFace} fallbackText="Owner" size={40} />
          <div>
            <div
              style={{
                fontSize: "var(--fs-body-sm)",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              {card.ownerName || "Owner"}
            </div>
            {card.location && (
              <div
                style={{
                  fontSize: "var(--fs-meta)",
                  color: "var(--text-secondary)",
                }}
              >
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
            onClick={onChat}
            style={{
              ...btnBase,
              background: "var(--primary)",
              color: "var(--white)",
            }}
          >
            Start chatting
          </button>
        </div>
      </div>
    </div>
  );
}
