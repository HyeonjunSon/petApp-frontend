"use client";

const BENEFITS = [
  { title: "무제한 스와이프", desc: "하루 종일 제한 없이 친구들을 만나요" },
  { title: "프리미엄 필터", desc: "나이·크기·산책 스타일로 정밀하게 검색해요" },
  { title: "우선 매칭", desc: "우리 펫과 잘 맞는 친구를 먼저 만나요" },
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
              오늘의 스와이프 제한
            </div>
            <div
              style={{
                fontSize: "var(--fs-meta)",
                color: "var(--text-secondary)",
                marginTop: 14,
              }}
            >
              사용한 스와이프
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
            자정에 초기화돼요
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
        프리미엄으로 업그레이드
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
          나중에
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
          프리미엄 시작하기
        </button>
      </div>
    </div>
  );
}
