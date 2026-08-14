"use client";

/** Walk Records — Walk records + per-pet stats. */

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Spinner, EmptyState, Avatar } from "@/components/ui";

type Pet = { _id: string; name: string; breed?: string; age?: number };
type Walk = {
  _id: string;
  pet: string;
  distanceKm: number;
  durationMin: number;
  startedAt: string;
};

/* ── 시안 스타일 (petdate-website.html .walk-row / .pill / .stat) ── */
const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: "var(--radius-xl)",
  boxShadow: "var(--shadow-card)",
  overflow: "hidden",
};
const sectionTitleStyle: React.CSSProperties = {
  margin: "28px 0 12px",
  fontSize: "var(--fs-h3)",
  fontWeight: 800,
  color: "var(--text)",
};
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

/** 분 → "1시간 10분" */
function fmtDuration(min: number) {
  if (!min) return "0분";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

/** ISO → { day, month, time } (달력 타일 + 메타용) */
function dateParts(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: "-", month: "", time: "" };
  const h = d.getHours();
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 || 12;
  return {
    day: String(d.getDate()),
    month: `${d.getMonth() + 1}월`,
    time: `${ampm} ${h12}:${String(d.getMinutes()).padStart(2, "0")}`,
  };
}

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
      subtitle="완료한 산책이 자동으로 쌓여요."
      right={
        <button type="button" style={btnGhostSm} onClick={() => router.push("/walks")}>
          산책으로 돌아가기
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center pt-16" style={{ color: "var(--text-secondary)" }}><Spinner /></div>
      ) : walks.length === 0 ? (
        <EmptyState emoji="🐾" title="아직 산책 기록이 없어요" desc="산책 약속을 완료하면 기록이 자동으로 추가돼요." />
      ) : (
        <>
          <div style={{ ...sectionTitleStyle, marginTop: 0 }}>전체 기록</div>
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
            {sorted.map((w, idx) => {
              const dp = dateParts(w.startedAt);
              const meta = [
                dp.time,
                w.distanceKm ? `${w.distanceKm}km` : "",
                w.durationMin ? fmtDuration(w.durationMin) : "",
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <div
                  key={w._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 18px",
                    borderTop: idx > 0 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "var(--radius-lg)",
                      background: "var(--primary-10)",
                      color: "var(--primary)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <b style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>{dp.day}</b>
                    <span style={{ fontSize: "var(--fs-nano)", fontWeight: 700 }}>{dp.month}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b
                      style={{
                        display: "block",
                        fontSize: "var(--fs-body)",
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      {petName(w.pet)}의 산책
                    </b>
                    <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>
                      {meta}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "var(--fs-micro)",
                      fontWeight: 700,
                      borderRadius: "var(--radius-pill)",
                      padding: "4px 12px",
                      background: "var(--input-bg)",
                      color: "var(--text-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    완료
                  </span>
                </div>
              );
            })}
          </div>

          {stats.length > 0 && (
            <>
              <div style={sectionTitleStyle}>펫별 통계</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {stats.map((s) => (
                  <div
                    key={s.pet._id}
                    style={{
                      background: "var(--surface)",
                      borderRadius: "var(--radius-2xl)",
                      boxShadow: "var(--shadow-card)",
                      padding: 20,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <Avatar fallbackText={(s.pet.name || "?")[0]} size={44} />
                      <div>
                        <div style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--text)" }}>
                          {s.pet.name}
                        </div>
                        <div style={{ fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}>
                          {[s.pet.breed, s.pet.age != null ? `${s.pet.age}살` : ""].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </div>
                    <StatRow label="총 산책" value={`${s.count}회`} />
                    <StatRow label="총 거리" value={`${s.dist}km`} />
                    <StatRow label="평균 시간" value={fmtDuration(s.avg)} />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Page>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        fontSize: "var(--fs-body-sm)",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
