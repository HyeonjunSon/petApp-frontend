"use client";

import { Icon } from "@/components/ui";
import { type Card } from "@/lib/card";

/** 한국어 크기 라벨 (시안: 소형견/대형견 태그) */
export const SIZE_KO: Record<string, string> = {
  s: "Small dog",
  m: "Medium",
  l: "Large dog",
};

/** 성격 값은 영문으로 저장됨(필터 호환) — 표기만 한국어로 */
export const TEMPER_KO: Record<string, string> = {
  Energetic: "Energetic",
  Friendly: "Friendly",
  Gentle: "Gentle",
  Shy: "Shy",
  Independent: "Independent",
  Calm: "Calm",
  Playful: "Playful",
};

/** 시안 .tag — primary-10 배경 + primary 글자 pill */
export function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "var(--primary-10)",
        color: "var(--primary)",
        borderRadius: "var(--radius-pill)",
        padding: "3px 10px",
        fontSize: "var(--fs-micro)",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const actBtnBase: React.CSSProperties = {
  flex: 1,
  height: 40,
  border: "none",
  borderRadius: "var(--radius-md)",
  fontSize: "var(--fs-meta)",
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  transition: "opacity .15s",
};

export default function DiscoverCard({
  card,
  acting,
  onDetail,
  onPass,
  onLike,
}: {
  card: Card;
  acting?: boolean;
  onDetail: () => void;
  onPass?: () => void;
  onLike?: () => void;
}) {
  const nameLine =
    [card.petName, card.age != null ? `${card.age} yrs` : ""]
      .filter(Boolean)
      .join(" · ") ||
    card.ownerName ||
    "New friend";
  const metaLine = [
    card.breed,
    card.ownerName ? `Owner ${card.ownerName}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const tags = [
    ...(card.temperament || []).map((t) => TEMPER_KO[t] || t),
    card.size ? SIZE_KO[card.size] || card.size : "",
  ].filter(Boolean);

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-2xl)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 사진 영역 (탭하면 상세 보기) */}
      <button
        type="button"
        onClick={onDetail}
        aria-label="View profile details"
        style={{
          position: "relative",
          height: 190,
          background: "var(--input-bg)",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "block",
          width: "100%",
        }}
      >
        {card.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.photos[0]}
            alt={card.petName || "Pet photo"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fb === "1") return;
              img.dataset.fb = "1";
              img.src = "/img/pet-placeholder.svg";
            }}
          />
        ) : (
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              fontSize: 64,
            }}
            aria-hidden
          >
            🐾
          </span>
        )}
        {card.location && (
          <span
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              background: "rgba(0,0,0,.45)",
              color: "var(--white)",
              fontSize: "var(--fs-micro)",
              fontWeight: 600,
              borderRadius: "var(--radius-pill)",
              padding: "3px 10px",
            }}
          >
            {card.location}
          </span>
        )}
        <span
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            background: "rgba(0,0,0,.45)",
            color: "var(--white)",
            fontSize: "var(--fs-micro)",
            fontWeight: 600,
            borderRadius: "var(--radius-pill)",
            padding: "3px 10px",
          }}
        >
          Details
        </span>
      </button>

      {/* 본문 */}
      <div style={{ padding: 16, flex: 1 }}>
        <div
          style={{
            fontSize: "var(--fs-body)",
            fontWeight: 800,
            color: "var(--text)",
          }}
        >
          {nameLine}
        </div>
        {metaLine && (
          <div
            style={{
              marginTop: 3,
              fontSize: "var(--fs-caption)",
              color: "var(--text-secondary)",
            }}
          >
            {metaLine}
          </div>
        )}
        {tags.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tags.map((t, i) => (
              <TagPill key={i}>{t}</TagPill>
            ))}
          </div>
        )}
      </div>

      {/* 액션 */}
      {(onPass || onLike) && (
        <div style={{ display: "flex", gap: 10, padding: "0 16px 16px" }}>
          {onPass && (
            <button
              type="button"
              disabled={acting}
              onClick={onPass}
              style={{
                ...actBtnBase,
                background: "var(--input-bg)",
                color: "var(--text-secondary)",
                opacity: acting ? 0.55 : 1,
              }}
            >
              <Icon name="close" size={16} />
              Pass
            </button>
          )}
          {onLike && (
            <button
              type="button"
              disabled={acting}
              onClick={onLike}
              style={{
                ...actBtnBase,
                background: "var(--primary)",
                color: "var(--white)",
                opacity: acting ? 0.55 : 1,
              }}
            >
              <Icon name="heart" size={16} fill />
              Like
            </button>
          )}
        </div>
      )}
    </div>
  );
}
