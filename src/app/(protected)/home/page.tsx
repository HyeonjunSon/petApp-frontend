"use client";

/** Home — Offleash v2 동네 피드 + 우측 레일(다음 산책·근처 강아지).
    피드 포스트는 데모 데이터 (posts 백엔드는 블루프린트 §5 예정),
    레일은 실데이터 (/walk-invites, /discover, /matches). */

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { adapt, type Card } from "@/lib/card";
import { posts } from "@/lib/feed-demo";
import { PostCard, BallWalkCard, InitialAvatar, NearYouRail } from "@/components/feed";
import {
  type Match,
  type WalkInvite,
  peerOf,
  pickPet,
} from "../chat/types";

export default function HomePage() {
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const [invites, setInvites] = useState<WalkInvite[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [dogs, setDogs] = useState<Card[]>([]);

  useEffect(() => {
    Promise.allSettled([
      api.get<WalkInvite[]>("/walk-invites"),
      api.get<Match[]>("/matches"),
      api.get("/discover"),
    ]).then(([inv, mt, disc]) => {
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

  const initial = ((user?.name || "O")[0] || "O").toString();

  return (
    <>
      <main className="shell-main">
        <div className="card composer">
          <InitialAvatar initial={initial} />
          <button className="composer-input">What&apos;s happening on your street?</button>
          <span className="pill">Walk mate</span>
          <span className="pill">Lost</span>
        </div>
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </main>
      <aside className="rail" aria-label="Your walks and neighbours">
        <BallWalkCard invite={next} withWhom={nextWith} />
        <NearYouRail dogs={dogs} />
      </aside>
    </>
  );
}
