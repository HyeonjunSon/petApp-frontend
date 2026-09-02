"use client";

/** Walk Plans — meetup (walk-invite) list. Completed plans auto-create records. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Leaflet은 window를 만지므로 SSR 제외
const WalkMap = dynamic(() => import("@/components/WalkMap"), { ssr: false });
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Spinner, EmptyState } from "@/components/ui";
import { type Match, type WalkInvite, peerOf, pickPet } from "../chat/types";

const STATUS: Record<string, string> = {
  proposed: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
};

type WalkRecord = {
  _id: string;
  pet: string;
  distanceKm: number;
  durationMin: number;
  startedAt: string;
};

/** "HH:MM" → "10:00 AM" */
function fmtTime(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(Number.isNaN(m) ? 0 : m).padStart(2, "0")} ${ampm}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "YYYY-MM-DD" → "Aug 11" */
function fmtDay(date?: string) {
  const d = String(date || "");
  const day = Number(d.slice(8, 10));
  const month = Number(d.slice(5, 7));
  if (Number.isNaN(day) || Number.isNaN(month)) return "—";
  return `${MONTHS[month - 1] || ""} ${day}`;
}

/** minutes → "6h 40m" */
function fmtDuration(min: number) {
  if (!min) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function WalksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const [invites, setInvites] = useState<WalkInvite[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [records, setRecords] = useState<WalkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  /** Accept a received pending invite (same logic as the detail page). */
  const accept = async (id: string) => {
    setBusyId(id);
    try {
      const { data } = await api.patch<WalkInvite>(`/walk-invites/${id}`, { status: "confirmed" });
      setInvites((prev) => prev.map((x) => (x._id === id ? data : x)));
    } catch {}
    setBusyId(null);
  };

  const peerName = (matchId: string) => {
    const m = matches.find((x) => x._id === matchId);
    const peer = m ? peerOf(m, myId) : undefined;
    const pet = pickPet(peer);
    return { owner: peer?.name || "Owner", pet: pet?.name || "Friend" };
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

  /* 산책 통계 — 세 값 모두 같은 기간(가져온 최근 1년 기록)으로 계산 */
  const stats = useMemo(() => {
    const dist = records.reduce((s, w) => s + (w.distanceKm || 0), 0);
    const mins = records.reduce((s, w) => s + (w.durationMin || 0), 0);
    return {
      count: `${records.length}`,
      dist: `${Math.round(dist * 10) / 10} km`,
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
    return i.place ? `Walk with ${n.pet} at ${i.place}` : `Walk with ${n.pet}`;
  };

  /** 우측 상태: confirmed/completed → .pill, 수신 pending → Accept 버튼, 그 외 .tag */
  const StatusEnd = ({ i }: { i: WalkInvite }) => {
    if (i.status === "confirmed" || i.status === "completed") {
      return <span className="pill">{STATUS[i.status]}</span>;
    }
    if (i.status === "proposed") {
      if (i.from !== myId) {
        return (
          <button
            type="button"
            className="btn btn-ball btn-sm"
            disabled={busyId === i._id}
            onClick={(e) => {
              e.stopPropagation();
              accept(i._id);
            }}
          >
            Accept
          </button>
        );
      }
      return <span className="tag">Pending</span>;
    }
    return <span className="tag">{STATUS[i.status] || i.status}</span>;
  };

  /** 스캐폴드 .walk-row: 좌측 큰 시간/날짜 + 제목/메타 + 우측 상태 */
  const Row = ({ i, timeLabel, meta }: { i: WalkInvite; timeLabel: string; meta: string }) => (
    <div
      className="walk-row"
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/walks/${i._id}`)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") router.push(`/walks/${i._id}`);
      }}
      style={{ cursor: "pointer" }}
    >
      <span className="walk-row-time">{timeLabel}</span>
      <span className="walk-row-info">
        {rowTitle(i)}
        <small>{meta}</small>
      </span>
      <span className="end">
        <StatusEnd i={i} />
      </span>
    </div>
  );

  return (
    <Page
      title="Walks"
      subtitle="Upcoming plans and past records."
      right={
        <>
          <button type="button" className="btn btn-ghost" onClick={() => router.push("/walks/records")}>
            Records
          </button>
          <button type="button" className="btn btn-ball" onClick={() => router.push("/walks/new")}>
            Plan a walk
          </button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center pt-16" style={{ color: "var(--fence)" }}>
          <Spinner />
        </div>
      ) : invites.length === 0 ? (
        <EmptyState
          emoji="🐕"
          title="No walk plans yet"
          desc="Make your first walk plan with a matched friend."
          action={
            <button type="button" className="btn btn-ball" onClick={() => router.push("/walks/new")}>
              Plan a walk
            </button>
          }
        />
      ) : (
        <>
          {/* 이번 달 통계 — 한 장의 카드 + display 큰 숫자 */}
          <div
            className="card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span>This month</span>
            <span className="display" style={{ fontSize: 28 }}>
              {stats.count} walks · {stats.dist} · {stats.time}
            </span>
          </div>

          {/* 지도 — 만날 장소가 지정된 다가오는 약속 핀 */}
          {(() => {
            const pins = upcoming
              .filter((i) => Array.isArray(i.meetPoint?.coordinates))
              .map((i) => ({
                id: i._id,
                lat: i.meetPoint!.coordinates[1],
                lng: i.meetPoint!.coordinates[0],
                label: `${fmtTime(i.time)} · ${i.place || peerName(i.match).pet}`,
              }));
            return pins.length > 0 ? (
              <WalkMap pins={pins} height={240} onPinClick={(id) => router.push(`/walks/${id}`)} />
            ) : null;
          })()}

          {/* 다가오는 약속 */}
          <h2 style={{ fontSize: 18, margin: "10px 0 0" }}>Upcoming</h2>
          {upcoming.length === 0 ? (
            <div className="card">
              <p style={{ margin: 0, fontSize: 15, color: "var(--fence)" }}>No upcoming plans.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map((i) => {
                const n = peerName(i.match);
                const meta = [fmtDay(i.date), i.place || `with ${n.owner}`].filter(Boolean).join(" · ");
                return <Row key={i._id} i={i} timeLabel={fmtTime(i.time) || "—"} meta={meta} />;
              })}
            </div>
          )}

          {/* 지난 산책 */}
          {past.length > 0 && (
            <>
              <h2 style={{ fontSize: 18, margin: "10px 0 0" }}>Past walks</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {past.slice(0, 5).map((i) => {
                  const n = peerName(i.match);
                  const rec = recordByDate.get(i.date);
                  const meta = rec
                    ? [
                        rec.distanceKm ? `${rec.distanceKm}km` : "",
                        rec.durationMin ? fmtDuration(rec.durationMin) : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : [fmtTime(i.time), i.place || `with ${n.owner}`].filter(Boolean).join(" · ");
                  return <Row key={i._id} i={i} timeLabel={fmtDay(i.date)} meta={meta} />;
                })}
              </div>
            </>
          )}
        </>
      )}
    </Page>
  );
}
