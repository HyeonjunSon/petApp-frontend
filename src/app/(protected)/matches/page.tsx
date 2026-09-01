"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Select, EmptyState, Spinner } from "@/components/ui";
import { toAbs } from "@/lib/card";
import {
  type Match,
  lastMsgTime,
  peerOf,
  pickPet,
  formatTime,
} from "../chat/types";

/* v2 인풋: --paper 배경 (radius 12는 공용 컴포넌트) */
const inputBg: React.CSSProperties = { background: "var(--paper)" };

export default function MatchesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("recent");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api
      .get<Match[]>("/matches")
      .then(({ data }) => setMatches(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    let list = matches.slice();
    if (filter === "new") list = list.filter((m) => (m.unreadCount || 0) > 0);
    if (sort === "recent")
      list.sort((a, b) => lastMsgTime(b) - lastMsgTime(a));
    return list;
  }, [matches, sort, filter]);

  return (
    <Page
      title="Matches"
      subtitle="Friends who liked you back."
      right={
        <button type="button" className="btn btn-ghost" onClick={() => router.push("/matches/likes")}>
          Likes you
        </button>
      }
    >
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--fence)", marginBottom: 4 }}>Sort</div>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} style={{ ...inputBg, width: 160, height: 40, fontSize: 14 }}>
            <option value="recent">Newest matches</option>
            <option value="message">Latest messages</option>
          </Select>
        </div>
        <div>
          <div style={{ fontSize: 13, color: "var(--fence)", marginBottom: 4 }}>Status</div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...inputBg, width: 140, height: 40, fontSize: 14 }}>
            <option value="all">All</option>
            <option value="new">New messages</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center pt-16" style={{ color: "var(--fence)" }}>
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          emoji="🐾"
          title="No matches yet"
          desc="Send a like to a friend you love in Discover."
          action={
            <button type="button" className="btn" onClick={() => router.push("/discover")}>
              Go to Discover
            </button>
          }
        />
      ) : (
        <div className="pack-grid">
          {rows.map((m) => {
            const peer = peerOf(m, myId);
            const pet = pickPet(peer);
            const photo = toAbs(pet?.photos?.[0]?.url);
            const isNew = (m.unreadCount || 0) > 0;
            const last = m.lastMessage?.text;
            return (
              <div key={m._id} className="dog-card" style={{ display: "flex", flexDirection: "column" }}>
                <div
                  className="dog-photo"
                  style={!photo ? { display: "grid", placeItems: "center", fontSize: 56 } : undefined}
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={pet?.name || ""}
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset.fb === "1") return;
                        img.dataset.fb = "1";
                        img.src = "/img/pet-placeholder.svg";
                      }}
                    />
                  ) : (
                    <span aria-hidden>🐕</span>
                  )}
                </div>
                <div className="dog-info" style={{ flex: 1 }}>
                  <div className="dog-name">
                    {pet?.name || peer?.name || "Friend"}
                    {isNew && <small>{m.unreadCount} new</small>}
                  </div>
                  <div className="dog-breed">
                    {peer?.name ? `${peer.name} (owner)` : "Owner"}
                    {m.lastMessage?.createdAt ? ` · ${formatTime(m.lastMessage.createdAt)}` : ""}
                  </div>
                  <div className="pd-line1" style={{ marginTop: 8, fontSize: 13, color: "var(--fence)" }}>
                    {last || "You liked each other. Start the conversation!"}
                  </div>
                </div>
                <div className="dog-acts">
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => router.push(`/chat?open=${m._id}`)}
                  >
                    Open chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
