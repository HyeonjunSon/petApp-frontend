"use client";

/** Chat — Offleash v2 restyle (offleash-web scaffold: bubbles = .card radius, invites = .walk-card). Logic in useChat hook. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useChat } from "./useChat";
import { toAbs } from "@/lib/card";
import { peerOf, pickPet, type Match } from "./types";
import { Page } from "@/components/shell/Page";
import {
  Input,
  Textarea,
  Field,
  Sheet,
  Avatar,
  Icon,
} from "@/components/ui";

const STATUS_LABEL: Record<string, string> = {
  proposed: "Pending",
  confirmed: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
};

/* ---- English time/date formatting (display only) ---- */
const timeKo = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-US", {
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
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const dayKo = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        weekday: "long",
      })
    : "";

/** "YYYY-MM-DD" + "HH:MM" → { day: "Fri, Aug 21", clock: "10:00 AM" } */
const inviteParts = (date: string, time: string) => {
  const d = new Date(`${date}T00:00:00`);
  const day = Number.isNaN(d.getTime())
    ? date
    : `${d.toLocaleDateString("en-US", { weekday: "short" })}, ${d.toLocaleDateString("en-US", { month: "short" })} ${d.getDate()}`;
  const [hRaw, mRaw] = (time || "").split(":");
  const h = parseInt(hRaw, 10);
  const clock = Number.isNaN(h)
    ? time
    : `${h % 12 || 12}:${mRaw || "00"} ${h < 12 ? "AM" : "PM"}`;
  return { day, clock };
};

/** "YYYY-MM-DD" + "HH:MM" → "Fri, Aug 21 · 10:00 AM" */
const inviteWhenKo = (date: string, time: string) => {
  const p = inviteParts(date, time);
  return `${p.day} · ${p.clock}`;
};

/** Wireframe naming: "Bori & Minji" */
const convoName = (match: Match, myId: string) => {
  const peer = peerOf(match, myId);
  const pet = pickPet(peer);
  if (pet?.name && peer?.name) return `${pet.name} & ${peer.name}`;
  return pet?.name || peer?.name || "New friend";
};

const iconBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "var(--paper)",
  color: "var(--fence)",
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

  /* Message rows + day separators */
  const rows: React.ReactNode[] = [];
  let lastDay = "";
  c.messages.forEach((m, i) => {
    const day = (m.createdAt || "").slice(0, 10);
    if (day && day !== lastDay) {
      lastDay = day;
      rows.push(
        <span key={`sep-${day}`} className="pill pd-day-sep">
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
            style={{ background: "var(--ink)", color: "var(--paper)", fontSize: 13, alignSelf: "flex-start" }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {!mine && (
            <span
              style={{
                fontSize: "var(--fs-micro)",
                color: "var(--fence)",
                marginLeft: 2,
              }}
            >
              {c.partner?.name || pet?.name || ""}
            </span>
          )}
          <div className={mine ? "pd-bubble me" : "pd-bubble them"}>
            {m.text}
          </div>
        </div>
        <time
          style={{
            fontSize: "var(--fs-nano)",
            color: "var(--fence)",
            whiteSpace: "nowrap",
            marginBottom: 2,
          }}
        >
          {timeKo(m.createdAt)}
        </time>
      </div>
    );
  });

  /* Walk invite card (end of message flow) — v2 signature .walk-card */
  if (c.invite) {
    const inv = c.invite;
    const mine = inv.from === c.myId;
    const when = inviteParts(inv.date, inv.time);
    const ghostBtn: React.CSSProperties = { flex: 1, justifyContent: "center", background: "transparent" };
    const solidBtn: React.CSSProperties = { flex: 1, justifyContent: "center" };
    rows.push(
      <div key={`invite-${inv._id}`} className={mine ? "pd-mrow me" : "pd-mrow"}>
        {!mine && (
          <Avatar
            src={partnerPhoto}
            fallbackText={partnerInitial}
            size={32}
            style={{ background: "var(--ink)", color: "var(--paper)", fontSize: 13, alignSelf: "flex-start" }}
          />
        )}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowInvite(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowInvite(true)}
          className="walk-card"
          style={{ width: 280, cursor: "pointer" }}
        >
          <div
            style={{
              fontSize: "var(--fs-caption)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="cal" size={14} />
            Walk plan
          </div>
          <div className="walk-when" style={{ marginTop: 10 }}>
            {when.clock}
          </div>
          <div className="walk-with">{when.day}</div>
          {inv.place && <div className="walk-where">{inv.place}</div>}
          <div className="post-actions" onClick={(e) => e.stopPropagation()}>
            {inv.status === "confirmed" ? (
              <>
                <button type="button" className="btn btn-ghost btn-sm" style={ghostBtn} onClick={() => c.setScheduleOpen(true)}>
                  Request change
                </button>
                <button type="button" className="btn btn-sm" style={solidBtn} onClick={() => setShowInvite(true)}>
                  Accepted ✓
                </button>
              </>
            ) : mine ? (
              <>
                <button type="button" className="btn btn-ghost btn-sm" style={ghostBtn} onClick={() => c.respond("cancelled")}>
                  Cancel
                </button>
                <button type="button" className="btn btn-sm" style={solidBtn} onClick={() => c.setScheduleOpen(true)}>
                  Request change
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-ghost btn-sm" style={ghostBtn} onClick={() => c.respond("declined")}>
                  Decline
                </button>
                <button type="button" className="btn btn-sm" style={solidBtn} onClick={() => c.respond("confirmed")}>
                  Accept
                </button>
              </>
            )}
          </div>
        </div>
        <time
          style={{
            fontSize: "var(--fs-nano)",
            color: "var(--fence)",
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
    <Page title="Chat" subtitle="Talk with your matches and plan walks.">
      <style dangerouslySetInnerHTML={{ __html: `
        .pd-chatwrap{display:grid;grid-template-columns:320px 1fr;grid-template-rows:minmax(0,1fr);gap:0;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-card);overflow:hidden;height:calc(100dvh - 240px);min-height:380px}
        .pd-chatlist{border-right:1px solid var(--line);overflow-y:auto;min-height:0}
        .pd-chatroom{display:flex;flex-direction:column;background:var(--paper);min-width:0;min-height:0;overflow:hidden}
        .pd-day-sep{align-self:center;margin:8px 0;cursor:default;font-size:var(--fs-micro);color:var(--fence)}
        .pd-mrow{display:flex;align-items:flex-end;gap:8px;max-width:70%}
        .pd-mrow.me{align-self:flex-end;flex-direction:row-reverse}
        .pd-bubble{padding:10px 14px;font-size:var(--fs-body-sm);line-height:var(--lh-normal);word-break:break-word;border-radius:18px}
        .pd-bubble.them{background:var(--surface);border:1px solid var(--line);color:var(--ink);border-bottom-left-radius:4px}
        .pd-bubble.me{background:var(--ink);color:var(--paper);border-bottom-right-radius:4px}
        .pd-chat-back{display:none!important}
        @media (max-width:900px){
          .pd-chatwrap{grid-template-columns:1fr}
          .pd-chatwrap.pd-list-mode .pd-chatroom{display:none}
          .pd-chatwrap:not(.pd-list-mode) .pd-chatlist{display:none}
          .pd-chat-back{display:grid!important}
        }
      ` }} />

      <div className={`pd-chatwrap${c.showListOnMobile ? " pd-list-mode" : ""}`}>
        {/* ---- Left: conversation list ---- */}
        <div className="pd-chatlist pd-scroll">
          <div
            style={{
              padding: "18px 18px 12px",
              fontFamily: "var(--font-display)",
              fontSize: "var(--fs-h3)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
            }}
          >
            Messages
          </div>
          {c.matches.length === 0 ? (
            <div style={{ padding: "28px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 34 }}>💬</div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: "var(--fs-body-sm)",
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                No conversations yet
              </div>
              <p
                style={{
                  margin: "4px 0 14px",
                  fontSize: "var(--fs-caption)",
                  color: "var(--fence)",
                }}
              >
                Match with friends in Discover to start chatting.
              </p>
              <button type="button" className="btn btn-sm" onClick={() => router.push("/discover")}>
                Find friends
              </button>
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
                    background: on ? "var(--paper)" : "transparent",
                  }}
                >
                  <Avatar
                    src={toAbs(mPet?.photos?.[0]?.url) || peer?.faceUrl}
                    fallbackText={(mPet?.name || peer?.name || "?")[0]}
                    size={46}
                    style={{ background: "var(--ink)", color: "var(--paper)", fontSize: 19 }}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b
                      style={{
                        display: "block",
                        fontSize: "var(--fs-body-sm)",
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      {convoName(m, c.myId)}
                    </b>
                    <span
                      style={{
                        display: "block",
                        fontSize: "var(--fs-caption)",
                        color: "var(--fence)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {m.lastMessage?.text || "Say hello!"}
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
                        color: "var(--fence)",
                      }}
                    >
                      {listTimeKo(m.lastMessage?.createdAt)}
                    </time>
                    {!!m.unreadCount && (
                      <span
                        className="tag tag-want"
                        style={{
                          fontSize: "var(--fs-nano)",
                          padding: "2px 7px",
                          minWidth: 18,
                          textAlign: "center",
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

        {/* ---- Right: chat room ---- */}
        <div className="pd-chatroom">
          {!c.current ? (
            <div
              style={{
                flex: 1,
                display: "grid",
                placeItems: "center",
                fontSize: "var(--fs-meta)",
                color: "var(--fence)",
              }}
            >
              Select a conversation
            </div>
          ) : (
            <>
              {/* Chat room header */}
              <div
                style={{
                  background: "var(--surface)",
                  borderBottom: "1px solid var(--line)",
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
                  title="Back to list"
                >
                  <Icon name="back" size={18} />
                </button>
                <Avatar
                  src={partnerPhoto}
                  fallbackText={partnerInitial}
                  size={38}
                  style={{ background: "var(--ink)", color: "var(--paper)", fontSize: 16 }}
                />
                <div style={{ minWidth: 0 }}>
                  <b
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--fs-body)",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      display: "block",
                      color: "var(--ink)",
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
                      color: "var(--fence)",
                    }}
                  >
                    {lastAt ? `Last message ${listTimeKo(lastAt)}` : "New conversation"}
                    {pet?.name ? ` · ${pet.name}` : ""}
                  </span>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    style={iconBtn}
                    title="Walk plan"
                    onClick={() => (c.invite ? setShowInvite(true) : c.setScheduleOpen(true))}
                  >
                    <Icon name="cal" size={17} />
                  </button>
                  <button
                    type="button"
                    style={iconBtn}
                    title="Report / Block"
                    onClick={() => setSafety(true)}
                  >
                    <Icon name="flag" size={17} />
                  </button>
                </div>
              </div>

              {/* Messages area */}
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
                      color: "var(--fence)",
                    }}
                  >
                    Say hello!
                  </div>
                ) : (
                  rows
                )}
              </div>

              {/* composer */}
              <div
                style={{
                  background: "var(--surface)",
                  borderTop: "1px solid var(--line)",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  title="Create walk plan"
                  className="pill"
                  onClick={() => c.setScheduleOpen(true)}
                  style={{ width: 38, height: 38, padding: 0, justifyContent: "center", flexShrink: 0 }}
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
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: 42,
                    border: 0,
                    borderRadius: 999,
                    background: "var(--paper)",
                    padding: "0 18px",
                    fontSize: "var(--fs-body-sm)",
                    outline: "none",
                    color: "var(--ink)",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={c.send}
                  title="Send"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    background: "var(--ink)",
                    color: "var(--paper)",
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

      {/* Create walk plan sheet */}
      <Sheet open={c.scheduleOpen} onClose={() => c.setScheduleOpen(false)} title="Create walk plan" desktop>
        <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Start time">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Place">
            <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Yeouido Hangang Park, Parking Lot 2" />
          </Field>
          <Field label="Note">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <button
            type="button"
            className="btn"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={!date || !time}
            onClick={submitSchedule}
          >
            Send plan
          </button>
        </div>
      </Sheet>

      {/* Walk plan detail sheet */}
      <Sheet open={showInvite && !!c.invite} onClose={() => setShowInvite(false)} title="Walk plan" desktop>
        {c.invite && (
          <div style={{ padding: "8px 20px 20px" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--fs-h2)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              {inviteWhenKo(c.invite.date, c.invite.time)}
            </div>
            {c.invite.place && (
              <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--fence)", marginTop: 6 }}>
                {c.invite.place}
              </div>
            )}
            {c.invite.note && (
              <p style={{ fontSize: "var(--fs-body-sm)", color: "var(--fence)", marginTop: 10 }}>
                {c.invite.note}
              </p>
            )}
            <div style={{ marginTop: 12 }}>
              <span className={c.invite.status === "confirmed" ? "tag tag-want" : "tag"}>
                {STATUS_LABEL[c.invite.status] || c.invite.status}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <button type="button" className="btn" onClick={() => { c.respond("confirmed"); setShowInvite(false); }}>
                Accept
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { c.respond("declined"); setShowInvite(false); }}>
                Decline
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ color: "var(--collar)", borderColor: "var(--collar)" }}
                onClick={() => { c.respond("cancelled"); setShowInvite(false); }}
              >
                Cancel plan
              </button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Report / Block sheet */}
      <Sheet open={safety} onClose={() => setSafety(false)} title="Report / Block" desktop>
        <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <button
            type="button"
            className="btn btn-danger"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={block}
          >
            Block this user
          </button>
          <Field label="Reason">
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Tell us why you're reporting this user"
            />
          </Field>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={!reportText.trim()}
            onClick={report}
          >
            Submit report
          </button>
        </div>
      </Sheet>
    </Page>
  );
}
