"use client";

import { Card as UICard, Button } from "@/components/ui";

const BENEFITS = [
  { title: "무제한 스와이프", desc: "하루 종일 제한 없이 반려동물을 발견하세요" },
  { title: "프리미엄 필터", desc: "나이, 크기, 산책 스타일로 정확하게 검색" },
  { title: "우선 매칭", desc: "내 반려동물과 잘 맞는 상대를 먼저 만나기" },
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
              오늘의 스와이프 한도
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 14 }}>
              사용한 스와이프
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
            내일 자정에 초기화됩니다
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
        프리미엄으로 업그레이드하세요
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
          나중에
        </Button>
        <Button onClick={onUpgrade}>프리미엄 구독</Button>
      </div>
    </div>
  );
}
