"use client";

import { useRouter } from "next/navigation";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import { Card as UICard, Button } from "@/components/ui";

export default function LikesMePage() {
  const router = useRouter();
  const locked = Array.from({ length: 6 });

  return (
    <Page
      title="People who liked you"
      right={
        <Button variant="ghost" onClick={() => router.push("/matches")}>
          Back to Matches
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
            Upgrade to Premium to see everyone who liked you.
          </div>
          <Button onClick={() => router.push("/subscription")}>Reveal all</Button>
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
                <ImagePlaceholder label="Pet photo" height={180} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                🔒 Premium only
              </div>
              <p style={{ margin: "6px 0 14px", fontSize: 13, color: "var(--ink-soft)" }}>
                Subscribe to view this profile
              </p>
              <Button fullWidth onClick={() => router.push("/subscription")}>
                Get Premium
              </Button>
            </div>
          </UICard>
        ))}
      </div>
    </Page>
  );
}
