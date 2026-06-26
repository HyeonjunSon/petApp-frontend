"use client";

/** Chat — single conversation view (wireframe). Logic in useChat hook. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useChat } from "./useChat";
import { toAbs } from "@/lib/card";
import { formatTime } from "./types";
import { ImagePlaceholder } from "@/components/shell/Page";
import {
  Card as UICard,
  Button,
  Input,
  Textarea,
  Field,
  Sheet,
  Avatar,
  Badge,
  EmptyState,
} from "@/components/ui";

const STATUS_LABEL: Record<string, string> = {
  proposed: "대기 중",
  confirmed: "수락됨",
  declined: "거절됨",
  cancelled: "취소됨",
};

export default function ChatPage() {
  const router = useRouter();
  const c = useChat();
  const [safety, setSafety] = useState(false);
  const [reportText, setReportText] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");

  if (!c.current) {
    return (
      <div style={{ padding: "48px 24px" }}>
        <EmptyState
          emoji="💬"
          title="대화할 매칭을 선택해 주세요"
          desc="매칭 목록에서 채팅하기를 눌러 대화를 시작하세요."
          action={<Button onClick={() => router.push("/matches")}>매칭 목록으로</Button>}
        />
      </div>
    );
  }

  const petPhoto = toAbs(c.partnerPet?.photos?.[0]?.url);
  const lastAt = c.messages[c.messages.length - 1]?.createdAt;

  const submitSchedule = async () => {
    if (!date || !time) return;
    await c.sendInvite({ date, time, place: place || undefined, note: note || undefined });
    setDate(""); setTime(""); setPlace(""); setNote("");
  };

  const block = async () => {
    const targetId = (c.partner as any)?._id;
    if (!targetId) return;
    try {
      await api.post("/blocks", { targetId });
    } catch {}
    setSafety(false);
    router.push("/matches");
  };

  const report = async () => {
    const targetId = (c.partner as any)?._id;
    if (!targetId || !reportText.trim()) return;
    try {
      await api.post("/reports", { targetId, category: "other", reason: reportText.trim() });
    } catch {}
    setReportText("");
    setSafety(false);
  };

  return (
    <div style={{ padding: "28px 40px 56px" }}>
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>
            {c.partnerTitle || "대화"}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>
            {lastAt ? `${formatTime(lastAt)}에 마지막 메시지` : "새로운 대화"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            type="button"
            onClick={() => setSafety(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              color: "var(--ink-soft)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            신고/차단
          </button>
          <Button onClick={() => (c.invite ? setShowInvite(true) : c.setScheduleOpen(true))}>
            산책 약속 보기
          </Button>
        </div>
      </div>

      <div
        className="pd-detail-grid"
        style={{ display: "grid", gridTemplateColumns: "300px minmax(0,1fr)", gap: 20, alignItems: "start" }}
      >
        {/* pet profile card */}
        <UICard>
          <ImagePlaceholder src={petPhoto || undefined} label={`${c.partnerPet?.name || "펫"} 프로필`} height={180} />
          <div style={{ marginTop: 14, fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
            {c.partnerPet?.name || c.partner?.name || "반려동물"}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>
            보호자 {c.partner?.name || "—"}
          </p>
          <button
            type="button"
            onClick={() => router.push("/discover")}
            style={{
              marginTop: 14,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--brand-strong)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            전체 프로필 보기
          </button>
        </UICard>

        {/* conversation */}
        <div>
          {c.invite && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 14,
                background: "var(--brand-tint)",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--ink)" }}>
                🐾 산책 약속 · {c.invite.date} {c.invite.time}{" "}
                <Badge tone="brand">{STATUS_LABEL[c.invite.status] || c.invite.status}</Badge>
              </span>
              <Button size="sm" variant="secondary" onClick={() => setShowInvite(true)}>
                상세
              </Button>
            </div>
          )}

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--r-card)",
              padding: 16,
              minHeight: 280,
              maxHeight: "52vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
            className="pd-scroll"
          >
            {c.messages.length === 0 ? (
              <div style={{ margin: "auto", fontSize: 13, color: "var(--ink-faint)" }}>
                대화를 시작해보세요!
              </div>
            ) : (
              c.messages.map((m, i) => {
                const mine = m.from === c.myId;
                return (
                  <div
                    key={m._id || i}
                    style={{
                      display: "flex",
                      gap: 10,
                      flexDirection: mine ? "row-reverse" : "row",
                      alignItems: "flex-end",
                    }}
                  >
                    <Avatar
                      src={mine ? undefined : c.partner?.faceUrl}
                      fallbackText={mine ? "나" : (c.partnerPet?.name || c.partner?.name || "")[0] || "?"}
                      size={28}
                      style={{ fontSize: 11 }}
                    />
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "10px 14px",
                        borderRadius: 14,
                        fontSize: 14,
                        lineHeight: 1.5,
                        background: mine ? "var(--brand)" : "var(--surface-2)",
                        color: mine ? "#fff" : "var(--ink)",
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <Field label="메시지를 입력하세요">
              <div style={{ display: "flex", gap: 10 }}>
                <Input
                  value={c.text}
                  onChange={(e) => c.setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      c.send();
                    }
                  }}
                  placeholder="메시지"
                />
                <Button variant="secondary" onClick={() => c.setScheduleOpen(true)}>
                  약속 잡기
                </Button>
                <Button onClick={c.send} loading={c.sending}>
                  전송
                </Button>
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* schedule sheet */}
      <Sheet open={c.scheduleOpen} onClose={() => c.setScheduleOpen(false)} title="산책 약속 잡기" desktop>
        <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="날짜">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="시작 시간">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="장소">
            <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="한강공원 입구" />
          </Field>
          <Field label="메모">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <Button fullWidth size="lg" disabled={!date || !time} onClick={submitSchedule}>
            약속 제안하기
          </Button>
        </div>
      </Sheet>

      {/* invite detail sheet */}
      <Sheet open={showInvite && !!c.invite} onClose={() => setShowInvite(false)} title="산책 약속" desktop>
        {c.invite && (
          <div style={{ padding: "8px 20px 20px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
              {c.invite.date} {c.invite.time}
            </div>
            {c.invite.place && (
              <div style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 6 }}>
                {c.invite.place}
              </div>
            )}
            {c.invite.note && (
              <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 10 }}>{c.invite.note}</p>
            )}
            <div style={{ marginTop: 12 }}>
              <Badge tone="brand">{STATUS_LABEL[c.invite.status] || c.invite.status}</Badge>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <Button onClick={() => { c.respond("confirmed"); setShowInvite(false); }}>수락</Button>
              <Button variant="secondary" onClick={() => { c.respond("declined"); setShowInvite(false); }}>거절</Button>
              <Button variant="dangerGhost" onClick={() => { c.respond("cancelled"); setShowInvite(false); }}>취소</Button>
            </div>
          </div>
        )}
      </Sheet>

      {/* safety sheet */}
      <Sheet open={safety} onClose={() => setSafety(false)} title="신고 / 차단" desktop>
        <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Button variant="danger" fullWidth onClick={block}>
            이 사용자 차단하기
          </Button>
          <Field label="신고 사유">
            <Textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="신고 사유를 적어주세요" />
          </Field>
          <Button variant="secondary" fullWidth disabled={!reportText.trim()} onClick={report}>
            신고 제출
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
