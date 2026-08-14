"use client";

/** Plan details — walk-invite detail + status actions. */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import { Button, Avatar, Spinner, EmptyState } from "@/components/ui";
import { type Match, type WalkInvite, peerOf, pickPet } from "../../chat/types";

const STATUS: Record<string, string> = {
  proposed: "수락 대기 중",
  confirmed: "확정",
  declined: "거절됨",
  cancelled: "취소됨",
  completed: "완료",
};

const PILL_TONES: Record<string, { bg: string; fg: string }> = {
  proposed: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  confirmed: { bg: "var(--success-soft)", fg: "var(--success)" },
  completed: { bg: "var(--input-bg)", fg: "var(--text-secondary)" },
  declined: { bg: "var(--input-bg)", fg: "var(--text-secondary)" },
  cancelled: { bg: "var(--input-bg)", fg: "var(--text-secondary)" },
};

function Pill({ status }: { status: string }) {
  const t = PILL_TONES[status] || PILL_TONES.completed;
  return (
    <span
      style={{
        fontSize: "var(--fs-micro)",
        fontWeight: 700,
        borderRadius: "var(--radius-pill)",
        padding: "4px 12px",
        background: t.bg,
        color: t.fg,
        whiteSpace: "nowrap",
      }}
    >
      {STATUS[status] || status}
    </span>
  );
}

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: "var(--radius-2xl)",
  boxShadow: "var(--shadow-card)",
  padding: 20,
};
const cardTitleStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "var(--fs-h3)",
  fontWeight: 800,
  color: "var(--text)",
};

/** "HH:MM" → "오전 10:00" */
function fmtTime(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 || 12;
  return `${ampm} ${h12}:${String(Number.isNaN(m) ? 0 : m).padStart(2, "0")}`;
}

/** "2026-08-11" → "8월 11일 (월)" */
function fmtDateKo(date?: string) {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  const wd = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${wd})`;
}

export default function WalkInviteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const [invite, setInvite] = useState<WalkInvite | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get<WalkInvite[]>("/walk-invites"),
      api.get<Match[]>("/matches"),
    ]).then(([inv, mt]) => {
      const found =
        inv.status === "fulfilled" ? (inv.value.data || []).find((i) => i._id === id) || null : null;
      setInvite(found);
      if (found && mt.status === "fulfilled") {
        setMatch((mt.value.data || []).find((m) => m._id === found.match) || null);
      }
      setLoading(false);
    });
  }, [id]);

  const respond = async (status: "confirmed" | "declined" | "cancelled" | "completed") => {
    if (!invite) return;
    setBusy(true);
    try {
      const { data } = await api.patch<WalkInvite>(`/walk-invites/${invite._id}`, { status });
      setInvite(data);
    } catch {}
    setBusy(false);
  };

  if (loading) {
    return (
      <Page title="약속 상세">
        <div className="flex justify-center pt-16" style={{ color: "var(--text-secondary)" }}><Spinner /></div>
      </Page>
    );
  }
  if (!invite) {
    return (
      <Page title="약속 상세">
        <EmptyState emoji="🐾" title="약속을 찾을 수 없어요" action={<Button onClick={() => router.push("/walks")}>산책으로 돌아가기</Button>} />
      </Page>
    );
  }

  const peer = match ? peerOf(match, myId) : undefined;
  const pet = pickPet(peer);

  return (
    <Page
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          약속 상세 <Pill status={invite.status} />
        </span>
      }
      maxWidth={900}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>약속 정보</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            <Info label="날짜 · 시간" value={`${fmtDateKo(invite.date)} ${fmtTime(invite.time)}`} />
            <Info label="장소" value={invite.place || "—"} />
            <Info label="메모" value={invite.note || "—"} />
          </div>
          <div style={{ marginTop: 16 }}>
            <ImagePlaceholder label="지도 미리보기" height={200} />
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>상대 보호자</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar src={peer?.faceUrl} fallbackText={(peer?.name || "보")[0]} size={48} />
            <div>
              <div style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--text)" }}>
                {peer?.name ? `${peer.name} 보호자` : "상대 보호자"}
              </div>
              <div style={{ fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}>
                {pet?.name ? `반려동물 ${pet.name}` : ""}
              </div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ ...cardTitleStyle, margin: "0 0 12px" }}>약속 상태</h2>
          {invite.status === "proposed" ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button disabled={busy} onClick={() => respond("confirmed")}>수락하기</Button>
              <Button variant="secondary" disabled={busy} onClick={() => respond("declined")}>거절하기</Button>
              <Button variant="dangerGhost" disabled={busy} onClick={() => respond("cancelled")}>약속 취소</Button>
            </div>
          ) : invite.status === "confirmed" ? (
            <div>
              <p style={{ margin: "0 0 12px", fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}>
                산책을 마쳤나요? 완료로 표시하면 산책 기록이 자동으로 추가돼요.
              </p>
              <Button disabled={busy} icon="check" onClick={() => respond("completed")}>
                완료로 표시
              </Button>
            </div>
          ) : invite.status === "completed" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
                ✅ 완료된 산책이에요 — 산책 기록이 자동으로 추가되었어요.
              </span>
              <Button variant="secondary" onClick={() => router.push("/walks/records")}>
                기록 보기
              </Button>
            </div>
          ) : (
            <span style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
              이 약속은 {STATUS[invite.status]} 상태예요.
            </span>
          )}
        </div>
      </div>
    </Page>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>{label}</div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginTop: 4 }}>{value}</div>
    </div>
  );
}
