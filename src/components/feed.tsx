"use client";

/** Offleash v2 feed pieces — PostCard, BallWalkCard, NearYouRail.
    PostCard consumes a normalized FeedPost (real API or demo fallback). */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { busySpots, fmtDistance, type PostType } from "@/lib/feed-demo";
import type { Card } from "@/lib/card";
import type { WalkInvite } from "@/app/(protected)/chat/types";

export interface FeedPost {
  id: string;
  author: string;
  initial: string;
  type: PostType;
  timeAgo: string;
  distance: string; // "600 m" | ""
  body: string;
  reactions: number;
  reacted?: boolean;
  comments: number;
  topComment?: { author: string; initial: string; body: string; timeAgo: string };
  live?: boolean; // 실데이터 여부 (핸들러 활성화)
}

export function timeAgo(iso?: string) {
  if (!iso) return "";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} d`;
}

export function InitialAvatar({
  initial,
  size = "md",
  tone,
}: {
  initial: string;
  size?: "sm" | "md";
  tone?: "ball";
}) {
  return (
    <span className={`avatar avatar-${size}${tone === "ball" ? " avatar-ball" : ""}`} aria-hidden="true">
      {initial}
    </span>
  );
}

const tagFor: Record<PostType, { label: string; cls: string }> = {
  lost: { label: "Lost", cls: "tag tag-lost" },
  "walk-request": { label: "Walk mate", cls: "tag tag-want" },
  recommend: { label: "Recommend", cls: "tag" },
  question: { label: "Question", cls: "tag" },
};

const actionLabel: Partial<Record<PostType, { label: string; cls: string }>> = {
  lost: { label: "I saw them", cls: "btn btn-danger btn-sm" },
  "walk-request": { label: "I'll walk with you", cls: "btn btn-ball btn-sm" },
  question: { label: "Answer", cls: "btn btn-ghost btn-sm" },
};

export function PostCard({
  post,
  onReact,
  onComment,
}: {
  post: FeedPost;
  onReact?: (p: FeedPost) => void;
  onComment?: (p: FeedPost, body: string) => Promise<void> | void;
}) {
  const tag = tagFor[post.type];
  const act = actionLabel[post.type];
  const [commenting, setCommenting] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const submitComment = async () => {
    const v = draft.trim();
    if (!v || !onComment || busy) return;
    setBusy(true);
    try {
      await onComment(post, v);
      setDraft("");
      setCommenting(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`card${post.type === "lost" ? " card-lost" : ""}`}>
      <div className="post-meta">
        <InitialAvatar initial={post.initial} size="sm" />
        <b>{post.author}</b> · {post.timeAgo}
        <span className={tag.cls}>{tag.label}</span>
        {post.distance && <span className="post-dist">{post.distance}</span>}
      </div>
      <p className="post-body">{post.body}</p>
      <div className="post-actions">
        {act && (
          <button
            className={act.cls}
            onClick={() => (post.live && onComment ? setCommenting((v) => !v) : undefined)}
          >
            {act.label}
          </button>
        )}
        <button
          className={`btn btn-sm ${post.reacted ? "btn-ball" : "btn-ghost"}`}
          onClick={() => post.live && onReact?.(post)}
          aria-pressed={post.reacted || false}
        >
          🐾 {post.reactions}
        </button>
        <span className="post-count">
          {post.comments} comment{post.comments === 1 ? "" : "s"}
        </span>
      </div>
      {post.topComment && (
        <div className="post-comment">
          <InitialAvatar initial={post.topComment.initial} size="sm" />
          <div>
            <b>{post.topComment.author}</b> {post.topComment.body}
            <small>{post.topComment.timeAgo}</small>
          </div>
        </div>
      )}
      {commenting && (
        <div className="post-comment" style={{ alignItems: "center" }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
            placeholder="Write a reply…"
            style={{
              flex: 1,
              background: "var(--paper)",
              border: 0,
              borderRadius: 999,
              padding: "10px 14px",
              font: "inherit",
              color: "var(--ink)",
              outline: "none",
            }}
          />
          <button className="btn btn-sm" disabled={busy || !draft.trim()} onClick={submitComment}>
            Reply
          </button>
        </div>
      )}
    </article>
  );
}

/** 다음 산책 약속 — 시그니처 테니스볼 카드. invite가 없으면 안내 카드. */
export function BallWalkCard({
  invite,
  withWhom,
}: {
  invite?: WalkInvite | null;
  withWhom?: string;
}) {
  const router = useRouter();
  if (!invite) {
    return (
      <div className="walk-card">
        <div className="walk-when">No walk yet</div>
        <div className="walk-with">Plan one with a neighbour</div>
        <div className="post-actions">
          <button className="btn btn-sm" onClick={() => router.push("/pack")}>Find a mate</button>
        </div>
      </div>
    );
  }
  const d = new Date(`${invite.date}T${invite.time || "12:00"}:00`);
  const day = isNaN(d.getTime())
    ? invite.date
    : d.toLocaleDateString("en-US", { weekday: "short" });
  return (
    <div className="walk-card">
      <div className="walk-when">
        {day} {invite.time}
      </div>
      {withWhom && <div className="walk-with">Walk with {withWhom}</div>}
      {invite.place && <div className="walk-where">{invite.place}</div>}
      <div className="post-actions">
        <button className="btn btn-sm" onClick={() => router.push(`/chat?open=${invite.match}`)}>
          Open chat
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => router.push("/walks")}>
          All walks
        </button>
      </div>
    </div>
  );
}

/** 우측 레일 — 근처 강아지(실데이터, 거리 포함) + 이번 주 인기 장소(데모). */
export function NearYouRail({ dogs }: { dogs: Card[] }) {
  const router = useRouter();
  return (
    <>
      <div className="card">
        <h3>Near you right now</h3>
        {dogs.slice(0, 4).map((d) => (
          <button
            key={d.id}
            type="button"
            className="near-row"
            style={{ width: "100%", background: "none", border: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
            onClick={() => router.push("/pack")}
          >
            {d.photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <span className="avatar avatar-sm"><img src={d.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></span>
            ) : (
              <InitialAvatar initial={(d.petName || d.ownerName || "?")[0]} size="sm" />
            )}
            <span className="near-info">
              {d.petName || d.ownerName}
              <small className="pd-line1">
                {[d.breed, d.ownerName]
                  .filter((v) => v && v !== (d.petName || d.ownerName))
                  .join(" · ") || "Neighbour"}
              </small>
            </span>
            {typeof d.distanceM === "number" && (
              <span className="near-dist">{fmtDistance(d.distanceM)}</span>
            )}
          </button>
        ))}
        {dogs.length > 4 && (
          <button type="button" className="rail-link" style={{ background: "none", border: 0, cursor: "pointer" }} onClick={() => router.push("/pack")}>
            See all {dogs.length} in Pack
          </button>
        )}
      </div>
      <div className="card">
        <h3>Busy this week</h3>
        {busySpots.map((s) => (
          <div key={s.name} className="spots-row">
            {s.name} <span>{s.walks} walks</span>
          </div>
        ))}
      </div>
    </>
  );
}
