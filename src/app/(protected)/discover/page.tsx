"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Button, EmptyState, Spinner, Toast, type ToastData } from "@/components/ui";
import { adapt, type Card } from "@/lib/card";
import DiscoverCard from "./DiscoverCard";
import DetailView from "./DetailView";
import RightRail from "./RightRail";
import MatchModal from "./MatchModal";
import SwipeLimit from "./SwipeLimit";
import Filters from "./Filters";

const SWIPE_LIMIT = 30; // matches backend FREE_DAILY_LIKE_LIMIT

export default function DiscoverPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [deck, setDeck] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [used, setUsed] = useState(0);
  const [match, setMatch] = useState<Card | null>(null);
  const [detailMode, setDetailMode] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const fetchDeck = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIdx(0);
    setDetailMode(false);
    try {
      const { data } = await api.get("/discover");
      const me = (user as any)?._id;
      const mapped: Card[] = (Array.isArray(data) ? data : [])
        .filter((u: any) => String(u.id ?? u._id) !== String(me))
        .map(adapt);
      setDeck(mapped);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  const current = deck[idx];
  const next = () => {
    setIdx((v) => v + 1);
    setDetailMode(false);
  };

  const goChat = (id: string) => router.push(`/chat?open=${id}`);

  const act = async (dir: "like" | "pass") => {
    if (acting || !current) return;
    setActing(true);
    try {
      if (dir === "like") {
        const { data } = await api.post(`/matches/like/${current.id}`);
        setUsed((u) => u + 1);
        if (data?.matchId) {
          setMatch(current);
        } else {
          setToast({
            msg: `${current.petName || current.ownerName || "친구"}에게 좋아요를 보냈어요`,
            type: "ok",
          });
          next();
        }
      } else {
        api.post(`/matches/pass/${current.id}`).catch(() => {});
        setUsed((u) => u + 1);
        next();
      }
    } catch (e: any) {
      if (e?.response?.status === 402) {
        setShowLimit(true);
        setUsed(SWIPE_LIMIT);
      } else {
        setToast({ msg: "문제가 발생했어요. 다시 시도해 주세요.", type: "error" });
      }
    } finally {
      setActing(false);
    }
  };

  const limitView = showLimit || used >= SWIPE_LIMIT;

  const myLocation =
    (user as any)?.locationName || (user as any)?.location || "";

  return (
    <Page
      title="디스커버"
      subtitle={
        myLocation
          ? `${myLocation} · 가까운 동네의 친구들이에요.`
          : "가까운 동네의 친구들이에요."
      }
    >
      {!limitView && (
        <div style={{ display: detailMode ? "none" : undefined }}>
          <Filters onApply={fetchDeck} />
        </div>
      )}

      {limitView ? (
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
          title="문제가 발생했어요"
          desc={error}
          action={
            <Button icon="refresh" onClick={fetchDeck}>
              다시 시도
            </Button>
          }
        />
      ) : !current ? (
        <EmptyState
          emoji="🐾"
          title="더 보여줄 친구가 없어요"
          desc="필터를 넓히거나 잠시 후 다시 확인해 주세요."
          action={
            <Button
              icon="filter"
              variant="secondary"
              onClick={() => router.push("/settings/exposure")}
            >
              필터 넓히기
            </Button>
          }
        />
      ) : detailMode ? (
        <DetailView
          card={current}
          onBack={() => setDetailMode(false)}
          onLike={() => act("like")}
          onNext={next}
        />
      ) : (
        <>
          <div
            className="pd-discover-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) 320px",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div>
              <div style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}>
                <DiscoverCard
                  card={current}
                  acting={acting}
                  onDetail={() => setDetailMode(true)}
                  onPass={() => act("pass")}
                  onLike={() => act("like")}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 14,
                  marginTop: 18,
                }}
              >
                <Button size="sm" onClick={() => router.push("/subscription")}>
                  부스트 사용 ⚡
                </Button>
                <span
                  style={{
                    fontSize: "var(--fs-meta)",
                    color: "var(--text-secondary)",
                  }}
                >
                  오늘 남은 스와이프: {Math.max(0, SWIPE_LIMIT - used)} / {SWIPE_LIMIT}
                </span>
              </div>
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowLimit(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "var(--fs-meta)",
                    color: "var(--text-secondary)",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  스와이프 제한 안내
                </button>
              </div>
            </div>

            <RightRail
              upcoming={deck.slice(idx + 1, idx + 4)}
              onPremium={() => router.push("/subscription")}
            />
          </div>
        </>
      )}

      {match && (
        <MatchModal
          card={match}
          onChat={() => goChat(match.id)}
          onLater={() => {
            setMatch(null);
            next();
          }}
        />
      )}

      <Toast toast={toast} />
    </Page>
  );
}
