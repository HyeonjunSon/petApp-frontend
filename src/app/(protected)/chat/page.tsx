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
  proposed: "Pending",
  confirmed: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
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
          title="Pick a match to chat with"
          desc="Tap Chat in your matches to start a conversation."
          action={<Button onClick={() => router.push("/matches")}>Back to Matches</Button>}
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
            {c.partnerTitle || "Conversation"}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>
            {lastAt ? `Last message ${formatTime(lastAt)}` : "New conversation"}
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
            Report/Block
          </button>
          <Button onClick={() => (c.invite ? setShowInvite(true) : c.setScheduleOpen(true))}>
            View walk plan
          </Button>
        </div>
      </div>

      <div
        className="pd-detail-grid"
        style={{ display: "grid", gridTemplateColumns: "300px minmax(0,1fr)", gap: 20, alignItems: "start" }}
      >
        {/* pet profile card */}
        <UICard>
          <ImagePlaceholder src={petPhoto || undefined} label={`${c.partnerPet?.name || "Pet"} profile`} height={180} />
          <div style={{ marginTop: 14, fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
            {c.partnerPet?.name || c.partner?.name || "Pet"}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>
            Owner {c.partner?.name || "—"}
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
            View full profile
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
                🐾 Walk plan · {c.invite.date} {c.invite.time}{" "}
                <Badge tone="brand">{STATUS_LABEL[c.invite.status] || c.invite.status}</Badge>
              </span>
              <Button size="sm" variant="secondary" onClick={() => setShowInvite(true)}>
                Details
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
                Start the conversation!
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
                      fallbackText={mine ? "Me" : (c.partnerPet?.name || c.partner?.name || "")[0] || "?"}
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
            <Field label="Type a message">
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
                  placeholder="Message"
                />
                <Button variant="secondary" onClick={() => c.setScheduleOpen(true)}>
                  Plan a walk
                </Button>
                <Button onClick={c.send} loading={c.sending}>
                  Send
                </Button>
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* schedule sheet */}
      <Sheet open={c.scheduleOpen} onClose={() => c.setScheduleOpen(false)} title="Plan a walk" desktop>
        <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Start time">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Place">
            <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Han River Park entrance" />
          </Field>
          <Field label="Note">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <Button fullWidth size="lg" disabled={!date || !time} onClick={submitSchedule}>
            Send plan
          </Button>
        </div>
      </Sheet>

      {/* invite detail sheet */}
      <Sheet open={showInvite && !!c.invite} onClose={() => setShowInvite(false)} title="Walk plan" desktop>
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
              <Button onClick={() => { c.respond("confirmed"); setShowInvite(false); }}>Accept</Button>
              <Button variant="secondary" onClick={() => { c.respond("declined"); setShowInvite(false); }}>Decline</Button>
              <Button variant="dangerGhost" onClick={() => { c.respond("cancelled"); setShowInvite(false); }}>Cancel</Button>
            </div>
          </div>
        )}
      </Sheet>

      {/* safety sheet */}
      <Sheet open={safety} onClose={() => setSafety(false)} title="Report / Block" desktop>
        <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <Button variant="danger" fullWidth onClick={block}>
            Block this user
          </Button>
          <Field label="Reason">
            <Textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Describe the reason" />
          </Field>
          <Button variant="secondary" fullWidth disabled={!reportText.trim()} onClick={report}>
            Submit report
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
