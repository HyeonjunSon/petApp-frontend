"use client";

/** Pack — Offleash v2 강아지 그리드 (RTK Query).
    discover 쿼리 캐시 + like/pass 뮤테이션(낙관적 덱 제거는 api slice에서). */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type Card } from "@/lib/card";
import { Toast, type ToastData } from "@/components/ui";
import MatchModal from "../discover/MatchModal";
import SwipeLimit from "../discover/SwipeLimit";
import { NearYouRail } from "@/components/feed";
import { fmtDistance } from "@/lib/feed-demo";
import { useDiscoverQuery, useLikeMutation } from "@/store/api";

const SWIPE_LIMIT = 30; // matches backend FREE_DAILY_LIKE_LIMIT
const SIZE_CHIP: Record<string, string> = { s: "Small", m: "Medium", l: "Large" };

export default function PackPage() {
  const router = useRouter();

  const { data: deck = [], isLoading } = useDiscoverQuery();
  const [like, { isLoading: liking }] = useLikeMutation();

  const [size, setSize] = useState<string>("all");
  const [match, setMatch] = useState<Card | null>(null);
  const [showLimit, setShowLimit] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const sayHi = async (card: Card) => {
    if (liking) return;
    try {
      const r = await like(card.id).unwrap();
      if (r?.matchId) setMatch(card);
      else setToast({ msg: `You liked ${card.petName || card.ownerName}`, type: "ok" });
    } catch (e: any) {
      if (e?.status === 402) setShowLimit(true);
      else setToast({ msg: "Something went wrong. Please try again.", type: "error" });
    }
  };

  const shown = size === "all" ? deck : deck.filter((c) => c.size === size);

  return (
    <>
      <main className="shell-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: 28 }}>Pack</h1>
          <button className="pill" onClick={() => router.push("/matches")}>Mutual ▸</button>
        </div>
        <div className="chips">
          {[
            ["all", "All"],
            ["s", "Small"],
            ["m", "Medium"],
            ["l", "Large"],
          ].map(([v, label]) => (
            <button
              key={v}
              type="button"
              className={`pill${size === v ? " pill-on" : ""}`}
              onClick={() => setSize(v)}
            >
              {label}
            </button>
          ))}
        </div>

        {showLimit ? (
          <SwipeLimit
            used={SWIPE_LIMIT}
            limit={SWIPE_LIMIT}
            onLater={() => setShowLimit(false)}
            onUpgrade={() => router.push("/subscription")}
          />
        ) : isLoading ? (
          <div className="card" style={{ color: "var(--fence)" }}>Loading the pack…</div>
        ) : shown.length === 0 ? (
          <div className="card" style={{ color: "var(--fence)" }}>
            No dogs to show — widen your filters or check back later.
          </div>
        ) : (
          <div className="pack-grid">
            {shown.map((d) => (
              <div key={d.id} className="dog-card">
                <div className="dog-photo" role="img" aria-label={`${d.petName || "Dog"}, ${d.breed || ""}`}>
                  {d.photos[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.photos[0]} alt="" />
                  )}
                </div>
                <div className="dog-info">
                  <div className="dog-name">
                    {d.petName || d.ownerName || "New friend"}
                    {typeof d.distanceM === "number" ? (
                      <small>{fmtDistance(d.distanceM)}</small>
                    ) : (
                      d.size && <small>{SIZE_CHIP[d.size] || d.size}</small>
                    )}
                  </div>
                  <div className="dog-breed">
                    {[d.breed, d.age != null ? `${d.age} y` : "", d.ownerName]
                      .filter((v) => v && v !== (d.petName || d.ownerName || "New friend"))
                      .join(" · ") || "Neighbour"}
                  </div>
                </div>
                <div className="dog-acts">
                  <button
                    className="btn btn-ball btn-sm"
                    disabled={liking}
                    onClick={() => sayHi(d)}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Say hi 🐾
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <aside className="rail">
        <NearYouRail dogs={deck} />
      </aside>

      {match && (
        <MatchModal
          card={match}
          onChat={() => router.push(`/chat?open=${match.id}`)}
          onLater={() => setMatch(null)}
        />
      )}
      <Toast toast={toast} />
    </>
  );
}
