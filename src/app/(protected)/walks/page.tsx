"use client";

/** Walk Plans — meetup (walk-invite) list. Completed plans auto-create records. */

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Spinner, EmptyState } from "@/components/ui";
import { type Match, type WalkInvite, peerOf, pickPet } from "../chat/types";

const STATUS: Record<string, string> = {
  proposed: "수락 대기 중",
  confirmed: "확정",
  declined: "거절됨",
  cancelled: "취소됨",
  completed: "완료",
};

type WalkRecord = {
  _id: string;
  pet: string;
  distanceKm: number;
  durationMin: number;
  startedAt: string;
};

/* ── 시안 스타일 (petdate-website.html #page-walks) ── */
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
const btnPrimarySm: React.CSSProperties = {
  background: "var(--primary)",
  color: "var(--white)",
  fontSize: "var(--fs-meta)",
  fontWeight: 700,
  borderRadius: "var(--radius-md)",
  padding: "10px 16px",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};
const btnGhostSm: React.CSSProperties = {
  ...btnPrimarySm,
  background: "var(--input-bg)",
  color: "var(--text-secondary)",
  fontWeight: 600,
};

const PILL_TONES: Record<string, { bg: string; fg: string }> = {
  proposed: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  confirmed: { bg: "var(--success-soft)", fg: "var(--success)" },
  completed: { bg: "var(--input-bg)", fg: "var(--text-secondary)" },
  declined: { bg: "var(--input-bg)", fg: "var(--text-secondary)" },
  cancelled: { bg: "var(--input-bg)", fg: "var(--text-secondary)" },
};

