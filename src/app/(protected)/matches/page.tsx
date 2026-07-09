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
      title="Matches"
      right={
        <Button variant="secondary" onClick={() => router.push("/matches/likes")}>
          See who liked you
        </Button>
      }
    >
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>
            Sort
          </div>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 150, height: 40, fontSize: 13 }}>
            <option value="recent">Newest match</option>
            <option value="message">Recent message</option>
          </Select>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>
            Status
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 110, height: 40, fontSize: 13 }}>
            <option value="all">All</option>
            <option value="new">New</option>
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
          title="No matches yet"
          desc="Send a Like to a pet you like in Discover."
          action={<Button onClick={() => router.push("/discover")}>Go to Discover</Button>}
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
                  <ImagePlaceholder src={photo || undefined} label="Dog photo" height={84} radius={10} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
                      {pet?.name || peer?.name || "Pet"}
                    </span>
                    {isNew && <Badge tone="brand">New</Badge>}
                  </div>
                  <div
                    className="pd-line1"
                    style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 6 }}
                  >
                    {last || "You both liked each other. Start chatting!"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 6 }}>
                    Owner · {peer?.name || "—"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                    {formatTime(m.lastMessage?.createdAt)}
                  </span>
                  <Button onClick={() => router.push(`/chat?open=${m._id}`)}>Chat</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
