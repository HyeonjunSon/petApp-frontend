"use client";

/** 산책 약속 — meetup (walk-invite) list. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Card as UICard, Button, Select, Badge, Spinner, EmptyState } from "@/components/ui";
import { type Match, type WalkInvite, peerOf, pickPet } from "../chat/types";

const STATUS: Record<string, string> = {
  proposed: "대기 중",
  confirmed: "수락됨",
  declined: "거절됨",
  cancelled: "취소됨",
};

type WalkRec = {
  _id: string;
  pet: string;
  distanceKm: number;
  durationMin: number;
  startedAt: string;
};

export default function WalksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const [invites, setInvites] = useState<WalkInvite[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [walks, setWalks] = useState<WalkRec[]>([]);
  const [pets, setPets] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("date");

  useEffect(() => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 90);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    Promise.allSettled([
      api.get<WalkInvite[]>("/walk-invites"),
      api.get<Match[]>("/matches"),
      api.get<WalkRec[]>("/walks", { params: { from: iso(from), to: iso(today) } }),
      api.get<{ _id: string; name: string }[]>("/pets"),
    ]).then(([inv, mt, wk, pt]) => {
      if (inv.status === "fulfilled") setInvites(inv.value.data || []);
      if (mt.status === "fulfilled") setMatches(mt.value.data || []);
      if (wk.status === "fulfilled") setWalks(wk.value.data || []);
      if (pt.status === "fulfilled") setPets(pt.value.data || []);
      setLoading(false);
    });
  }, []);

  const peerName = (matchId: string) => {
    const m = matches.find((x) => x._id === matchId);
    const peer = m ? peerOf(m, myId) : undefined;
    const pet = pickPet(peer);
    return { owner: peer?.name || "상대", pet: pet?.name || "반려동물" };
  };
  const petName = (id: string) => pets.find((p) => p._id === id)?.name || "반려동물";

  const upcoming = useMemo(
    () =>
      invites
        .filter((i) => i.status === "proposed" || i.status === "confirmed")
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .slice(0, 4),
    [invites]
  );

  const listRows = useMemo(() => {
    let l = invites.slice();
    if (status !== "all") l = l.filter((i) => i.status === status);
    if (sort === "date") l.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    return l;
  }, [invites, status, sort]);

  return (
    <Page
      title="산책 약속"
      right={
        <>
          <Button variant="ghost" onClick={() => router.push("/walks/records")}>
            산책 기록 보기
          </Button>
          <Button onClick={() => router.push("/walks/new")}>새 약속 만들기</Button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center pt-16" style={{ color: "var(--ink-soft)" }}>
          <Spinner />
        </div>
      ) : (
        <>
          {/* 다가오는 약속 */}
          <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
            다가오는 약속
          </h2>
          {upcoming.length === 0 ? (
            <UICard>
              <p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>
                예정된 산책 약속이 없어요.
              </p>
            </UICard>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {upcoming.map((i) => {
                const n = peerName(i.match);
                return (
                  <UICard key={i._id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 52, height: 52, borderRadius: "50%",
                          background: "var(--surface-2)", color: "var(--ink-faint)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, flexShrink: 0,
                        }}
                      >
                        강아
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                          {n.pet} · {n.owner}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>
                          {i.date} {i.time}
                        </div>
                        {i.place && (
                          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>
                            {i.place}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <Badge tone={i.status === "confirmed" ? "brand" : "slate"}>
                          {STATUS[i.status]}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => router.push(`/walks/${i._id}`)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontFamily: "inherit", fontSize: 13, color: "var(--brand-strong)",
                            textDecoration: "underline", textUnderlineOffset: 3,
                          }}
                        >
                          약속 상세
                        </button>
                      </div>
                    </div>
                  </UICard>
                );
              })}
            </div>
          )}

          {/* 약속 목록 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              margin: "32px 0 14px",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
              약속 목록
            </h2>
            <div style={{ display: "flex", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>상태</div>
                <Select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 110, height: 38, fontSize: 13 }}>
                  <option value="all">전체</option>
                  <option value="proposed">대기 중</option>
                  <option value="confirmed">수락됨</option>
                  <option value="declined">거절됨</option>
                  <option value="cancelled">취소됨</option>
                </Select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>정렬</div>
                <Select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 130, height: 38, fontSize: 13 }}>
                  <option value="date">날짜 최신순</option>
                </Select>
              </div>
            </div>
          </div>

          {listRows.length === 0 ? (
            <UICard><p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>약속이 없어요.</p></UICard>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {listRows.map((i) => {
                const n = peerName(i.match);
                return (
                  <button
                    key={i._id}
                    type="button"
                    onClick={() => router.push(`/walks/${i._id}`)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                      border: "1px solid var(--border)", borderRadius: "var(--r-card)",
                      background: "var(--bg)", padding: 14, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%", background: "var(--surface-2)",
                      color: "var(--ink-faint)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 12, flexShrink: 0,
                    }}>강아</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                        {n.pet} · {n.owner}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                        {i.date} {i.time}{i.place ? ` · ${i.place}` : ""}
                      </div>
                    </div>
                    <Badge tone={i.status === "confirmed" ? "brand" : i.status === "declined" || i.status === "cancelled" ? "rose" : "slate"}>
                      {STATUS[i.status]}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}

          {/* 지난 약속 기록 (완료된 산책) */}
          {walks.length > 0 && (
            <>
              <h2 style={{ margin: "32px 0 14px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
                지난 약속 기록
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {walks.slice(0, 5).map((w) => (
                  <div
                    key={w._id}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      border: "1px solid var(--border)", borderRadius: "var(--r-card)",
                      background: "var(--bg)", padding: 14,
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%", background: "var(--surface-2)",
                      color: "var(--ink-faint)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 12, flexShrink: 0,
                    }}>강아</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                        {petName(w.pet)}와의 산책
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                        {new Date(w.startedAt).toLocaleDateString("ko-KR")} · {w.distanceKm}km · {w.durationMin}분
                      </div>
                    </div>
                    <Badge tone="brand">완료</Badge>
                  </div>
                ))}
              </div>
            </>
          )}

          {invites.length === 0 && walks.length === 0 && (
            <EmptyState
              emoji="🐕"
              title="아직 산책 약속이 없어요"
              desc="매칭한 상대와 첫 산책 약속을 만들어 보세요."
              action={<Button onClick={() => router.push("/walks/new")}>새 약속 만들기</Button>}
            />
          )}
        </>
      )}
    </Page>
  );
}
