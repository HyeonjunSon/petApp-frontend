"use client";

import { Card as UICard, Chip, Avatar } from "@/components/ui";
import { ImagePlaceholder } from "@/components/shell/Page";
import { SIZE_LABEL, type Card } from "@/lib/card";

export default function DiscoverCard({
  card,
  onDetail,
}: {
  card: Card;
  onDetail: () => void;
}) {
  const ageText = card.age != null ? `${card.age}살` : "";
  const titleBits = [card.petName, card.breed, ageText].filter(Boolean);
  const chips = [
    ...(card.temperament || []),
    card.size ? SIZE_LABEL[card.size] || card.size : "",
  ].filter(Boolean);

  return (
    <UICard padded={false} style={{ overflow: "hidden" }}>
      <div style={{ position: "relative" }}>
        <ImagePlaceholder
          src={card.photos[0]}
          label="반려동물 사진"
          height={360}
          radius={0}
        />
        <button
          type="button"
          onClick={onDetail}
          style={{
            position: "absolute",
            right: 14,
            bottom: 14,
            border: "none",
            background: "rgba(255,255,255,.92)",
            color: "var(--ink)",
            borderRadius: 999,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "var(--sh-card)",
          }}
        >
          상세보기
        </button>
      </div>

      <div style={{ padding: 20 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 800,
            color: "var(--ink)",
          }}
        >
          {titleBits.join(" · ") || "반려동물"}
        </h2>

        {chips.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {chips.map((c, i) => (
              <Chip key={i}>{c}</Chip>
            ))}
          </div>
        )}

        {card.petAbout && (
          <p
            style={{
              margin: "14px 0 0",
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
            }}
          >
            {card.petAbout}
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
          }}
        >
          <Avatar
            src={card.ownerFace}
            fallbackText="보호"
            size={28}
            style={{ fontSize: 11 }}
          />
          <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            보호자 {card.ownerName || "—"}
            {card.location ? ` · ${card.location}` : ""}
          </span>
        </div>
      </div>
    </UICard>
  );
}
