"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Button, EmptyState, Spinner, Chip, Toast, type ToastData } from "@/components/ui";
import { adapt, type Card } from "@/lib/card";
import DiscoverCard from "./DiscoverCard";
import DetailView from "./DetailView";
import RightRail from "./RightRail";
import MatchModal from "./MatchModal";
import SwipeLimit from "./SwipeLimit";
import Filters from "./Filters";

const SWIPE_LIMIT = 20;

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
          setToast({ msg: `${current.petName || current.ownerName || "상대"}님에게 좋아요를 보냈어요`, type: "ok" });
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
        setToast({ msg: "처리하지 못했어요. 다시 시도해 주세요.", type: "error" });
      }
    } finally {
      setActing(false);
    }
  };

  const limitView = showLimit || used >= SWIPE_LIMIT;

  return (
    <Page
      title="디스커버"
      right={!limitView ? <Filters onApply={fetchDeck} /> : undefined}
    >
      {limitView ? (
        <SwipeLimit
          used={Math.min(used, SWIPE_LIMIT)}
          limit={SWIPE_LIMIT}
          onLater={() => setShowLimit(false)}
          onUpgrade={() => router.push("/subscription")}
        />
      ) : loading ? (
        <div className="flex justify-center pt-20" style={{ color: "var(--ink-soft)" }}>
          <Spinner />
        </div>
      ) : error ? (
        <EmptyState
          emoji="⚠️"
          title="문제가 생겼어요"
          desc={error}
          action={<Button icon="refresh" onClick={fetchDeck}>다시 시도</Button>}
        />
      ) : !current ? (
        <EmptyState
          emoji="🐾"
          title="더 볼 반려동물이 없어요"
          desc="필터를 넓히거나 잠시 후 다시 확인해 주세요."
          action={
            <Button icon="filter" variant="secondary" onClick={() => router.push("/settings/exposure")}>
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
            <ConditionBar />
            <DiscoverCard card={current} onDetail={() => setDetailMode(true)} />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginTop: 18,
              }}
            >
              <Button variant="secondary" disabled={acting} onClick={() => act("pass")}>
                패스 →
              </Button>
              <Button disabled={acting} onClick={() => act("like")} icon="heart">
                좋아요
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 14,
                marginTop: 14,
              }}
            >
              <Button size="sm" onClick={() => router.push("/subscription")}>
                부스트 사용하기 ⚡
              </Button>
              <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
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
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                스와이프 한도 안내
              </button>
            </div>
          </div>

          <RightRail
            upcoming={deck.slice(idx + 1, idx + 4)}
            onPremium={() => router.push("/subscription")}
          />
        </div>
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

function ConditionBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 16,
      }}
    >
      <Chip active>활발함</Chip>
      <Chip active>산책 좋아요</Chip>
      <Chip active>소형견</Chip>
      <span style={{ fontSize: 13, color: "var(--ink-soft)", marginLeft: 4 }}>
        현재 조건: 500m 이내 · 소형견 · 활발함
      </span>
    </div>
  );
}
