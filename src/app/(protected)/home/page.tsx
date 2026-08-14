"use client";

/** 홈 — 시안의 대시보드. 인사 + 산책 배너 + 이번 달 활동 + 빠른 실행 + 내 펫. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Icon, type IconName } from "@/components/ui";
import {
  type Match,
  type WalkInvite,
  peerOf,
  pickPet,
} from "../chat/types";
import type { Pet } from "@/types/pet";

type Walk = {
  _id: string;
  pet: string;
  distanceKm: number;
  durationMin: number;
  startedAt: string;
};

const PET_EMOJI: Record<string, string> = { dog: "🐕", cat: "🐈", other: "🐾" };
const SEX_KO: Record<string, string> = { male: "남아", female: "여아" };

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const [pets, setPets] = useState<Pet[]>([]);
  const [invites, setInvites] = useState<WalkInvite[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [walks, setWalks] = useState<Walk[]>([]);

  useEffect(() => {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    Promise.allSettled([
      api.get<Pet[]>("/pets"),
      api.get<WalkInvite[]>("/walk-invites"),
      api.get<Match[]>("/matches"),
      api.get<Walk[]>("/walks", { params: { from: iso(first), to: iso(today) } }),
    ]).then(([pt, inv, mt, wk]) => {
      if (pt.status === "fulfilled") setPets(pt.value.data || []);
      if (inv.status === "fulfilled") setInvites(inv.value.data || []);
      if (mt.status === "fulfilled") setMatches(mt.value.data || []);
      if (wk.status === "fulfilled") setWalks(wk.value.data || []);
    });
  }, []);

  const next = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return invites
      .filter(
        (i) =>
          (i.status === "confirmed" || i.status === "proposed") &&
          i.date >= todayIso
      )
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  }, [invites]);

  const nextPeer = useMemo(() => {
    if (!next) return undefined;
    const m = matches.find((x) => x._id === next.match);
    return m ? peerOf(m, myId) : undefined;
  }, [next, matches, myId]);

  const dday = useMemo(() => {
    if (!next) return "";
    const days = Math.round(
      (new Date(next.date + "T00:00:00").getTime() -
        new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime()) /
        86400000
    );
    return days <= 0 ? "D-DAY" : `D-${days}`;
  }, [next]);

  const monthWalks = useMemo(
    () => invites.filter((i) => i.status === "completed").length + walks.length,
    [invites, walks]
  );
  const monthKm = useMemo(
    () => walks.reduce((s, w) => s + (w.distanceKm || 0), 0),
    [walks]
  );

  const name = user?.name || "보호자";
  const firstPet = pets[0]?.name;

  return (
    <Page
      title={<>안녕하세요, {name}님 👋</>}
      subtitle={
        firstPet
          ? `${firstPet}가 산책을 기다리고 있어요.`
          : "오늘도 반려동물과 행복한 하루 보내세요."
      }
      right={
        <button
          type="button"
          onClick={() => router.push("/discover")}
          style={btnPrimarySm}
        >
          <Icon name="heart" size={15} fill />새 친구 찾기
        </button>
      }
      maxWidth={1040}
    >
      {/* 다가오는 산책 배너 */}
      {next && (
        <div
          className="pd-gradient"
          style={{
            borderRadius: "var(--radius-2xl)",
            boxShadow: "var(--shadow-banner)",
            color: "#fff",
            padding: "22px 24px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            border: "1px solid rgba(255,255,255,.15)",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,.2)",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--fs-caption)",
              fontWeight: 800,
              padding: "4px 12px",
              flexShrink: 0,
            }}
          >
            {dday}
          </span>
          <div style={{ minWidth: 0 }}>
            <b style={{ fontSize: "var(--fs-body)", fontWeight: 700 }}>
              {nextPeer?.name
                ? `${pickPet(nextPeer)?.name || nextPeer.name}네와 산책`
                : "산책 약속"}
            </b>
            <br />
            <span style={{ fontSize: "var(--fs-meta)", color: "rgba(255,255,255,.8)" }}>
              {next.date} {next.time}
              {next.place ? ` · ${next.place}` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/walks")}
            style={{
              marginLeft: "auto",
              background: "#fff",
              color: "var(--primary)",
              fontSize: "var(--fs-meta)",
              fontWeight: 700,
              borderRadius: "var(--radius-md)",
              padding: "9px 16px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            약속 보기
          </button>
        </div>
      )}

      {/* 이번 달 활동 */}
      <SectionTitle>이번 달 활동</SectionTitle>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        <Stat v={String(matches.length)} l="매칭된 친구" />
        <Stat v={`${monthWalks}회`} l="함께한 산책" />
        <Stat v={`${monthKm.toFixed(1)}km`} l="산책 거리" />
      </div>

      {/* 빠른 실행 */}
      <SectionTitle>빠른 실행</SectionTitle>
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <Quick
          icon="heart"
          label="친구 찾기"
          bg="var(--primary-10)"
          color="var(--primary)"
          onClick={() => router.push("/discover")}
        />
        <Quick
          icon="cal"
          label="산책 약속"
          bg="var(--success-soft)"
          color="var(--success)"
          onClick={() => router.push("/walks")}
        />
        <Quick
          icon="chat"
          label="채팅"
          bg="var(--info-soft)"
          color="var(--info)"
          onClick={() => router.push("/chat")}
        />
        <Quick
          icon="paw"
          label="내 펫 관리"
          bg="var(--warning-soft)"
          color="var(--warning)"
          onClick={() => router.push("/settings/pet")}
        />
      </div>

      {/* 내 펫 */}
      <SectionTitle
        more={
          <button
            type="button"
            onClick={() => router.push("/settings/pet")}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "var(--fs-meta)",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            펫 추가 ›
          </button>
        }
      >
        내 펫
      </SectionTitle>
      {pets.length === 0 ? (
        <div
          className="pd-card"
          style={{
            padding: 28,
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "var(--fs-meta)",
          }}
        >
          아직 등록한 펫이 없어요. 우리 아이를 등록하면 매칭을 시작할 수 있어요.
          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              onClick={() => router.push("/settings/pet")}
              style={btnPrimarySm}
            >
              펫 추가하기
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3">
          {pets.map((p, idx) => (
            <div key={p._id} className="pd-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  height: 150,
                  background: "var(--input-bg)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 52,
                  overflow: "hidden",
                }}
              >
                {p.photos?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photos[0].url}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  PET_EMOJI[p.type] || "🐾"
                )}
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div
                  style={{
                    fontSize: "var(--fs-body)",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {p.name}
                  {idx === 0 && (
                    <span
                      style={{
                        display: "inline-flex",
                        fontSize: "var(--fs-nano)",
                        fontWeight: 700,
                        borderRadius: "var(--radius-xs)",
                        padding: "2px 6px",
                        background: "var(--primary-10)",
                        color: "var(--primary)",
                      }}
                    >
                      대표
                    </span>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: "var(--fs-caption)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {[
                    p.breed,
                    typeof p.age === "number" ? `${p.age}살` : undefined,
                    p.sex ? SEX_KO[p.sex] : undefined,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

function SectionTitle({
  children,
  more,
}: {
  children: React.ReactNode;
  more?: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: "var(--fs-h3)",
        fontWeight: 800,
        letterSpacing: "var(--ls-snug)",
        margin: "28px 0 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {children}
      {more}
    </div>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div className="pd-card" style={{ padding: 20 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--primary)" }}>{v}</div>
      <div
        style={{ marginTop: 2, fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}
      >
        {l}
      </div>
    </div>
  );
}

function Quick({
  icon,
  label,
  bg,
  color,
  onClick,
}: {
  icon: IconName;
  label: string;
  bg: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pd-card"
      style={{
        borderRadius: "var(--radius-xl)",
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
        textAlign: "left",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          display: "grid",
          placeItems: "center",
          background: bg,
          color,
        }}
      >
        <Icon name={icon} size={19} fill={icon === "heart" || icon === "paw"} />
      </span>
      <b style={{ fontSize: "var(--fs-body-sm)", fontWeight: 700, color: "var(--text)" }}>
        {label}
      </b>
    </button>
  );
}

const btnPrimarySm: React.CSSProperties = {
  background: "var(--primary)",
  color: "#fff",
  fontSize: "var(--fs-meta)",
  fontWeight: 700,
  borderRadius: "var(--radius-md)",
  padding: "10px 16px",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};
