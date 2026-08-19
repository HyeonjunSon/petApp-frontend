"use client";

import { Avatar, Icon } from "@/components/ui";
import { ImagePlaceholder } from "@/components/shell/Page";
import { type Card } from "@/lib/card";
import { SIZE_KO, TEMPER_KO, TagPill } from "./DiscoverCard";

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: "var(--radius-2xl)",
  boxShadow: "var(--shadow-card)",
  padding: 20,
};

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  border: "none",
  borderRadius: "var(--radius-md)",
  padding: "10px 16px",
  fontSize: "var(--fs-meta)",
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "opacity .15s",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

export default function DetailView({
  card,
  onBack,
  onLike,
  onNext,
}: {
  card: Card;
  onBack: () => void;
  onLike: () => void;
  onNext: () => void;
}) {
  const thumbs = card.photos.slice(1, 5);
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "var(--fs-h2)",
            fontWeight: 800,
            color: "var(--text)",
          }}
        >
          Profile Details
        </h2>
        <button
          type="button"
          onClick={onBack}
          style={{
            ...btnBase,
            background: "var(--input-bg)",
            color: "var(--text-secondary)",
            fontWeight: 600,
          }}
        >
          <Icon name="back" size={16} />
          Back to Discover
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
          gap: 20,
          alignItems: "start",
        }}
        className="pd-detail-grid"
      >
        <div>
          <ImagePlaceholder src={card.photos[0]} label="Main photo" height={380} />
          {thumbs.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                marginTop: 10,
              }}
            >
              {thumbs.map((p, i) => (
                <ImagePlaceholder key={i} src={p} height={84} radius={10} />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={cardStyle}>
            <h3
              style={{
                margin: 0,
                fontSize: "var(--fs-h3)",
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              {[card.petName, card.breed, card.age != null ? `${card.age} yrs` : ""]
                .filter(Boolean)
                .join(" · ") || "Name not shared"}
            </h3>
            {((card.temperament || []).length > 0 || card.size) && (
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {(card.temperament || []).map((t, i) => (
                  <TagPill key={i}>{TEMPER_KO[t] || t}</TagPill>
                ))}
                {card.size && <TagPill>{SIZE_KO[card.size] || card.size}</TagPill>}
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
                marginTop: 18,
              }}
            >
              <Stat
                label="Size"
                value={card.size ? SIZE_KO[card.size] || card.size : "—"}
              />
              <Stat label="Age" value={card.age != null ? `${card.age} yrs` : "—"} />
            </div>
            {card.petAbout && (
              <div style={{ marginTop: 18 }}>
                <div
                  style={{
                    fontSize: "var(--fs-caption)",
                    color: "var(--text-secondary)",
                  }}
                >
                  About
                </div>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "var(--fs-body-sm)",
                    lineHeight: 1.6,
                    color: "var(--text-secondary)",
                  }}
                >
                  {card.petAbout}
                </p>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: "var(--fs-body)",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Owner Info
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar src={card.ownerFace} fallbackText="Owner" size={44} />
              <div>
                <div
                  style={{
                    fontSize: "var(--fs-body)",
                    fontWeight: 600,
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
            {card.ownerAbout && (
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: "var(--fs-body-sm)",
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                }}
              >
                {card.ownerAbout}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 20,
        }}
      >
        <button
          type="button"
          onClick={onLike}
          style={{
            ...btnBase,
            background: "var(--primary)",
            color: "var(--white)",
          }}
        >
          <Icon name="heart" size={16} fill />
          Send Like
        </button>
        <button
          type="button"
          onClick={onNext}
          style={{
            ...btnBase,
            background: "var(--input-bg)",
            color: "var(--text-secondary)",
          }}
        >
          Next Card
        </button>
      </div>
    </div>
  );
}
