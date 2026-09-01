"use client";

/** Pack — Offleash v2 강아지 그리드. 기존 /discover 데이터·좋아요 로직 연결. */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { adapt, type Card } from "@/lib/card";
import { Toast, type ToastData } from "@/components/ui";
import MatchModal from "../discover/MatchModal";
import SwipeLimit from "../discover/SwipeLimit";
import { NearYouRail } from "@/components/feed";

const SWIPE_LIMIT = 30; // matches backend FREE_DAILY_LIKE_LIMIT
const SIZE_CHIP: Record<string, string> = { s: "Small", m: "Medium", l: "Large" };

export default function PackPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [deck, setDeck] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<string>("all");
  const [actingId, setActingId] = useState<string | null>(null);
  const [match, setMatch] = useState<Card | null>(null);
  const [showLimit, setShowLimit] = useState(false);
  const [used, setUsed] = useState(0);
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const fetchDeck = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/discover");
      const me = (user as any)?._id;
      setDeck(
        (Array.isArray(data) ? data : [])
          .filter((u: any) => String(u.id ?? u._id) !== String(me))
          .map(adapt)
      );
    } catch {
      setToast({ msg: "Couldn't load the pack. Pull to retry.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  const like = async (card: Card) => {
    if (actingId) return;
    setActingId(card.id);
    try {
      const { data } = await api.post(`/matches/like/${card.id}`);
      setUsed((u) => u + 1);
      if (data?.matchId) setMatch(card);
      else setToast({ msg: `You liked ${card.petName || card.ownerName}`, type: "ok" });
      setDeck((d) => d.filter((c) => c.id !== card.id));
    } catch (e: any) {
      if (e?.response?.status === 402) {
        setShowLimit(true);
        setUsed(SWIPE_LIMIT);
      } else {
        setToast({ msg: "Something went wrong. Please try again.", type: "error" });
      }
    } finally {
      setActingId(null);
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
            used={Math.min(used, SWIPE_LIMIT)}
            limit={SWIPE_LIMIT}
            onLater={() => setShowLimit(false)}
            onUpgrade={() => router.push("/subscription")}
          />
        ) : loading ? (
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
                    {d.size && <small>{SIZE_CHIP[d.size] || d.size}</small>}
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
                    disabled={actingId === d.id}
                    onClick={() => like(d)}
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
