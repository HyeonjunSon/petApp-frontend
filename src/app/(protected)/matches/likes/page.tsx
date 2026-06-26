"use client";

import { useRouter } from "next/navigation";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import { Card as UICard, Button } from "@/components/ui";

export default function LikesMePage() {
  const router = useRouter();
  const locked = Array.from({ length: 6 });

  return (
    <Page
      title="나를 좋아요한 사람"
      right={
        <Button variant="ghost" onClick={() => router.push("/matches")}>
          매칭 목록으로
        </Button>
      }
    >
      <UICard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            프리미엄으로 업그레이드하면 나를 좋아요한 사람을 모두 확인할 수 있어요.
          </div>
          <Button onClick={() => router.push("/subscription")}>전체 공개하기</Button>
        </div>
      </UICard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          marginTop: 20,
        }}
      >
        {locked.map((_, i) => (
          <UICard key={i}>
            <div style={{ position: "relative" }}>
              <div style={{ filter: "blur(8px)", pointerEvents: "none" }}>
                <ImagePlaceholder label="반려동물 사진" height={180} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                🔒 프리미엄 전용
              </div>
              <p style={{ margin: "6px 0 14px", fontSize: 13, color: "var(--ink-soft)" }}>
                구독하면 이 프로필을 확인할 수 있어요
              </p>
              <Button fullWidth onClick={() => router.push("/subscription")}>
                프리미엄 구독하기
              </Button>
            </div>
          </UICard>
        ))}
      </div>
    </Page>
  );
}
