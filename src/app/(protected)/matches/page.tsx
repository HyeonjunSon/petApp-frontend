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

/* 시안 .match-card 문법: 흰 카드 radius 16, 사진 190px, 태그 pill primary-10 */
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
const btnPrimarySm: React.CSSProperties = {
  ...btnGhostSm,
  background: "var(--primary)",
  color: "var(--white)",
  fontWeight: 700,
};

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
      title="매치"
      subtitle="서로 좋아요한 친구들이에요."
      right={
        <button type="button" style={btnGhostSm} onClick={() => router.push("/matches/likes")}>
          나를 좋아요한 친구
        </button>
      }
    >
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: 4 }}>
            정렬
          </div>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 150, height: 40, fontSize: "var(--fs-meta)" }}>
            <option value="recent">최근 매치순</option>
            <option value="message">최근 메시지순</option>
          </Select>
        </div>
        <div>
          <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginBottom: 4 }}>
            상태
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 110, height: 40, fontSize: "var(--fs-meta)" }}>
            <option value="all">전체</option>
            <option value="new">새 메시지</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center pt-16" style={{ color: "var(--text-secondary)" }}>
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          emoji="💜"
          title="아직 매치가 없어요"
          desc="디스커버에서 마음에 드는 친구에게 좋아요를 보내보세요."
          action={
            <button type="button" style={btnPrimarySm} onClick={() => router.push("/discover")}>
              디스커버 가기
            </button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {rows.map((m) => {
            const peer = peerOf(m, myId);
            const pet = pickPet(peer);
            const photo = toAbs(pet?.photos?.[0]?.url);
            const isNew = (m.unreadCount || 0) > 0;
            const last = m.lastMessage?.text;
            return (
              <div
                key={m._id}
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--radius-2xl)",
                  boxShadow: "var(--shadow-card)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: 190,
                    background: "var(--input-bg)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 64,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={pet?.name || ""}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                <div style={{ padding: 16, flex: 1 }}>
                  <div style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>
                    {pet?.name || peer?.name || "친구"}
                  </div>
                  <div style={{ marginTop: 3, fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>
                    {peer?.name ? `${peer.name} 보호자` : "보호자"}
                    {m.lastMessage?.createdAt ? ` · ${formatTime(m.lastMessage.createdAt)}` : ""}
                  </div>
                  <div
                    className="pd-line1"
                    style={{ marginTop: 8, fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}
                  >
                    {last || "서로 좋아요했어요. 대화를 시작해 보세요!"}
                  </div>
                  {isNew && (
                    <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          background: "var(--primary-10)",
                          color: "var(--primary)",
                          borderRadius: "var(--radius-pill)",
                          padding: "3px 10px",
                          fontSize: "var(--fs-micro)",
                          fontWeight: 700,
                        }}
                      >
                        새 메시지 {m.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, padding: "0 16px 16px" }}>
                  <button
                    type="button"
                    onClick={() => router.push(`/chat?open=${m._id}`)}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--fs-meta)",
                      fontWeight: 700,
                      background: "var(--primary)",
                      color: "var(--white)",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    채팅하기
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
