"use client";

/** Home — Offleash v2 동네 피드.
    피드는 실데이터(/api/posts): 작성·🐾 반응·댓글까지 동작.
    서버가 구버전이라 /posts가 없으면 데모 포스트로 폴백.
    레일: 다음 산책(/walk-invites) + 근처 강아지(/discover, 실제 거리). */

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { adapt, type Card } from "@/lib/card";
import { posts as demoPosts, fmtDistance, type PostType } from "@/lib/feed-demo";
import {
  PostCard,
  BallWalkCard,
  InitialAvatar,
  NearYouRail,
  timeAgo,
  type FeedPost,
} from "@/components/feed";
import {
  type Match,
  type WalkInvite,
  peerOf,
  pickPet,
} from "../chat/types";

type ApiPost = {
  id: string;
  author: { id: string; name: string };
  type: PostType;
  body: string;
  distanceM: number | null;
  reactions: number;
  reacted: boolean;
  commentCount: number;
  topComment?: { author: string; body: string; createdAt: string } | null;
  createdAt: string;
};

const fromApi = (p: ApiPost): FeedPost => ({
  id: p.id,
  author: p.author?.name || "Neighbour",
  initial: ((p.author?.name || "N")[0] || "N").toUpperCase(),
  type: p.type,
  timeAgo: timeAgo(p.createdAt),
  distance: typeof p.distanceM === "number" ? fmtDistance(p.distanceM) : "",
  body: p.body,
  reactions: p.reactions,
  reacted: p.reacted,
  comments: p.commentCount,
  topComment: p.topComment
    ? {
        author: p.topComment.author,
        initial: ((p.topComment.author || "N")[0] || "N").toUpperCase(),
        body: p.topComment.body,
        timeAgo: timeAgo(p.topComment.createdAt),
      }
    : undefined,
  live: true,
});

const COMPOSER_TYPES: Array<{ v: PostType; label: string }> = [
  { v: "walk-request", label: "Walk mate" },
  { v: "lost", label: "Lost" },
  { v: "recommend", label: "Recommend" },
  { v: "question", label: "Question" },
];

export default function HomePage() {
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const [feed, setFeed] = useState<FeedPost[] | null>(null);
  const [invites, setInvites] = useState<WalkInvite[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [dogs, setDogs] = useState<Card[]>([]);

  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftType, setDraftType] = useState<PostType>("question");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get<ApiPost[]>("/posts"),
      api.get<WalkInvite[]>("/walk-invites"),
      api.get<Match[]>("/matches"),
      api.get("/discover"),
    ]).then(([ps, inv, mt, disc]) => {
      if (ps.status === "fulfilled") setFeed((ps.value.data || []).map(fromApi));
      else setFeed(demoPosts.map((p) => ({ ...p, live: false })));
      if (inv.status === "fulfilled") setInvites(inv.value.data || []);
      if (mt.status === "fulfilled") setMatches(mt.value.data || []);
      if (disc.status === "fulfilled") {
        const data = disc.value.data;
        setDogs((Array.isArray(data) ? data : []).map(adapt));
      }
    });
  }, []);

  const next = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return invites
      .filter((i) => (i.status === "confirmed" || i.status === "proposed") && i.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  }, [invites]);

  const nextWith = useMemo(() => {
    if (!next) return undefined;
    const m = matches.find((x) => x._id === next.match);
    const peer = m ? peerOf(m, myId) : undefined;
    if (!peer) return undefined;
    const pet = pickPet(peer);
    return pet?.name ? `${pet.name} & ${peer.name || "owner"}` : peer.name;
  }, [next, matches, myId]);

  const submitPost = async () => {
    const body = draft.trim();
    if (!body || posting) return;
    setPosting(true);
    try {
      const { data } = await api.post<ApiPost>("/posts", { type: draftType, body });
      setFeed((f) => [fromApi(data), ...(f || [])]);
      setDraft("");
      setComposing(false);
    } catch {
      /* old server without /posts — keep the draft so nothing is lost */
    } finally {
      setPosting(false);
    }
  };

  const react = async (p: FeedPost) => {
    setFeed(
      (f) =>
        f?.map((x) =>
          x.id === p.id
            ? { ...x, reacted: !x.reacted, reactions: x.reactions + (x.reacted ? -1 : 1) }
            : x
        ) || null
    );
    try {
      await api.post(`/posts/${p.id}/react`);
    } catch {
      setFeed((f) => f?.map((x) => (x.id === p.id ? p : x)) || null); // rollback
    }
  };

  const comment = async (p: FeedPost, body: string) => {
    const { data } = await api.post(`/posts/${p.id}/comments`, { body });
    setFeed(
      (f) =>
        f?.map((x) =>
          x.id === p.id
            ? {
                ...x,
                comments: data.commentCount,
                topComment: {
                  author: data.comment.author,
                  initial: ((data.comment.author || "N")[0] || "N").toUpperCase(),
                  body: data.comment.body,
                  timeAgo: "just now",
                },
              }
            : x
        ) || null
    );
  };

  const initial = ((user?.name || "O")[0] || "O").toString();

  return (
    <>
      <main className="shell-main">
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="composer" style={{ padding: 0 }}>
            <InitialAvatar initial={initial} />
            {composing ? (
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What's happening on your street?"
                rows={3}
                style={{
                  flex: 1,
                  background: "var(--paper)",
                  border: 0,
                  borderRadius: 14,
                  padding: "12px 16px",
                  font: "inherit",
                  color: "var(--ink)",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            ) : (
              <button className="composer-input" onClick={() => setComposing(true)}>
                What&apos;s happening on your street?
              </button>
            )}
          </div>
          {composing && (
            <div className="post-actions" style={{ marginTop: 0 }}>
              {COMPOSER_TYPES.map((t) => (
                <button
                  key={t.v}
                  type="button"
                  className={`pill${draftType === t.v ? " pill-on" : ""}`}
                  onClick={() => setDraftType(t.v)}
                >
                  {t.label}
                </button>
              ))}
              <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setComposing(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-ball btn-sm"
                  disabled={posting || !draft.trim()}
                  onClick={submitPost}
                >
                  {posting ? "Posting…" : "Post"}
                </button>
              </span>
            </div>
          )}
        </div>

        {feed === null ? (
          <div className="card" style={{ color: "var(--fence)" }}>Loading your street…</div>
        ) : feed.length === 0 ? (
          <div className="card" style={{ color: "var(--fence)" }}>
            Nothing on your street yet — be the first to post.
          </div>
        ) : (
          feed.map((p) => (
            <PostCard key={p.id} post={p} onReact={react} onComment={comment} />
          ))
        )}
      </main>
      <aside className="rail" aria-label="Your walks and neighbours">
        <BallWalkCard invite={next} withWhom={nextWith} />
        <NearYouRail dogs={dogs} />
      </aside>
    </>
  );
}
