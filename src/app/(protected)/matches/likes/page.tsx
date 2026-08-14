"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/components/shell/Page";

/* 시안 .match-card 문법: 흰 카드 radius 16, 사진 190px */
const btnGhostSm: React.CSSProperties = {
  background: "var(--input-bg)",
  color: "var(--text-secondary)",
  fontSize: "var(--fs-meta)",
  fontWeight: 600,
  borderRadius: "var(--radius-md)",
  padding: "10px 16px",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};
const btnPrimarySm: React.CSSProperties = {
  ...btnGhostSm,
  background: "var(--primary)",
  color: "var(--white)",
  fontWeight: 700,
};

export default function LikesMePage() {
  const router = useRouter();
  const locked = Array.from({ length: 6 });

  return (
    <Page
      title="좋아요"
      subtitle="나를 좋아요한 친구들을 확인해요."
      right={
        <button type="button" style={btnGhostSm} onClick={() => router.push("/matches")}>
          매치로 돌아가기
        </button>
      }
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-card)",
          padding: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
          프리미엄으로 업그레이드하면 나를 좋아요한 친구를 모두 볼 수 있어요.
        </div>
        <button type="button" style={btnPrimarySm} onClick={() => router.push("/subscription")}>
          전체 보기
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
          marginTop: 20,
        }}
      >
        {locked.map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-2xl)",
              boxShadow: "var(--shadow-card)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: 190,
                background: "var(--input-bg)",
                display: "grid",
                placeItems: "center",
                fontSize: 64,
                overflow: "hidden",
              }}
            >
              <span aria-hidden style={{ filter: "blur(8px)" }}>🐕</span>
            </div>
            <div style={{ padding: 16, flex: 1 }}>
              <div style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>
                🔒 프리미엄 전용
              </div>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "var(--fs-caption)",
                  color: "var(--text-secondary)",
                }}
              >
                구독하면 이 프로필을 볼 수 있어요.
              </p>
            </div>
            <div style={{ display: "flex", padding: "0 16px 16px" }}>
              <button
                type="button"
                onClick={() => router.push("/subscription")}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--fs-meta)",
                  fontWeight: 700,
                  background: "var(--primary)",
                  color: "var(--white)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                프리미엄 시작하기
              </button>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}
