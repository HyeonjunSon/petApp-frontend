"use client";

/** 산책 기록 — Walk records + per-pet stats. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import { Card as UICard, Button, Spinner, EmptyState, Avatar } from "@/components/ui";

type Pet = { _id: string; name: string; breed?: string; age?: number };
type Walk = {
  _id: string;
  pet: string;
  distanceKm: number;
  durationMin: number;
  startedAt: string;
};

export default function WalkRecordsPage() {
  const router = useRouter();
  const [walks, setWalks] = useState<Walk[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const from = new Date(today);
    from.setFullYear(from.getFullYear() - 1);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    Promise.allSettled([
      api.get<Walk[]>("/walks", { params: { from: iso(from), to: iso(today) } }),
      api.get<Pet[]>("/pets"),
    ]).then(([wk, pt]) => {
      if (wk.status === "fulfilled") setWalks(wk.value.data || []);
      if (pt.status === "fulfilled") setPets(pt.value.data || []);
      setLoading(false);
    });
  }, []);

  const petName = (id: string) => pets.find((p) => p._id === id)?.name || "반려동물";

  const stats = useMemo(() => {
    return pets
      .map((p) => {
        const list = walks.filter((w) => w.pet === p._id);
        const count = list.length;
        const dist = list.reduce((s, w) => s + (w.distanceKm || 0), 0);
        const avg = count ? Math.round(list.reduce((s, w) => s + (w.durationMin || 0), 0) / count) : 0;
        return { pet: p, count, dist: Math.round(dist * 10) / 10, avg };
      })
      .filter((s) => s.count > 0);
  }, [pets, walks]);

  const sorted = useMemo(
    () => walks.slice().sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
    [walks]
  );

  return (
    <Page
      title="산책 기록"
      right={<Button variant="ghost" onClick={() => router.push("/walks")}>산책 약속으로</Button>}
    >
      {loading ? (
        <div className="flex justify-center pt-16" style={{ color: "var(--ink-soft)" }}><Spinner /></div>
      ) : walks.length === 0 ? (
        <EmptyState emoji="🐾" title="산책 기록이 없어요" desc="산책 약속을 완료하면 기록이 쌓여요." />
      ) : (
        <>
          <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>전체 기록</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sorted.map((w) => (
              <div
                key={w._id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  border: "1px solid var(--border)", borderRadius: "var(--r-card)",
                  background: "var(--bg)", padding: 14,
                }}
              >
                <div style={{ width: 140, flexShrink: 0 }}>
                  <ImagePlaceholder label="강아지 사진" height={72} radius={10} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                    {petName(w.pet)}와의 산책
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                    {new Date(w.startedAt).toLocaleString("ko-KR", { dateStyle: "long", timeStyle: "short" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 28 }}>
                  <Metric label="거리" value={`${w.distanceKm} km`} />
                  <Metric label="소요 시간" value={`${w.durationMin}분`} />
                </div>
              </div>
            ))}
          </div>

          {stats.length > 0 && (
            <>
              <h2 style={{ margin: "32px 0 14px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
                반려견별 통계
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {stats.map((s) => (
                  <UICard key={s.pet._id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <Avatar fallbackText={(s.pet.name || "?")[0]} size={44} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{s.pet.name}</div>
                        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                          {[s.pet.breed, s.pet.age != null ? `${s.pet.age}세` : ""].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </div>
                    <StatRow label="총 산책 횟수" value={`${s.count}회`} />
                    <StatRow label="누적 거리" value={`${s.dist} km`} />
                    <StatRow label="평균 소요 시간" value={`${s.avg}분`} />
                  </UICard>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Page>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginTop: 4 }}>{value}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14 }}>
      <span style={{ color: "var(--ink-soft)" }}>{label}</span>
      <span style={{ color: "var(--ink)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
