"use client";

/** Walk Records — Walk records + per-pet stats. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWalksQuery, usePetsQuery } from "@/store/api";
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

/** minutes → "1h 10m" */
function fmtDuration(min: number) {
  if (!min) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** ISO → { day: "Aug 24", time: "6:30 PM" } */
function dateParts(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: "—", time: "" };
  const h = d.getHours();
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return {
    day: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
    time: `${h12}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`,
  };
}

export default function WalkRecordsPage() {
  const router = useRouter();
  /* RTK Query — /walks 목록 화면과 같은 쿼리라 캐시를 공유한다 */
  const range = useMemo(() => {
    const today = new Date();
    const from = new Date(today);
    from.setFullYear(from.getFullYear() - 1);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    return { from: iso(from), to: iso(today) };
  }, []);
  const { data: walks = [], isLoading: loading } = useWalksQuery(range);
  const { data: pets = [] } = usePetsQuery();

  const petName = (id: string) => pets.find((p) => p._id === id)?.name || "Pet";

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
      title="Records"
      subtitle="Completed walks are saved automatically."
      right={
        <button type="button" className="btn btn-ghost" onClick={() => router.push("/walks")}>
          Back to walks
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center pt-16" style={{ color: "var(--fence)" }}><Spinner /></div>
      ) : walks.length === 0 ? (
        <EmptyState emoji="🐾" title="No walk records yet" desc="Complete a walk plan and a record is added automatically." />
      ) : (
        <>
          <h2 style={{ fontSize: 18, margin: 0 }}>All records</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map((w) => {
              const dp = dateParts(w.startedAt);
              const meta = [
                dp.time,
                w.distanceKm ? `${w.distanceKm}km` : "",
                w.durationMin ? fmtDuration(w.durationMin) : "",
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <div key={w._id} className="walk-row">
                  <span className="walk-row-time">{dp.day}</span>
                  <span className="walk-row-info">
                    {`${petName(w.pet)}'s walk`}
                    <small>{meta}</small>
                  </span>
                  <span className="end">
                    <span className="pill">Completed</span>
                  </span>
                </div>
              );
            })}
          </div>

          {stats.length > 0 && (
            <>
              <h2 style={{ fontSize: 18, margin: "10px 0 0" }}>Stats by pet</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {stats.map((s) => (
                  <div key={s.pet._id} className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <Avatar fallbackText={(s.pet.name || "?")[0]} size={44} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                          {s.pet.name}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--fence)" }}>
                          {[s.pet.breed, s.pet.age != null ? `${s.pet.age} yrs` : ""].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </div>
                    <StatRow label="Total walks" value={`${s.count}`} />
                    <StatRow label="Total distance" value={`${s.dist}km`} />
                    <StatRow label="Avg time" value={fmtDuration(s.avg)} />
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
        fontSize: 15,
      }}
    >
      <span style={{ color: "var(--fence)" }}>{label}</span>
      <span style={{ color: "var(--ink)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
