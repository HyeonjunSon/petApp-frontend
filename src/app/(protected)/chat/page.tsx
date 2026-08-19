"use client";

/** Chat — 2-column layout from the wireframe (petdate-website.html #page-chat). Logic in useChat hook. */

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

/** "YYYY-MM-DD" + "HH:MM" → "Fri, Aug 21 · 10:00 AM" */
const inviteWhenKo = (date: string, time: string) => {
  const d = new Date(`${date}T00:00:00`);
  const day = Number.isNaN(d.getTime())
    ? date
    : `${d.toLocaleDateString("en-US", { weekday: "short" })}, ${d.toLocaleDateString("en-US", { month: "short" })} ${d.getDate()}`;
  const [hRaw, mRaw] = (time || "").split(":");
  const h = parseInt(hRaw, 10);
  if (Number.isNaN(h)) return `${day} ${time}`;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${day} · ${h12}:${mRaw || "00"} ${ampm}`;
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

  /* Message rows + day separators */
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

  /* Walk invite card (end of message flow) */
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
            Walk plan
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
                  Request change
                </button>
                <button type="button" style={solid} onClick={() => setShowInvite(true)}>
                  Accepted ✓
                </button>
              </>
            ) : mine ? (
              <>
                <button type="button" style={ghost} onClick={() => c.respond("cancelled")}>
                  Cancel
                </button>
                <button type="button" style={solid} onClick={() => c.setScheduleOpen(true)}>
                  Request change
                </button>
              </>
            ) : (
              <>
                <button type="button" style={ghost} onClick={() => c.respond("declined")}>
                  Decline
                </button>
                <button type="button" style={solid} onClick={() => c.respond("confirmed")}>
                  Accept
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
    <Page title="Chat" subtitle="Talk with your matches and plan walks.">
      <style dangerouslySetInnerHTML={{ __html: `
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
      ` }} />

      <div className={`pd-chatwrap${c.showListOnMobile ? " pd-list-mode" : ""}`}>
        {/* ---- Left: conversation list ---- */}
        <div className="pd-chatlist pd-scroll">
          <div
            style={{
              padding: "18px 18px 12px",
              fontSize: "var(--fs-h3)",
              fontWeight: 800,
              color: "var(--text)",
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
                  fontWeight: 700,
                  color: "var(--text)",
                }}
              >
                No conversations yet
              </div>
              <p
                style={{
                  margin: "4px 0 14px",
                  fontSize: "var(--fs-caption)",
                  color: "var(--text-secondary)",
                }}
              >
                Match with friends in Discover to start chatting.
              </p>
              <Button size="sm" onClick={() => router.push("/discover")}>
                Find friends
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

        {/* ---- Right: chat room ---- */}
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
              Select a conversation
            </div>
          ) : (
            <>
              {/* Chat room header */}
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
                  title="Back to list"
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
                      color: "var(--text-secondary)",
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
                  borderTop: "1px solid var(--border)",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  title="Create walk plan"
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
                  placeholder="Type a message..."
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
                  title="Send"
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
          <Button fullWidth size="lg" disabled={!date || !time} onClick={submitSchedule}>
            Send plan
          </Button>
        </div>
      </Sheet>

      {/* Walk plan detail sheet */}
      <Sheet open={showInvite && !!c.invite} onClose={() => setShowInvite(false)} title="Walk plan" desktop>
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
              <Button onClick={() => { c.respond("confirmed"); setShowInvite(false); }}>Accept</Button>
              <Button variant="secondary" onClick={() => { c.respond("declined"); setShowInvite(false); }}>
                Decline
              </Button>
              <Button variant="dangerGhost" onClick={() => { c.respond("cancelled"); setShowInvite(false); }}>
                Cancel plan
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Report / Block sheet */}
      <Sheet open={safety} onClose={() => setSafety(false)} title="Report / Block" desktop>
        <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Button variant="danger" fullWidth onClick={block}>
            Block this user
          </Button>
          <Field label="Reason">
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Tell us why you're reporting this user"
            />
          </Field>
          <Button variant="secondary" fullWidth disabled={!reportText.trim()} onClick={report}>
            Submit report
          </Button>
        </div>
      </Sheet>
    </Page>
  );
}
