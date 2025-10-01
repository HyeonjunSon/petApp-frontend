// frontend/app/chat/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { api } from "@/lib/api";

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

/**
 * ChatPage - real-time chat between matched users
 * - Loads matches and messages
 * - Socket join per selected match
 * - Optimistic send, ack replace, read receipts
 */
export default function ChatPage() {
  const [myId, setMyId] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

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

  // load matches
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Match[]>("/matches");
        setMatches(data);
        if (data[0]?._id) setCurrent(data[0]._id);
      } catch (e) {
        console.error("GET /matches failed", e);
      }
    })();
  }, []);

  //socket connection
  useEffect(() => {
    if (!myId) return;

    const token = localStorage.getItem("token") || "";
    socket.auth = { token };
    socket.connect();

    return () => {
      socket.disconnect();
    };
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
          const nextUnread = (target.unreadCount || 0) + 1;
          copy[i] = {
            ...target,
            unreadCount: nextUnread,
            lastMessage: {
              text: m.text,
              createdAt: m.createdAt,
              from: m.from,
            },
          };
           // sort by latest
          copy.sort((a, b) => {
            const at = a.lastMessage?.createdAt
              ? Date.parse(a.lastMessage.createdAt)
              : 0;
            const bt = b.lastMessage?.createdAt
              ? Date.parse(b.lastMessage.createdAt)
              : 0;
            return bt - at;
          });
          return copy;
        });
        return;
      }

      // current room: update list + message body
      setMatches((prev) => {
        const i = prev.findIndex((x) => x._id === current);
        if (i < 0) return prev;
        const copy = prev.slice();
        copy[i] = {
          ...copy[i],
          lastMessage: { text: m.text, createdAt: m.createdAt, from: m.from },
        };
        return copy;
      });

      setMessages((prev) => {
        // 1) replace optimistic item by clientTempId
        if (m.clientTempId) {
          const i = prev.findIndex(
            (x) => x._id === m.clientTempId || x.clientTempId === m.clientTempId
          );
          if (i >= 0) {
            const copy = prev.slice();
            copy[i] = { ...m };
            return copy;
          }
        }
        // de-dup by _id
        if (m._id && prev.some((x) => x._id === m._id)) return prev;

        return [...prev, m];
      });
    };

    socket.on("message:new", onNew);
    return () => {
      socket.off("message:new", onNew);
    };
  }, [current]);

  // on room change: load history + join
  useEffect(() => {
    (async () => {
      if (!current) return;

      // join server room
      socket.emit("join", { matchId: current });

      try {
        const { data } = await api.get<Message[]>(
          `/matches/${current}/messages`
        );
        setMessages(data);

        // mark as read immediately
        await markAsRead(current, data);
        // reset badge to 0
        setMatches((prev) =>
          prev.map((m) => (m._id === current ? { ...m, unreadCount: 0 } : m))
        );
      } catch (e) {
        console.error(`GET /matches/${current}/messages failed`, e);
      }
    })();
  }, [current]);

  // rejoin on reconnect
  useEffect(() => {
    const onConnect = () => {
      if (current) socket.emit("join", { matchId: current });
    };
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, [current]);

  // rejoin + resync on tab visibility back
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && current) {
        socket.emit("join", { matchId: current });
      
        api
          .get<Message[]>(`/matches/${current}/messages`)
          .then(async ({ data }) => {
            setMessages(data);
            await markAsRead(current, data);
            setMatches((prev) =>
              prev.map((m) =>
                m._id === current ? { ...m, unreadCount: 0 } : m
              )
            );
          })
          .catch(() => {});
          // refresh match list
        api
          .get<Match[]>("/matches")
          .then(({ data }) => setMatches(data))
          .catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [current]);

  // match list update (match:updated)
  useEffect(() => {
    const onMatchUpdated = (p: {
      matchId: string;
      text: string;
      createdAt: string;
      from: string;
    }) => {
      setMatches((prev) => {
        const i = prev.findIndex((m) => m._id === p.matchId);
        if (i < 0) return prev;
        const copy = prev.slice();
        const wasActive = p.matchId === current;
        const prevUnread = copy[i].unreadCount || 0;

        // do not increase unread for my own outgoing
        const shouldIncrease = !wasActive && p.from !== myId;

        copy[i] = {
          ...copy[i],
          lastMessage: { text: p.text, createdAt: p.createdAt, from: p.from },
          unreadCount: shouldIncrease
            ? prevUnread + 1
            : wasActive
            ? 0
            : prevUnread,
        };

        copy.sort((a, b) => {
          const at = a.lastMessage?.createdAt
            ? Date.parse(a.lastMessage.createdAt)
            : 0;
          const bt = b.lastMessage?.createdAt
            ? Date.parse(b.lastMessage.createdAt)
            : 0;
          return bt - at;
        });
        return copy;
      });
    };

    socket.on("match:updated", onMatchUpdated);
    return () => {
      socket.off("match:updated", onMatchUpdated);
    };
  }, [current]);

  // read receipts listener
  useEffect(() => {
    const onRead = ({
      matchId,
      readerId,
      messageIds,
    }: {
      matchId: string;
      readerId: string;
      messageIds: string[];
    }) => {
      if (matchId !== current) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id && messageIds.includes(m._id)
            ? {
                ...m,
                seenBy: Array.from(new Set([...(m.seenBy || []), readerId])),
              }
            : m
        )
      );
    };
    socket.on("message:read", onRead);
    return () => {
      socket.off("message:read", onRead);
    };
  }, [current]);

  // auto-scroll when near bottom on new messages
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length]);

  // partner info
  const partner = useMemo(() => {
    const m = matches.find((x) => x._id === current);
    if (!m) return undefined;
    return m.users.find((u) => u._id !== myId);
  }, [matches, current, myId]);

  const partnerName = partner?.name || "";

  const partnerPets = useMemo(() => {
    const list =
      (partner?.ownedPets?.length ? partner.ownedPets : partner?.pets) || [];
    return list
      .map((p) => p?.name)
      .filter(Boolean)
      .join(", ");
  }, [partner]);

  // send message (optimistic + ack replace)
  const send = async () => {
    const value = text.trim();
    if (!value || !current || sending) return;

    const tempId = `tmp-${Date.now()}`;

    const optimistic: Message = {
      _id: tempId,
      clientTempId: tempId,
      from: myId,
      text: value,
      createdAt: new Date().toISOString(),
      match: current,
      seenBy: [myId], // mark my own message as read by me
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setSending(true);

    socket.emit(
      "message",
      { matchId: current, text: value, clientTempId: tempId, from: myId },
      (ack: {
        ok: boolean;
        serverId?: string;
        clientTempId?: string;
        error?: string;
      }) => {
        setSending(false);
        if (!ack?.ok) {
          // rollback optimistic item and restore input
          setMessages((prev) => prev.filter((m) => m._id !== tempId));
          setText(value);
          console.error("send failed:", ack?.error);
          return;
        }
        // replace temp id when only ack arrives first
        setMessages((prev) => {
          const byServer = prev.some((m) => m._id === ack.serverId);
          if (byServer) return prev;
          const i = prev.findIndex(
            (m) =>
              m._id === (ack.clientTempId || tempId) ||
              m.clientTempId === (ack.clientTempId || tempId)
          );
          if (i >= 0) {
            const copy = prev.slice();
            copy[i] = {
              ...copy[i],
              _id: ack.serverId,
              clientTempId: undefined,
            };
            return copy;
          }
          return prev;
        });
      }
    );

    // update last message in list immediately
    setMatches((prev) =>
      prev
        .map((m) =>
          m._id === current
            ? {
                ...m,
                lastMessage: {
                  text: value,
                  createdAt: optimistic.createdAt,
                  from: myId,
                },
              }
            : m
        )
        .sort((a, b) => {
          const at = a.lastMessage?.createdAt
            ? Date.parse(a.lastMessage.createdAt)
            : 0;
          const bt = b.lastMessage?.createdAt
            ? Date.parse(b.lastMessage.createdAt)
            : 0;
          return bt - at;
        })
    );
  };

  //  mark messages as read in current room
  const markAsRead = async (matchId: string, list: Message[]) => {
    if (!myId) return;
    const unreadMine = list
      .filter((m) => m.from && m.from !== myId)
      .filter((m) => !(m.seenBy || []).includes(myId))
      .map((m) => m._id)
      .filter(Boolean) as string[];

    if (unreadMine.length === 0) return;

    // optimistic UI
    setMessages((prev) =>
      prev.map((m) =>
        m._id && unreadMine.includes(m._id)
          ? { ...m, seenBy: Array.from(new Set([...(m.seenBy || []), myId])) }
          : m
      )
    );

    // notify server/socket
    socket.emit("message:read", { matchId, messageIds: unreadMine });
    try {
      await api.post(`/matches/${matchId}/read`, { messageIds: unreadMine });
    } catch {}
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-56px)] w-full max-w-[1200px] grid-cols-12 gap-4 px-6 py-6">
      {/* Sidebar */}
      <aside className="col-span-12 h-[70vh] rounded-2xl border border-slate-200 bg-white shadow-sm md:col-span-4 lg:col-span-3">
        <div className="border-b px-4 py-3">
          <h3 className="text-base font-semibold">Matches</h3>
        </div>
        <div className="h-[calc(70vh-48px)] overflow-y-auto px-2 py-2">
          {matches.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-500">
               No matches yet.
            </div>
          )}
          {matches.map((m) => {
            const peer = m.users.find((u) => u._id !== myId);
            const name = peer?.name || "Partner";
            const petList =
              (peer?.ownedPets?.length ? peer.ownedPets : peer?.pets) || [];
            const pets = petList
              .map((p) => p?.name)
              .filter(Boolean)
              .join(", ");
            const unread = m.unreadCount || 0;
            return (
              <button
                key={m._id}
                onClick={() => setCurrent(m._id)}
                className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  current === m._id
                    ? "bg-emerald-50 text-emerald-800"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 truncate font-medium text-slate-800">
                    {name}
                    {pets ? ` (${pets})` : ""}
                  </div>
                  {unread > 0 && (
                    <span className="ml-2 inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-emerald-600 px-2 text-xs font-semibold text-white">
                      {unread}
                    </span>
                  )}
                </div>
                {m.lastMessage?.text && (
                  <div className="truncate text-xs text-slate-500 mt-0.5">
                    {m.lastMessage.text}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Chat room */}
      <section className="col-span-12 flex h-[70vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm md:col-span-8 lg:col-span-9">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="truncate text-base font-semibold">
            Chat{" "}
            {partnerName && (
              <span className="text-slate-500">
                · {partnerName}
                {partnerPets && ` (${partnerPets})`}{" "}
              </span>
            )}
          </h3>
          <div className="text-xs text-slate-400">
            {messages.length} messages
          </div>
        </div>

        <div
          ref={listRef}
          className="flex-1 space-y-2 overflow-y-auto px-4 py-3"
          onScroll={() => {
            // mark as read while scrollin
            markAsRead(current, messages);
          }}
        >
          {messages.length === 0 && (
            <div className="grid h-full place-items-center text-sm text-slate-500">
               Start the conversation.
            </div>
          )}
          {messages.map((m, i) => {
            const mine = m.from && myId && m.from === myId;
            const time = m.createdAt ? new Date(m.createdAt) : null;
            const hhmm =
              time?.toLocaleTimeString?.([], {
                hour: "2-digit",
                minute: "2-digit",
              }) ??
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

            // show "Read" on my last message if the partner has seen it
            const isLastMine =
              mine &&
              (i === messages.length - 1 ||
                (messages[i + 1]?.from && messages[i + 1].from !== myId));

            
            const partnerId = partner?._id;
            const peerRead =
              isLastMine && partnerId && (m.seenBy || []).includes(partnerId);

            return (
              <div
                key={m._id ?? i}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    mine
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : "bg-slate-100 text-slate-800 rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {m.text}
                  </div>
                  <div
                    className={`mt-1 flex items-center justify-end gap-2 text-[11px] ${
                      mine ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    <span>{hhmm}</span>
                    {peerRead && mine && <span>· Read</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t p-3">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message"
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
            <button
              onClick={send}
              disabled={!text.trim() || !current || sending}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow_sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
