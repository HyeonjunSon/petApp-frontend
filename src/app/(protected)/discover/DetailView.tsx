"use client";

import { Card as UICard, Chip, Avatar, Button } from "@/components/ui";
import { ImagePlaceholder } from "@/components/shell/Page";
import { SIZE_LABEL, type Card } from "@/lib/card";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{label}</div>
      <div style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{value}</div>
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
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>
          Profile details
        </h2>
        <Button size="sm" variant="secondary" onClick={onBack}>
          Back to Discover
        </Button>
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
          <ImagePlaceholder
            src={card.photos[0]}
            label="Main pet photo"
            height={380}
          />
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
          <UICard>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>
              {[card.petName, card.breed, card.age != null ? `${card.age} yrs` : ""]
                .filter(Boolean)
                .join(" · ") || "Pet"}
            </h3>
            {(card.temperament || []).length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {card.temperament!.map((t, i) => (
                  <Chip key={i}>{t}</Chip>
                ))}
                {card.size && <Chip>{SIZE_LABEL[card.size] || card.size}</Chip>}
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
              <Stat label="Size" value={card.size ? SIZE_LABEL[card.size] || card.size : "—"} />
              <Stat label="Age" value={card.age != null ? `${card.age} yrs` : "—"} />
            </div>
            {card.petAbout && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>About</div>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "var(--ink-soft)",
                  }}
                >
                  {card.petAbout}
                </p>
              </div>
            )}
          </UICard>

          <UICard>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
              Owner info
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar src={card.ownerFace} fallbackText="Owner" size={44} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                  {card.ownerName || "Owner"}
                </div>
                {card.location && (
                  <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                    {card.location}
                  </div>
                )}
              </div>
            </div>
            {card.ownerAbout && (
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--ink-soft)",
                }}
              >
                {card.ownerAbout}
              </p>
            )}
          </UICard>
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
        <Button onClick={onLike} icon="heart">
          Send Like
        </Button>
        <Button variant="secondary" onClick={onNext}>
          Next card
        </Button>
      </div>
    </div>
  );
}
