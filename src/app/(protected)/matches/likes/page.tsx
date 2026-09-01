"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/components/shell/Page";

export default function LikesMePage() {
  const router = useRouter();
  const locked = Array.from({ length: 6 });

  return (
    <Page
      title="Likes you"
      subtitle="See the friends who liked you."
      right={
        <button type="button" className="btn btn-ghost" onClick={() => router.push("/matches")}>
          Back to matches
        </button>
      }
    >
      {/* 프리미엄 잠금 배너 */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 15, color: "var(--fence)" }}>
          Upgrade to Premium to see everyone who liked you.
        </span>
        <button type="button" className="btn btn-ball" onClick={() => router.push("/subscription")}>
          See all
        </button>
      </div>

      <div className="pack-grid">
        {locked.map((_, i) => (
          <div key={i} className="dog-card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="dog-photo" style={{ display: "grid", placeItems: "center", fontSize: 56 }}>
              <span aria-hidden style={{ filter: "blur(8px)" }}>🐕</span>
            </div>
            <div className="dog-info" style={{ flex: 1 }}>
              <div className="dog-name">🔒 Premium only</div>
              <p className="dog-breed" style={{ margin: "3px 0 0" }}>
                Subscribe to see this profile.
              </p>
            </div>
            <div className="dog-acts">
              <button
                type="button"
                className="btn btn-ball btn-sm"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => router.push("/subscription")}
              >
                Start Premium
              </button>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}
