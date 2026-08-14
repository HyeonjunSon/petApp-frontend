"use client";

/** Chat — 시안(petdate-website.html #page-chat) 2컬럼 레이아웃. Logic in useChat hook. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useChat } from "./useChat";
import { toAbs } from "@/lib/card";
import { peerOf, pickPet, type Match } from "./types";
import { Page } from "@/components/shell/Page";
import {
  Button,
  Input,
  Textarea,
  Field,
  Sheet,
  Avatar,
  Icon,
} from "@/components/ui";

const STATUS_LABEL: Record<string, string> = {
  proposed: "대기 중",
  confirmed: "수락됨",
  declined: "거절됨",
  cancelled: "취소됨",
  completed: "완료",
};

/* ---- 한국어 시간/날짜 포맷 (표시 전용) ---- */
const timeKo = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const listTimeKo = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return sameDay
    ? timeKo(iso)
    : d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
};

const dayKo = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    : "";

/** "YYYY-MM-DD" + "HH:MM" → "8월 11일 (월) 오전 10:00" */
const inviteWhenKo = (date: string, time: string) => {
  const d = new Date(`${date}T00:00:00`);
  const day = Number.isNaN(d.getTime())
    ? date
    : `${d.getMonth() + 1}월 ${d.getDate()}일 (${d.toLocaleDateString("ko-KR", { weekday: "short" })})`;
  const [hRaw, mRaw] = (time || "").split(":");
  const h = parseInt(hRaw, 10);
  if (Number.isNaN(h)) return `${day} ${time}`;
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 || 12;
  return `${day} ${ampm} ${h12}:${mRaw || "00"}`;
};

/** 시안 표기: "보리네 (김민지)" */
const convoName = (match: Match, myId: string) => {
  const peer = peerOf(match, myId);
  const pet = pickPet(peer);
  if (pet?.name && peer?.name) return `${pet.name}네 (${peer.name})`;
  return pet?.name || peer?.name || "새 친구";
};

const iconBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "var(--radius-pill)",
  background: "var(--input-bg)",
  color: "var(--text-secondary)",
  display: "grid",
  placeItems: "center",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  flexShrink: 0,
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

  const msgsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [c.messages.length, c.current, c.invite]);

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

  const pet = c.partnerPet;
  const partnerPhoto = toAbs(pet?.photos?.[0]?.url) || c.partner?.faceUrl;
  const partnerInitial = (pet?.name || c.partner?.name || "?")[0];
  const lastAt = c.messages[c.messages.length - 1]?.createdAt;
  const roomTitle = c.matches.find((m) => m._id === c.current)
    ? convoName(c.matches.find((m) => m._id === c.current)!, c.myId)
    : "";

  /* 메시지 + 날짜 구분선 rows */
  const rows: React.ReactNode[] = [];
  let lastDay = "";
  c.messages.forEach((m, i) => {
    const day = (m.createdAt || "").slice(0, 10);
    if (day && day !== lastDay) {
      lastDay = day;
      rows.push(
        <span key={`sep-${day}`} className="pd-day-sep">
          {dayKo(m.createdAt)}
        </span>
      );
    }
    const mine = m.from === c.myId;
    rows.push(
      <div key={m._id || i} className={mine ? "pd-mrow me" : "pd-mrow"}>
        {!mine && (
          <Avatar
            src={partnerPhoto}
            fallbackText={partnerInitial}
            size={32}
            style={{ background: "var(--primary)", fontSize: 13, alignSelf: "flex-start" }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {!mine && (
            <span
              style={{
                fontSize: "var(--fs-micro)",
                color: "var(--text-secondary)",
                marginLeft: 2,
              }}
            >
              {c.partner?.name || pet?.name || ""}
            </span>
          )}
          <div
            style={{
              background: mine ? "var(--primary)" : "var(--surface)",
              color: mine ? "var(--white)" : "var(--text)",
              borderRadius: "var(--radius-3xl)",
              borderBottomLeftRadius: mine ? "var(--radius-3xl)" : 4,
              borderBottomRightRadius: mine ? 4 : "var(--radius-3xl)",
              boxShadow: mine ? undefined : "var(--shadow-card)",
              padding: "10px 14px",
              fontSize: "var(--fs-body-sm)",
              lineHeight: "var(--lh-normal)",
              wordBreak: "break-word",
            }}
          >
            {m.text}
          </div>
        </div>
        <time
          style={{
            fontSize: "var(--fs-nano)",
            color: "var(--text-secondary)",
            whiteSpace: "nowrap",
            marginBottom: 2,
          }}
        >
          {timeKo(m.createdAt)}
        </time>
      </div>
    );
  });

  /* 산책 초대 카드 (메시지 흐름 끝) */
  if (c.invite) {
    const inv = c.invite;
    const mine = inv.from === c.myId;
    const ghost: React.CSSProperties = {
      flex: 1,
      height: 36,
      borderRadius: "var(--radius-md)",
      fontSize: "var(--fs-meta)",
      fontWeight: 700,
      border: "none",
      cursor: "pointer",
      fontFamily: "inherit",
      background: "var(--input-bg)",
      color: "var(--text-secondary)",
    };
    const solid: React.CSSProperties = {
      ...ghost,
      background: "var(--primary)",
      color: "var(--white)",
    };
    rows.push(
      <div key={`invite-${inv._id}`} className={mine ? "pd-mrow me" : "pd-mrow"}>
        {!mine && (
          <Avatar
            src={partnerPhoto}
            fallbackText={partnerInitial}
            size={32}
            style={{ background: "var(--primary)", fontSize: 13, alignSelf: "flex-start" }}
          />
        )}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowInvite(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowInvite(true)}
          style={{
            background: "var(--surface)",
            borderRadius: "var(--radius-2xl)",
            boxShadow: "var(--shadow-card)",
            padding: 14,
            width: 260,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              fontSize: "var(--fs-caption)",
              fontWeight: 800,
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="cal" size={14} />
            산책 약속
          </div>
          <div
            style={{
              margin: "8px 0 10px",
              fontSize: "var(--fs-body-sm)",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {inviteWhenKo(inv.date, inv.time)}
            {inv.place && (
              <span
                style={{
                  display: "block",
                  fontSize: "var(--fs-caption)",
                  fontWeight: 400,
                  color: "var(--text-secondary)",
                  marginTop: 2,
                }}
              >
                {inv.place}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
            {inv.status === "confirmed" ? (
              <>
                <button type="button" style={ghost} onClick={() => c.setScheduleOpen(true)}>
                  변경 요청
                </button>
                <button type="button" style={solid} onClick={() => setShowInvite(true)}>
                  수락됨 ✓
                </button>
              </>
            ) : mine ? (
              <>
                <button type="button" style={ghost} onClick={() => c.respond("cancelled")}>
                  취소
                </button>
                <button type="button" style={solid} onClick={() => c.setScheduleOpen(true)}>
                  변경 요청
                </button>
              </>
            ) : (
              <>
                <button type="button" style={ghost} onClick={() => c.respond("declined")}>
                  거절
                </button>
                <button type="button" style={solid} onClick={() => c.respond("confirmed")}>
                  수락
                </button>
              </>
            )}
          </div>
        </div>
        <time
          style={{
            fontSize: "var(--fs-nano)",
            color: "var(--text-secondary)",
            whiteSpace: "nowrap",
            marginBottom: 2,
          }}
        >
          {timeKo(inv.createdAt)}
        </time>
      </div>
    );
  }

  return (
    <Page title="채팅" subtitle="매칭된 친구들과 대화하고 약속을 잡아요.">
      <style>{`
        .pd-chatwrap{display:grid;grid-template-columns:320px 1fr;gap:0;background:var(--surface);border-radius:var(--radius-2xl);box-shadow:var(--shadow-card);overflow:hidden;height:calc(100vh - 180px);min-height:520px}
        .pd-chatlist{border-right:1px solid var(--border);overflow-y:auto}
        .pd-chatroom{display:flex;flex-direction:column;background:var(--background);min-width:0}
        .pd-day-sep{align-self:center;background:rgba(0,0,0,.06);color:var(--text-secondary);font-size:var(--fs-micro);border-radius:var(--radius-pill);padding:4px 14px;margin:8px 0}
        .pd-mrow{display:flex;align-items:flex-end;gap:8px;max-width:70%}
        .pd-mrow.me{align-self:flex-end;flex-direction:row-reverse}
        .pd-chat-back{display:none!important}
        @media (max-width:900px){
          .pd-chatwrap{grid-template-columns:1fr}
          .pd-chatwrap.pd-list-mode .pd-chatroom{display:none}
          .pd-chatwrap:not(.pd-list-mode) .pd-chatlist{display:none}
          .pd-chat-back{display:grid!important}
        }
      `}</style>

      <div className={`pd-chatwrap${c.showListOnMobile ? " pd-list-mode" : ""}`}>
        {/* ---- 좌측: 대화 리스트 ---- */}
        <div className="pd-chatlist pd-scroll">
          <div
            style={{
              padding: "18px 18px 12px",
              fontSize: "var(--fs-h3)",
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            메시지
          </div>
          {c.matches.length === 0 ? (
            <div style={{ padding: "28px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 34 }}>💬</div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: "var(--fs-body-sm)",
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                아직 대화가 없어요
              </div>
              <p
                style={{
                  margin: "4px 0 14px",
                  fontSize: "var(--fs-caption)",
                  color: "var(--text-secondary)",
                }}
              >
                디스커버에서 친구를 만나면 채팅이 시작돼요.
              </p>
              <Button size="sm" onClick={() => router.push("/discover")}>
                친구 찾으러 가기
              </Button>
            </div>
          ) : (
            c.matches.map((m) => {
              const peer = peerOf(m, c.myId);
              const mPet = pickPet(peer);
              const on = m._id === c.current;
              return (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => c.openChat(m._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 18px",
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    background: on ? "var(--primary-10)" : "transparent",
                  }}
                >
                  <Avatar
                    src={toAbs(mPet?.photos?.[0]?.url) || peer?.faceUrl}
                    fallbackText={(mPet?.name || peer?.name || "?")[0]}
                    size={46}
                    style={{ background: "var(--primary)", fontSize: 19 }}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b
                      style={{
                        display: "block",
                        fontSize: "var(--fs-body-sm)",
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      {convoName(m, c.myId)}
                    </b>
                    <span
                      style={{
                        display: "block",
                        fontSize: "var(--fs-caption)",
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {m.lastMessage?.text || "대화를 시작해보세요"}
                    </span>
                  </span>
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <time
                      style={{
                        fontSize: "var(--fs-micro)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {listTimeKo(m.lastMessage?.createdAt)}
                    </time>
                    {!!m.unreadCount && (
                      <span
                        style={{
                          background: "var(--danger)",
                          color: "var(--white)",
                          fontSize: "var(--fs-nano)",
                          fontWeight: 700,
                          borderRadius: "var(--radius-pill)",
                          minWidth: 18,
                          height: 18,
                          display: "grid",
                          placeItems: "center",
                          padding: "0 5px",
                        }}
                      >
                        {m.unreadCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* ---- 우측: 대화방 ---- */}
        <div className="pd-chatroom">
          {!c.current ? (
            <div
              style={{
                flex: 1,
                display: "grid",
                placeItems: "center",
                fontSize: "var(--fs-meta)",
                color: "var(--text-secondary)",
              }}
            >
              대화를 선택해주세요
            </div>
          ) : (
            <>
              {/* 대화방 헤더 */}
              <div
                style={{
                  background: "var(--surface)",
                  borderBottom: "1px solid var(--border)",
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  className="pd-chat-back"
                  style={iconBtn}
                  onClick={c.backToList}
                  title="목록으로"
                >
                  <Icon name="back" size={18} />
                </button>
                <Avatar
                  src={partnerPhoto}
                  fallbackText={partnerInitial}
                  size={38}
                  style={{ background: "var(--primary)", fontSize: 16 }}
                />
                <div style={{ minWidth: 0 }}>
                  <b
                    style={{
                      fontSize: "var(--fs-body)",
                      fontWeight: 700,
                      display: "block",
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {roomTitle}
                  </b>
                  <span
                    style={{
                      fontSize: "var(--fs-caption)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {lastAt ? `마지막 메시지 ${listTimeKo(lastAt)}` : "새로운 대화"}
                    {pet?.name ? ` · ${pet.name}` : ""}
                  </span>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    style={iconBtn}
                    title="산책 약속"
                    onClick={() => (c.invite ? setShowInvite(true) : c.setScheduleOpen(true))}
                  >
                    <Icon name="cal" size={17} />
                  </button>
                  <button
                    type="button"
                    style={iconBtn}
                    title="신고 / 차단"
                    onClick={() => setSafety(true)}
                  >
                    <Icon name="flag" size={17} />
                  </button>
                </div>
              </div>

              {/* 메시지 영역 */}
              <div
                ref={msgsRef}
                className="pd-scroll"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {rows.length === 0 ? (
                  <div
                    style={{
                      margin: "auto",
                      fontSize: "var(--fs-meta)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    대화를 시작해보세요!
                  </div>
                ) : (
                  rows
                )}
              </div>

              {/* composer */}
              <div
                style={{
                  background: "var(--surface)",
                  borderTop: "1px solid var(--border)",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  title="산책 약속 만들기"
                  onClick={() => c.setScheduleOpen(true)}
                  style={{ ...iconBtn, width: 36, height: 36 }}
                >
                  <Icon name="plus" size={18} />
                </button>
                <input
                  value={c.text}
                  onChange={(e) => c.setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      c.send();
                    }
                  }}
                  placeholder="메시지 입력..."
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: 42,
                    border: 0,
                    borderRadius: "var(--radius-pill)",
                    background: "var(--input-bg)",
                    padding: "0 18px",
                    fontSize: "var(--fs-body-sm)",
                    outline: "none",
                    color: "var(--text)",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={c.send}
                  title="전송"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "var(--radius-pill)",
                    background: "var(--primary)",
                    color: "var(--white)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 18,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    flexShrink: 0,
                    opacity: c.sending ? 0.6 : 1,
                  }}
                >
                  ↑
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 산책 약속 만들기 sheet */}
      <Sheet open={c.scheduleOpen} onClose={() => c.setScheduleOpen(false)} title="산책 약속 만들기" desktop>
        <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="날짜">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="시작 시간">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="장소">
            <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="여의도 한강공원 2주차장 앞" />
          </Field>
          <Field label="메모">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <Button fullWidth size="lg" disabled={!date || !time} onClick={submitSchedule}>
            약속 보내기
          </Button>
        </div>
      </Sheet>

      {/* 산책 약속 상세 sheet */}
      <Sheet open={showInvite && !!c.invite} onClose={() => setShowInvite(false)} title="산책 약속" desktop>
        {c.invite && (
          <div style={{ padding: "8px 20px 20px" }}>
            <div style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--text)" }}>
              {inviteWhenKo(c.invite.date, c.invite.time)}
            </div>
            {c.invite.place && (
              <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)", marginTop: 6 }}>
                {c.invite.place}
              </div>
            )}
            {c.invite.note && (
              <p style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)", marginTop: 10 }}>
                {c.invite.note}
              </p>
            )}
            <div style={{ marginTop: 12 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 22,
                  padding: "0 10px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "var(--fs-micro)",
                  fontWeight: 700,
                  background: "var(--primary-10)",
                  color: "var(--primary)",
                }}
              >
                {STATUS_LABEL[c.invite.status] || c.invite.status}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <Button onClick={() => { c.respond("confirmed"); setShowInvite(false); }}>수락</Button>
              <Button variant="secondary" onClick={() => { c.respond("declined"); setShowInvite(false); }}>
                거절
              </Button>
              <Button variant="dangerGhost" onClick={() => { c.respond("cancelled"); setShowInvite(false); }}>
                약속 취소
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      {/* 신고 / 차단 sheet */}
      <Sheet open={safety} onClose={() => setSafety(false)} title="신고 / 차단" desktop>
        <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Button variant="danger" fullWidth onClick={block}>
            이 사용자 차단하기
          </Button>
          <Field label="신고 사유">
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="신고 사유를 입력해주세요"
            />
          </Field>
          <Button variant="secondary" fullWidth disabled={!reportText.trim()} onClick={report}>
            신고 접수
          </Button>
        </div>
      </Sheet>
    </Page>
  );
}
