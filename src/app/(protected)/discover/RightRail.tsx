"use client";

import { Avatar } from "@/components/ui";
import { type Card } from "@/lib/card";
import { SIZE_KO, TagPill } from "./DiscoverCard";

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: "var(--radius-2xl)",
  boxShadow: "var(--shadow-card)",
  padding: 20,
};

export default function RightRail({
  upcoming,
  onPremium,
}: {
  upcoming: Card[];
  onPremium: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={cardStyle}>
        <h3
          style={{
            margin: "0 0 14px",
            fontSize: "var(--fs-body)",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          다음 친구들
        </h3>
        {upcoming.length === 0 ? (
          <p
            style={{
              margin: 0,
              fontSize: "var(--fs-meta)",
              color: "var(--text-secondary)",
            }}
          >
            추천할 친구가 더 없어요.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map((c) => {
              const tags = [
                ...(c.temperament || []).slice(0, 1),
                c.size ? SIZE_KO[c.size] || c.size : "",
              ].filter(Boolean);
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    background: "var(--input-bg)",
                    borderRadius: "var(--radius-lg)",
                    padding: 12,
                  }}
                >
                  <Avatar src={c.photos[0]} fallbackText="펫" size={44} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: "var(--fs-meta)",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {[c.petName, c.breed, c.age != null ? `${c.age}살` : ""]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    {tags.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginTop: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        {tags.map((x, i) => (
                          <TagPill key={i}>{x}</TagPill>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h3
          style={{
            margin: "0 0 6px",
            fontSize: "var(--fs-body)",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          💎 프리미엄으로 더 만나요
        </h3>
        <p
          style={{
            margin: "0 0 14px",
            fontSize: "var(--fs-meta)",
            color: "var(--text-secondary)",
          }}
        >
          무제한 스와이프 · 슈퍼 좋아요 · 부스트 3회
        </p>
        <button
          type="button"
          onClick={onPremium}
          style={{
            width: "100%",
            height: 40,
            border: "none",
            borderRadius: "var(--radius-md)",
            background: "var(--primary)",
            color: "var(--white)",
            fontSize: "var(--fs-meta)",
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            transition: "opacity .15s",
          }}
        >
          프리미엄 시작하기
        </button>
      </div>
    </div>
  );
}
