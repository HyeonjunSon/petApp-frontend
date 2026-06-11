"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { api } from "@/lib/api";
import { Badge, Button, Field, Icon, Input, Sheet, Textarea, cx } from "@/components/ui";

type Pet = { _id: string; name?: string };
type User = { _id: string; name?: string; pets?: Pet[]; ownedPets?: Pet[] };

type Match = {
  _id: string;
  users: User[];
  lastMessage?: { text?: string; createdAt?: string; from?: string };
  unreadCount?: number;
};

type Message = {
  _id?: string;
  from?: string;
  text: string;
  createdAt?: string;
  match?: string;
  clientTempId?: string;
  seenBy?: string[];
};

export default function ChatPage() {
  const [myId, setMyId] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // walk invites
  type WalkInvite = {
    _id: string; from: string; to: string; match: string;
    date: string; time: string; place?: string; note?: string;
    status: "proposed" | "confirmed" | "declined" | "cancelled";
    createdAt?: string;
  };
  const [invite, setInvite] = useState<WalkInvite | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [invDate, setInvDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [invTime, setInvTime] = useState<string>("10:00");
  const [invPlace, setInvPlace] = useState("");
  const [invNote, setInvNote] = useState("");
  const [invSending, setInvSending] = useState(false);

  const loadActiveInvite = async (matchId: string) => {
    try {
      const { data } = await api.get<WalkInvite[]>("/walk-invites");
      const active = data.find(
        (i) => i.match === matchId && (i.status === "proposed" || i.status === "confirmed")
      );
      setInvite(active || null);
    } catch { setInvite(null); }
  };

  const sendInvite = async () => {
    if (!current || !invDate || !invTime) return;
    setInvSending(true);
    try {
      const { data } = await api.post<WalkInvite>(`/matches/${current}/walk-invite`, {
        date: invDate, time: invTime, place: invPlace, note: invNote,
      });
      setInvite(data);
      setScheduleOpen(false);
      setInvPlace(""); setInvNote("");
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to send invite");
    } finally {
      setInvSending(false);
    }
  };

  const respondInvite = async (status: "confirmed" | "declined" | "cancelled") => {
    if (!invite) return;
    try {
      const { data } = await api.patch<WalkInvite>(`/walk-invites/${invite._id}`, { status });
      setInvite(data.status === "proposed" || data.status === "confirmed" ? data : null);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to update invite");
    }
  };

  const listRef = useRef<HTMLDivElement>(null);

  // load self
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ _id: string }>("/users/me");
        setMyId(data?._id || "");
      } catch {}
    })();
  }, []);

  // load matches (+ honor ?open=<matchId>)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Match[]>("/matches");
        setMatches(data);
        const openId =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("open")
            : null;
        const wanted = openId && data.some((m) => m._id === openId) ? openId : data[0]?._id;
        if (wanted) setCurrent(wanted);
      } catch (e) {
        console.error("GET /matches failed", e);
      }
    })();
  }, []);

  // socket connection
  useEffect(() => {
    if (!myId) return;
    const token = localStorage.getItem("token") || "";
    socket.auth = { token };
    socket.connect();
    return () => { socket.disconnect(); };
  }, [myId]);

  // receive new messages
  useEffect(() => {
    const onNew = (m: Message) => {
      if (m.match !== current) {
        if (!m.match) return;
        setMatches((prev) => {
          const i = prev.findIndex((x) => x._id === m.match);
          if (i < 0) return prev;
          const copy = prev.slice();
          const target = copy[i];
          copy[i] = {
            ...target,
            unreadCount: (target.unreadCount || 0) + 1,
            lastMessage: { text: m.text, createdAt: m.createdAt, from: m.from },
          };
          copy.sort((a, b) => dt(b) - dt(a));
          return copy;
        });
        return;
      }
      setMatches((prev) => {
        const i = prev.findIndex((x) => x._id === current);
        if (i < 0) return prev;
        const copy = prev.slice();
        copy[i] = { ...copy[i], lastMessage: { text: m.text, createdAt: m.createdAt, from: m.from } };
        return copy;
      });
      setMessages((prev) => {
        if (m.clientTempId) {
          const i = prev.findIndex((x) => x._id === m.clientTempId || x.clientTempId === m.clientTempId);
          if (i >= 0) { const copy = prev.slice(); copy[i] = { ...m }; return copy; }
        }
        if (m._id && prev.some((x) => x._id === m._id)) return prev;
        return [...prev, m];
      });
    };
    socket.on("message:new", onNew);
    return () => { socket.off("message:new", onNew); };
  }, [current]);

  // room change: load history + join + load active invite
  useEffect(() => {
    (async () => {
      if (!current) return;
      socket.emit("join", { matchId: current });
      try {
        const { data } = await api.get<Message[]>(`/matches/${current}/messages`);
        setMessages(data);
        await markAsRead(current, data);
        setMatches((prev) => prev.map((m) => (m._id === current ? { ...m, unreadCount: 0 } : m)));
      } catch (e) {
        console.error(`GET /matches/${current}/messages failed`, e);
      }
      loadActiveInvite(current);
    })();
  }, [current]);

  // rejoin on reconnect
  useEffect(() => {
    const onConnect = () => { if (current) socket.emit("join", { matchId: current }); };
    socket.on("connect", onConnect);
    return () => { socket.off("connect", onConnect); };
  }, [current]);

  // rejoin + resync on tab visibility back
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && current) {
        socket.emit("join", { matchId: current });
        api.get<Message[]>(`/matches/${current}/messages`).then(async ({ data }) => {
          setMessages(data);
          await markAsRead(current, data);
          setMatches((prev) => prev.map((m) => (m._id === current ? { ...m, unreadCount: 0 } : m)));
        }).catch(() => {});
        api.get<Match[]>("/matches").then(({ data }) => setMatches(data)).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [current]);

  // match list update
  useEffect(() => {
    const onMatchUpdated = (p: { matchId: string; text: string; createdAt: string; from: string }) => {
      setMatches((prev) => {
        const i = prev.findIndex((m) => m._id === p.matchId);
        if (i < 0) return prev;
        const copy = prev.slice();
        const wasActive = p.matchId === current;
        const prevUnread = copy[i].unreadCount || 0;
        const shouldIncrease = !wasActive && p.from !== myId;
        copy[i] = {
          ...copy[i],
          lastMessage: { text: p.text, createdAt: p.createdAt, from: p.from },
          unreadCount: shouldIncrease ? prevUnread + 1 : wasActive ? 0 : prevUnread,
        };
        copy.sort((a, b) => dt(b) - dt(a));
        return copy;
      });
    };
    socket.on("match:updated", onMatchUpdated);
    return () => { socket.off("match:updated", onMatchUpdated); };
  }, [current]);

  // read receipts
  useEffect(() => {
    const onRead = ({ matchId, readerId, messageIds }: { matchId: string; readerId: string; messageIds: string[] }) => {
      if (matchId !== current) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id && messageIds.includes(m._id)
            ? { ...m, seenBy: Array.from(new Set([...(m.seenBy || []), readerId])) }
            : m
        )
      );
    };
    socket.on("message:read", onRead);
    return () => { socket.off("message:read", onRead); };
  }, [current]);

  // auto-scroll
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const partner = useMemo(() => {
    const m = matches.find((x) => x._id === current);
    if (!m) return undefined;
    return m.users.find((u) => u._id !== myId);
  }, [matches, current, myId]);

  const partnerName = partner?.name || "";
  const partnerPets = useMemo(() => {
    const list = (partner?.ownedPets?.length ? partner.ownedPets : partner?.pets) || [];
    return list.map((p) => p?.name).filter(Boolean).join(", ");
  }, [partner]);

  const send = async () => {
    const value = text.trim();
    if (!value || !current || sending) return;
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      _id: tempId, clientTempId: tempId, from: myId, text: value,
      createdAt: new Date().toISOString(), match: current, seenBy: [myId],
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setSending(true);

    socket.emit("message", { matchId: current, text: value, clientTempId: tempId, from: myId },
      (ack: { ok: boolean; serverId?: string; clientTempId?: string; error?: string }) => {
        setSending(false);
        if (!ack?.ok) {
          setMessages((prev) => prev.filter((m) => m._id !== tempId));
          setText(value);
          console.error("send failed:", ack?.error);
          return;
        }
        setMessages((prev) => {
          const byServer = prev.some((m) => m._id === ack.serverId);
          if (byServer) return prev;
          const i = prev.findIndex((m) => m._id === (ack.clientTempId || tempId) || m.clientTempId === (ack.clientTempId || tempId));
          if (i >= 0) { const copy = prev.slice(); copy[i] = { ...copy[i], _id: ack.serverId, clientTempId: undefined }; return copy; }
          return prev;
        });
      }
    );

    setMatches((prev) =>
      prev.map((m) => (m._id === current ? { ...m, lastMessage: { text: value, createdAt: optimistic.createdAt, from: myId } } : m))
        .sort((a, b) => dt(b) - dt(a))
    );
  };

  const markAsRead = async (matchId: string, list: Message[]) => {
    if (!myId) return;
    const unreadMine = list
      .filter((m) => m.from && m.from !== myId)
      .filter((m) => !(m.seenBy || []).includes(myId))
      .map((m) => m._id)
      .filter(Boolean) as string[];
    if (unreadMine.length === 0) return;
    setMessages((prev) =>
      prev.map((m) => (m._id && unreadMine.includes(m._id) ? { ...m, seenBy: Array.from(new Set([...(m.seenBy || []), myId])) } : m))
    );
    socket.emit("message:read", { matchId, messageIds: unreadMine });
    try { await api.post(`/matches/${matchId}/read`, { messageIds: unreadMine }); } catch {}
  };

  return (
    <div className="grid h-[calc(100vh-7rem)] grid-cols-12 gap-4">
      {/* Sidebar */}
      <aside className="surface col-span-12 hidden flex-col rounded-2xl md:col-span-4 md:flex lg:col-span-3">
        <div className="border-b border-slate-100 px-4 py-3.5">
          <h3 className="text-base font-semibold">Chats</h3>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto p-2">
          {matches.length === 0 && <div className="px-3 py-4 text-sm text-slate-500">No matches yet.</div>}
          {matches.map((m) => {
            const peer = m.users.find((u) => u._id !== myId);
            const name = peer?.name || "Partner";
            const petList = (peer?.ownedPets?.length ? peer.ownedPets : peer?.pets) || [];
            const pets = petList.map((p) => p?.name).filter(Boolean).join(", ");
            const unread = m.unreadCount || 0;
            const active = current === m._id;
            return (
              <button
                key={m._id}
                onClick={() => setCurrent(m._id)}
                className={cx("mb-1 w-full rounded-xl px-3 py-2.5 text-left transition", active ? "bg-brand-50" : "hover:bg-slate-50")}
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cx("truncate text-sm font-medium", active ? "text-brand-800" : "text-slate-800")}>
                        {name}{pets ? ` · ${pets}` : ""}
                      </span>
                      {unread > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-semibold text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                    {m.lastMessage?.text && <div className="truncate text-xs text-slate-500">{m.lastMessage.text}</div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Chat panel */}
      <section className="surface col-span-12 flex flex-col rounded-2xl md:col-span-8 lg:col-span-9">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
          <h3 className="truncate text-base font-semibold">
            {partnerName ? (
              <>{partnerName}{partnerPets && <span className="font-normal text-slate-500"> · {partnerPets}</span>}</>
            ) : (
              "Chat"
            )}
          </h3>
          <div className="flex items-center gap-2">
            {current && (
              <Button variant="secondary" size="sm" icon="walk" onClick={() => setScheduleOpen(true)}>
                Schedule walk
              </Button>
            )}
            <span className="text-xs text-slate-400">{messages.length}</span>
          </div>
        </div>

        {/* Pinned walk invite */}
        {invite && current && (
          <div className="border-b border-slate-100 px-4 py-3" style={{ background: "var(--brand-tint)" }}>
            <div className="flex items-start gap-3">
              <span
                className="grid h-9 w-9 place-items-center rounded-lg"
                style={{ background: "var(--brand)", color: "#fff" }}
              >
                <Icon name="walk" size={18} />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                    Walk · {invite.date} · {invite.time}
                  </div>
                  {invite.status === "confirmed" ? (
                    <Badge tone="brand">Confirmed</Badge>
                  ) : (
                    <Badge tone="slate">Pending</Badge>
                  )}
                </div>
                {invite.place && (
                  <div className="mt-0.5 text-xs" style={{ color: "var(--ink-soft)" }}>
                    📍 {invite.place}
                  </div>
                )}
                {invite.note && (
                  <div className="mt-0.5 text-xs" style={{ color: "var(--ink-soft)" }}>
                    {invite.note}
                  </div>
                )}
                {invite.status === "proposed" && (
                  <div className="mt-2 flex gap-2">
                    {invite.to === myId ? (
                      <>
                        <Button size="sm" onClick={() => respondInvite("confirmed")}>Accept</Button>
                        <Button variant="secondary" size="sm" onClick={() => respondInvite("declined")}>Decline</Button>
                      </>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => respondInvite("cancelled")}>Cancel</Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          ref={listRef}
          className="scrollbar-thin flex-1 space-y-2 overflow-y-auto px-4 py-4"
          onScroll={() => markAsRead(current, messages)}
        >
          {messages.length === 0 && (
            <div className="grid h-full place-items-center text-sm text-slate-400">Start the conversation.</div>
          )}
          {messages.map((m, i) => {
            const mine = m.from && myId && m.from === myId;
            const time = m.createdAt ? new Date(m.createdAt) : null;
            const hhmm = time?.toLocaleTimeString?.([], { hour: "2-digit", minute: "2-digit" }) ??
              new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const isLastMine = mine && (i === messages.length - 1 || (messages[i + 1]?.from && messages[i + 1].from !== myId));
            const partnerId = partner?._id;
            const peerRead = isLastMine && partnerId && (m.seenBy || []).includes(partnerId);
            return (
              <div key={m._id ?? i} className={cx("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cx(
                  "max-w-[72%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                  mine ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-slate-100 text-slate-800"
                )}>
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  <div className={cx("mt-1 flex items-center justify-end gap-1.5 text-[11px]", mine ? "text-white/75" : "text-slate-400")}>
                    <span>{hhmm}</span>
                    {peerRead && mine && <span>· Read</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message"
              disabled={!current}
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-500 disabled:bg-slate-50"
            />
            <button
              onClick={send}
              disabled={!text.trim() || !current || sending}
              className="h-11 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      </section>

      {/* Schedule walk sheet */}
      <Sheet open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule a walk">
        <div className="space-y-4 px-5 pb-6 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <Input type="date" value={invDate} onChange={(e) => setInvDate(e.target.value)} />
            </Field>
            <Field label="Time">
              <Input type="time" value={invTime} onChange={(e) => setInvTime(e.target.value)} />
            </Field>
          </div>
          <Field label="Place">
            <Input value={invPlace} onChange={(e) => setInvPlace(e.target.value)} placeholder="e.g. Riverside Park" />
          </Field>
          <Field label="Note (optional)">
            <Textarea rows={2} value={invNote} onChange={(e) => setInvNote(e.target.value)} placeholder="Anything to add?" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={sendInvite} loading={invSending} disabled={!invDate || !invTime}>
              Send invite
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function dt(m: Match) {
  return m.lastMessage?.createdAt ? Date.parse(m.lastMessage.createdAt) : 0;
}
