"use client";

/** 디스커버 — 시안 #page-discover: 칩 필터 + 3열 매치카드 그리드. */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Button, EmptyState, Spinner, Toast, type ToastData } from "@/components/ui";
import { adapt, type Card } from "@/lib/card";
import DiscoverCard from "./DiscoverCard";
import DetailView from "./DetailView";
import MatchModal from "./MatchModal";
import SwipeLimit from "./SwipeLimit";
import Filters from "./Filters";

const SWIPE_LIMIT = 30; // matches backend FREE_DAILY_LIKE_LIMIT

export default function DiscoverPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [deck, setDeck] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [match, setMatch] = useState<Card | null>(null);
  const [detail, setDetail] = useState<Card | null>(null);
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
    setError(null);
    setDetail(null);
    try {
      const { data } = await api.get("/discover");
      const me = (user as any)?._id;
      const mapped: Card[] = (Array.isArray(data) ? data : [])
        .filter((u: any) => String(u.id ?? u._id) !== String(me))
        .map(adapt);
      setDeck(mapped);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  const remove = (id: string) => {
    setDeck((d) => d.filter((c) => c.id !== id));
    setDetail((v) => (v?.id === id ? null : v));
  };

  const goChat = (id: string) => router.push(`/chat?open=${id}`);

  const act = async (card: Card, dir: "like" | "pass") => {
    if (actingId) return;
    setActingId(card.id);
    try {
      if (dir === "like") {
        const { data } = await api.post(`/matches/like/${card.id}`);
        setUsed((u) => u + 1);
        if (data?.matchId) {
          setMatch(card);
        } else {
          setToast({
            msg: `You liked ${card.petName || card.ownerName || "this friend"}`,
            type: "ok",
          });
        }
        remove(card.id);
      } else {
        api.post(`/matches/pass/${card.id}`).catch(() => {});
        setUsed((u) => u + 1);
        remove(card.id);
      }
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

  const myLocation =
    (user as any)?.locationName || (user as any)?.location || "";

  return (
    <Page
      title="Discover"
      subtitle={
        myLocation
          ? `${myLocation} · Friends in your neighborhood.`
          : "Friends in your neighborhood."
      }
    >
      {!showLimit && !detail && <Filters onApply={fetchDeck} />}

      {showLimit ? (
        <SwipeLimit
          used={Math.min(used, SWIPE_LIMIT)}
          limit={SWIPE_LIMIT}
          onLater={() => setShowLimit(false)}
          onUpgrade={() => router.push("/subscription")}
        />
      ) : loading ? (
        <div
          className="flex justify-center pt-20"
          style={{ color: "var(--text-secondary)" }}
        >
          <Spinner />
        </div>
      ) : error ? (
        <EmptyState
          emoji="⚠️"
          title="Something went wrong"
          desc={error}
          action={
            <Button icon="refresh" onClick={fetchDeck}>
              Try again
            </Button>
          }
        />
      ) : detail ? (
        <DetailView
          card={detail}
          onBack={() => setDetail(null)}
          onLike={() => act(detail, "like")}
          onNext={() => setDetail(null)}
        />
      ) : deck.length === 0 ? (
        <EmptyState
          emoji="🐾"
          title="No more friends to show"
          desc="Widen your filters or check back later."
          action={
            <Button
              icon="filter"
              variant="secondary"
              onClick={() => router.push("/settings/exposure")}
            >
              Widen filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deck.map((card) => (
            <DiscoverCard
              key={card.id}
              card={card}
              acting={actingId === card.id}
              onDetail={() => setDetail(card)}
              onPass={() => act(card, "pass")}
              onLike={() => act(card, "like")}
            />
          ))}
        </div>
      )}

      {match && (
        <MatchModal
          card={match}
          onChat={() => goChat(match.id)}
          onLater={() => setMatch(null)}
        />
      )}

      <Toast toast={toast} />
    </Page>
  );
}
