"use client";

/** Offleash v2 feed pieces — PostCard, BallWalkCard, NearYouRail. */

import { useRouter } from "next/navigation";
import type { Post } from "@/lib/feed-demo";
import { busySpots } from "@/lib/feed-demo";
import type { Card } from "@/lib/card";
import type { WalkInvite } from "@/app/(protected)/chat/types";

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

const tagFor: Record<Post["type"], { label: string; cls: string }> = {
  lost: { label: "Lost", cls: "tag tag-lost" },
  "walk-request": { label: "Walk mate", cls: "tag tag-want" },
  recommend: { label: "Recommend", cls: "tag" },
  question: { label: "Question", cls: "tag" },
};

export function PostCard({ post }: { post: Post }) {
  const tag = tagFor[post.type];
  return (
    <article className={`card${post.type === "lost" ? " card-lost" : ""}`}>
      <div className="post-meta">
        <InitialAvatar initial={post.initial} size="sm" />
        <b>{post.author}</b> · {post.timeAgo}
        <span className={tag.cls}>{tag.label}</span>
        <span className="post-dist">{post.distance}</span>
      </div>
      <p className="post-body">{post.body}</p>
      <div className="post-actions">
        {post.type === "lost" && <button className="btn btn-danger btn-sm">I saw them</button>}
        {post.type === "walk-request" && <button className="btn btn-ball btn-sm">I&apos;ll walk with you</button>}
        {post.type === "question" && <button className="btn btn-ghost btn-sm">Answer</button>}
        <button className="btn btn-ghost btn-sm">🐾 {post.reactions}</button>
        <span className="post-count">{post.comments} comments</span>
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

/** 우측 레일 — 근처 강아지(실데이터) + 이번 주 인기 장소(데모). */
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
            {d.location && <span className="near-dist" style={{ fontSize: 13 }}>{d.location.split("·").pop()?.trim()}</span>}
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
