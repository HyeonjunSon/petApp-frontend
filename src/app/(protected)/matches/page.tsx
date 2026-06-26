"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import { Button, Select, Badge, EmptyState, Spinner } from "@/components/ui";
import { toAbs } from "@/lib/card";
import {
  type Match,
  lastMsgTime,
  peerOf,
  pickPet,
  formatTime,
} from "../chat/types";

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
      title="매칭 목록"
      right={
        <Button variant="secondary" onClick={() => router.push("/matches/likes")}>
          나를 좋아요한 사람 보기
        </Button>
      }
    >
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>
            정렬 기준
          </div>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 150, height: 40, fontSize: 13 }}>
            <option value="recent">최신 매칭순</option>
            <option value="message">최근 메시지순</option>
          </Select>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>
            상태 필터
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 110, height: 40, fontSize: 13 }}>
            <option value="all">전체</option>
            <option value="new">신규</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center pt-16" style={{ color: "var(--ink-soft)" }}>
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          emoji="💚"
          title="아직 매칭이 없어요"
          desc="디스커버에서 마음에 드는 반려동물에게 좋아요를 보내보세요."
          action={<Button onClick={() => router.push("/discover")}>디스커버로 가기</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-card)",
                  background: "var(--bg)",
                  padding: 14,
                  boxShadow: "var(--sh-card)",
                }}
              >
                <div style={{ width: 132, flexShrink: 0 }}>
                  <ImagePlaceholder src={photo || undefined} label="강아지 사진" height={84} radius={10} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
                      {pet?.name || peer?.name || "반려동물"}
                    </span>
                    {isNew && <Badge tone="brand">신규</Badge>}
                  </div>
                  <div
                    className="pd-line1"
                    style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 6 }}
                  >
                    {last || "서로 좋아요를 눌렀어요. 대화를 시작해보세요!"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 6 }}>
                    보호자 · {peer?.name || "—"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                    {formatTime(m.lastMessage?.createdAt)}
                  </span>
                  <Button onClick={() => router.push(`/chat?open=${m._id}`)}>채팅하기</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
