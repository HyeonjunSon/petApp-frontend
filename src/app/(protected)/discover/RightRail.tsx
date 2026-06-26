"use client";

import { Card as UICard, Chip, Avatar, Button } from "@/components/ui";
import { SIZE_LABEL, type Card } from "@/lib/card";

export default function RightRail({
  upcoming,
  onPremium,
}: {
  upcoming: Card[];
  onPremium: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <UICard>
        <h3
          style={{
            margin: "0 0 14px",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          다음 추천 펫
        </h3>
        {upcoming.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)" }}>
            추천할 펫이 더 없어요.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcoming.map((c) => {
              const chips = [
                ...(c.temperament || []).slice(0, 1),
                c.size ? SIZE_LABEL[c.size] || c.size : "",
              ].filter(Boolean);
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Avatar src={c.photos[0]} fallbackText="펫" size={44} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      {[c.petName, c.breed, c.age != null ? `${c.age}살` : ""]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      {chips.map((x, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--ink-soft)",
                            background: "var(--surface-2)",
                            borderRadius: 999,
                            padding: "2px 8px",
                          }}
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </UICard>

      <UICard>
        <h3
          style={{
            margin: "0 0 6px",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--ink)",
          }}
        >
          💎 프리미엄으로 더 많은 만남을
        </h3>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--ink-soft)" }}>
          무제한 스와이프 · 슈퍼 좋아요 · 부스트 3회 포함
        </p>
        <Button fullWidth onClick={onPremium}>
          프리미엄 시작하기
        </Button>
      </UICard>
    </div>
  );
}
