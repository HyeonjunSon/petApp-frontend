"use client";

/** Home — Offleash v2 동네 피드 (RTK Query).
    posts/discover/walk-invites/matches는 쿼리 캐시로, 작성·반응·댓글은
    뮤테이션(onQueryStarted 낙관적 업데이트)으로. 서버가 구버전이라
    /posts가 없으면 데모 포스트로 폴백. */

import { useMemo, useState } from "react";
import { useAuth } from "@/store/auth";
import { posts as demoPosts, fmtDistance, type PostType } from "@/lib/feed-demo";
import {
  PostCard,
  BallWalkCard,
  InitialAvatar,
  NearYouRail,
  timeAgo,
  type FeedPost,
} from "@/components/feed";
import { peerOf, pickPet } from "../chat/types";
import {
  usePostsQuery,
  useCreatePostMutation,
  useReactPostMutation,
  useCommentPostMutation,
  useDiscoverQuery,
  useMatchesQuery,
  useWalkInvitesQuery,
  type ApiPost,
} from "@/store/api";

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

  const { data: apiPosts, isLoading: postsLoading, isError: postsError } = usePostsQuery();
  const { data: invites = [] } = useWalkInvitesQuery();
  const { data: matches = [] } = useMatchesQuery();
  const { data: dogs = [] } = useDiscoverQuery();

  const [createPost, { isLoading: posting }] = useCreatePostMutation();
  const [reactPost] = useReactPostMutation();
  const [commentPost] = useCommentPostMutation();

  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftType, setDraftType] = useState<PostType>("question");

  const feed: FeedPost[] | null = useMemo(() => {
    if (postsError) return demoPosts.map((p) => ({ ...p, live: false }));
    if (!apiPosts) return null;
    return apiPosts.map(fromApi);
  }, [apiPosts, postsError]);

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
    try {
      await createPost({ type: draftType, body }).unwrap();
      setDraft("");
      setComposing(false);
    } catch {
      /* old server without /posts — keep the draft so nothing is lost */
    }
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

        {feed === null || postsLoading ? (
          <div className="card" style={{ color: "var(--fence)" }}>Loading your street…</div>
        ) : feed.length === 0 ? (
          <div className="card" style={{ color: "var(--fence)" }}>
            Nothing on your street yet — be the first to post.
          </div>
        ) : (
          feed.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onReact={(post) => reactPost({ id: post.id, wasReacted: !!post.reacted })}
              onComment={async (post, body) => {
                await commentPost({ id: post.id, body }).unwrap();
              }}
            />
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
