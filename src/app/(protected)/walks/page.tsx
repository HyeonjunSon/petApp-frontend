"use client";

/** Walk Plans — meetup (walk-invite) list. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Card as UICard, Button, Select, Badge, Spinner, EmptyState } from "@/components/ui";
import { type Match, type WalkInvite, peerOf, pickPet } from "../chat/types";

const STATUS: Record<string, string> = {
  proposed: "Pending",
  confirmed: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
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
    return { owner: peer?.name || "Partner", pet: pet?.name || "Pet" };
  };
  const petName = (id: string) => pets.find((p) => p._id === id)?.name || "Pet";

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
      title="Walk Plans"
      right={
        <>
          <Button variant="ghost" onClick={() => router.push("/walks/records")}>
            View records
          </Button>
          <Button onClick={() => router.push("/walks/new")}>New plan</Button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center pt-16" style={{ color: "var(--ink-soft)" }}>
          <Spinner />
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
            Upcoming
          </h2>
          {upcoming.length === 0 ? (
            <UICard>
              <p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>
                No upcoming walk plans.
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
                        Dog
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
                          Plan details
                        </button>
                      </div>
                    </div>
                  </UICard>
                );
              })}
            </div>
          )}

          {/* All plans */}
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
              All plans
            </h2>
            <div style={{ display: "flex", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>Status</div>
                <Select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 110, height: 38, fontSize: 13 }}>
                  <option value="all">All</option>
                  <option value="proposed">Pending</option>
                  <option value="confirmed">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>Sort</div>
                <Select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 130, height: 38, fontSize: 13 }}>
                  <option value="date">Newest first</option>
                </Select>
              </div>
            </div>
          </div>

          {listRows.length === 0 ? (
            <UICard><p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>No plans.</p></UICard>
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
                    }}>Dog</div>
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

          {/* Past plans (completed walks) */}
          {walks.length > 0 && (
            <>
              <h2 style={{ margin: "32px 0 14px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
                Past plans
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
                    }}>Dog</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                        Walk with {petName(w.pet)}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                        {new Date(w.startedAt).toLocaleDateString("en-US")} · {w.distanceKm}km · {w.durationMin} min
                      </div>
                    </div>
                    <Badge tone="brand">Completed</Badge>
                  </div>
                ))}
              </div>
            </>
          )}

          {invites.length === 0 && walks.length === 0 && (
            <EmptyState
              emoji="🐕"
              title="No walk plans yet"
              desc="Create your first walk plan with a match."
              action={<Button onClick={() => router.push("/walks/new")}>New plan</Button>}
            />
          )}
        </>
      )}
    </Page>
  );
}