function Pill({ status }: { status: string }) {
  const t = PILL_TONES[status] || PILL_TONES.completed;
  return (
    <span
      style={{
        fontSize: "var(--fs-micro)",
        fontWeight: 700,
        borderRadius: "var(--radius-pill)",
        padding: "4px 12px",
        background: t.bg,
        color: t.fg,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {STATUS[status] || status}
    </span>
  );
}

/** "HH:MM" → "오전 10:00" */
function fmtTime(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 || 12;
  return `${ampm} ${h12}:${String(Number.isNaN(m) ? 0 : m).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" → { day: "11", month: "8월" } */
function calParts(date?: string) {
  const d = String(date || "");
  const day = Number(d.slice(8, 10));
  const month = Number(d.slice(5, 7));
  return {
    day: Number.isNaN(day) ? "-" : String(day),
    month: Number.isNaN(month) ? "" : `${month}월`,
  };
}

/** 분 → "6시간 40분" */
function fmtDuration(min: number) {
  if (!min) return "0분";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

export default function WalksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const [invites, setInvites] = useState<WalkInvite[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [records, setRecords] = useState<WalkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const from = new Date(today);
    from.setFullYear(from.getFullYear() - 1);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    Promise.allSettled([
      api.get<WalkInvite[]>("/walk-invites"),
      api.get<Match[]>("/matches"),
      api.get<WalkRecord[]>("/walks", { params: { from: iso(from), to: iso(today) } }),
    ]).then(([inv, mt, wk]) => {
      if (inv.status === "fulfilled") setInvites(inv.value.data || []);
      if (mt.status === "fulfilled") setMatches(mt.value.data || []);
      if (wk.status === "fulfilled") setRecords(wk.value.data || []);
      setLoading(false);
    });
  }, []);

  const peerName = (matchId: string) => {
    const m = matches.find((x) => x._id === matchId);
    const peer = m ? peerOf(m, myId) : undefined;
    const pet = pickPet(peer);
    return { owner: peer?.name || "보호자", pet: pet?.name || "친구" };
  };

  const upcoming = useMemo(
    () =>
      invites
        .filter((i) => i.status === "proposed" || i.status === "confirmed")
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .slice(0, 4),
    [invites]
  );

  const past = useMemo(
    () =>
      invites
        .filter((i) => i.status === "completed")
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    [invites]
  );

  /* 이번 달 산책 / 총 거리 / 총 시간 (산책 기록 기준) */
  const stats = useMemo(() => {
    const now = new Date();
    const monthCount = records.filter((w) => {
      const d = new Date(w.startedAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const dist = records.reduce((s, w) => s + (w.distanceKm || 0), 0);
    const mins = records.reduce((s, w) => s + (w.durationMin || 0), 0);
    return {
      count: `${monthCount}회`,
      dist: `${Math.round(dist * 10) / 10}km`,
      time: fmtDuration(mins),
    };
  }, [records]);

  /* 지난 산책 행 메타용: 날짜가 같은 산책 기록을 찾아 거리·시간을 붙인다 */
  const recordByDate = useMemo(() => {
    const map = new Map<string, WalkRecord>();
    records.forEach((w) => {
      const key = String(w.startedAt || "").slice(0, 10);
      if (key && !map.has(key)) map.set(key, w);
    });
    return map;
  }, [records]);

  const rowTitle = (i: WalkInvite) => {
    const n = peerName(i.match);
    return i.place ? `${n.pet}네와 ${i.place} 산책` : `${n.pet}네와 산책`;
  };

  const Row = ({ i, metaOverride }: { i: WalkInvite; metaOverride?: string }) => {
    const n = peerName(i.match);
    const cal = calParts(i.date);
    const meta =
      metaOverride ||
      [fmtTime(i.time), i.place || `${n.owner} 보호자`].filter(Boolean).join(" · ");
    return (
      <button
        type="button"
        onClick={() => router.push(`/walks/${i._id}`)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 18px",
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
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
          <b style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>{cal.day}</b>
          <span style={{ fontSize: "var(--fs-nano)", fontWeight: 700 }}>{cal.month}</span>
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
            {rowTitle(i)}
          </b>
          <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>
            {meta}
          </span>
        </div>
        <Pill status={i.status} />
      </button>
    );
  };

  const RowList = ({ children }: { children: React.ReactNode }) => (
    <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
      {React.Children.map(children, (child, idx) => (
        <div style={idx > 0 ? { borderTop: "1px solid var(--border)" } : undefined}>{child}</div>
      ))}
    </div>
  );

  return (
    <Page
      title="산책"
      subtitle="다가오는 약속과 지난 기록을 확인해요."
      right={
        <>
          <button type="button" style={btnGhostSm} onClick={() => router.push("/walks/records")}>
            산책 기록
          </button>
          <button type="button" style={btnPrimarySm} onClick={() => router.push("/walks/new")}>
            + 약속 만들기
          </button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center pt-16" style={{ color: "var(--text-secondary)" }}>
          <Spinner />
        </div>
      ) : invites.length === 0 ? (
        <EmptyState
          emoji="🐕"
          title="아직 산책 약속이 없어요"
          desc="매치된 친구와 첫 산책 약속을 만들어 보세요."
          action={
            <button type="button" style={btnPrimarySm} onClick={() => router.push("/walks/new")}>
              + 약속 만들기
            </button>
          }
        />
      ) : (
        <>
          {/* 통계 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              marginBottom: 8,
            }}
          >
            {[
              { v: stats.count, l: "이번 달 산책" },
              { v: stats.dist, l: "총 거리" },
              { v: stats.time, l: "총 시간" },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--radius-2xl)",
                  boxShadow: "var(--shadow-card)",
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--primary)" }}>{s.v}</div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: "var(--fs-caption)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          {/* 다가오는 약속 */}
          <div style={sectionTitleStyle}>다가오는 약속</div>
          {upcoming.length === 0 ? (
            <div style={{ ...cardStyle, padding: "16px 18px" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--fs-body-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                다가오는 약속이 없어요.
              </p>
            </div>
          ) : (
            <RowList>
              {upcoming.map((i) => (
                <Row key={i._id} i={i} />
              ))}
            </RowList>
          )}

          {/* 지난 산책 */}
          {past.length > 0 && (
            <>
              <div style={sectionTitleStyle}>지난 산책</div>
              <RowList>
                {past.slice(0, 5).map((i) => {
                  const rec = recordByDate.get(i.date);
                  const meta = rec
                    ? [
                        rec.distanceKm ? `${rec.distanceKm}km` : "",
                        rec.durationMin ? fmtDuration(rec.durationMin) : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : undefined;
                  return <Row key={i._id} i={i} metaOverride={meta} />;
                })}
              </RowList>
            </>
          )}

        </>
      )}
    </Page>
  );
}
