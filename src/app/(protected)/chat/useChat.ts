"use client";

/** Chat controller — owns socket + state + send/respond actions. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { socket } from "@/lib/socket";
import { api } from "@/lib/api";
import { useLocale } from "@/lib/i18n";
import {
  type Match,
  type Message,
  type WalkInvite,
  lastMsgTime,
  pairTitle,
  peerOf,
  pickPet,
} from "./types";

export function useChat() {
  const { t } = useLocale();
  const [myId, setMyId] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [current, setCurrent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [invite, setInvite] = useState<WalkInvite | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [showListOnMobile, setShowListOnMobile] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  /* self */
  useEffect(() => {
    api
      .get<{ _id: string }>("/users/me")
      .then(({ data }) => setMyId(data?._id || ""))
      .catch(() => {});
  }, []);

  /* match list + ?open= */
  useEffect(() => {
    api
      .get<Match[]>("/matches")
      .then(({ data }) => {
        setMatches(data);
        const openId =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("open")
            : null;
        const wanted =
          (openId && data.some((m) => m._id === openId) && openId) ||
          data[0]?._id;
        if (wanted) {
          setCurrent(wanted);
          setShowListOnMobile(false);
        }
      })
      .catch(() => {});
  }, []);

  /* socket connect */
  useEffect(() => {
    if (!myId) return;
    socket.auth = { token: localStorage.getItem("token") || "" };
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [myId]);

  const markAsRead = useCallback(
    async (matchId: string, list: Message[]) => {
      if (!myId) return;
      const ids = list
        .filter((m) => m.from && m.from !== myId)
        .filter((m) => !(m.seenBy || []).includes(myId))
        .map((m) => m._id)
        .filter(Boolean) as string[];
      if (!ids.length) return;
      setMessages((p) =>
        p.map((m) =>
          m._id && ids.includes(m._id)
            ? {
                ...m,
                seenBy: Array.from(new Set([...(m.seenBy || []), myId])),
              }
            : m
        )
      );
      socket.emit("message:read", { matchId, messageIds: ids });
      try {
        await api.post(`/matches/${matchId}/read`, { messageIds: ids });
      } catch {}
    },
    [myId]
  );

  /* load conv + invite on current change */
  useEffect(() => {
    if (!current) return;
    socket.emit("join", { matchId: current });
    (async () => {
      try {
        const { data } = await api.get<Message[]>(
          `/matches/${current}/messages`
        );
        setMessages(data);
        await markAsRead(current, data);
        setMatches((p) =>
          p.map((m) => (m._id === current ? { ...m, unreadCount: 0 } : m))
        );
      } catch (e: any) {
        setErr(e?.response?.data?.message || t("chat.err.load"));
      }
      try {
        const { data } = await api.get<WalkInvite[]>("/walk-invites");
        const active =
          data.find(
            (i) =>
              i.match === current &&
              (i.status === "proposed" || i.status === "confirmed")
          ) || null;
        setInvite(active);
      } catch {
        setInvite(null);
      }
    })();
  }, [current, markAsRead, t]);

  /* incoming */
  useEffect(() => {
    const onNew = (m: Message) => {
      if (m.match !== current) {
        if (!m.match) return;
        setMatches((p) => {
          const i = p.findIndex((x) => x._id === m.match);
          if (i < 0) return p;
          const copy = p.slice();
          copy[i] = {
            ...copy[i],
            unreadCount: (copy[i].unreadCount || 0) + 1,
            lastMessage: {
              text: m.text,
              createdAt: m.createdAt,
              from: m.from,
            },
          };
          copy.sort((a, b) => lastMsgTime(b) - lastMsgTime(a));
          return copy;
        });
        return;
      }
      setMatches((p) =>
        p.map((x) =>
          x._id === current
            ? {
                ...x,
                lastMessage: {
                  text: m.text,
                  createdAt: m.createdAt,
                  from: m.from,
                },
              }
            : x
        )
      );
      setMessages((p) => {
        if (m.clientTempId) {
          const i = p.findIndex(
            (x) =>
              x._id === m.clientTempId || x.clientTempId === m.clientTempId
          );
          if (i >= 0) {
            const copy = p.slice();
            copy[i] = { ...m };
            return copy;
          }
        }
        if (m._id && p.some((x) => x._id === m._id)) return p;
        return [...p, m];
      });
    };
    socket.on("message:new", onNew);
    return () => {
      socket.off("message:new", onNew);
    };
  }, [current]);

  /* read receipt */
  useEffect(() => {
    const onRead = (p: {
      matchId: string;
      messageIds: string[];
      by: string;
    }) => {
      if (p.matchId !== current) return;
      setMessages((prev) =>
        prev.map((m) =>
          m._id && p.messageIds.includes(m._id)
            ? {
                ...m,
                seenBy: Array.from(new Set([...(m.seenBy || []), p.by])),
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

  /* send */
  const send = () => {
    const v = text.trim();
    if (!v || !current || sending) return;
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      _id: tempId,
      clientTempId: tempId,
      from: myId,
      text: v,
      createdAt: new Date().toISOString(),
      match: current,
      seenBy: [myId],
    };
    setMessages((p) => [...p, optimistic]);
    setText("");
    setSending(true);
    socket.emit(
      "message",
      { matchId: current, text: v, clientTempId: tempId, from: myId },
      (ack: { ok: boolean; serverId?: string }) => {
        setSending(false);
        if (!ack?.ok) {
          setMessages((p) => p.filter((m) => m._id !== tempId));
          setText(v);
          return;
        }
        setMessages((p) =>
          p.some((m) => m._id === ack.serverId)
            ? p
            : p.map((m) =>
                m._id === tempId
                  ? { ...m, _id: ack.serverId, clientTempId: undefined }
                  : m
              )
        );
      }
    );
    setMatches((p) =>
      p
        .map((m) =>
          m._id === current
            ? {
                ...m,
                lastMessage: {
                  text: v,
                  createdAt: optimistic.createdAt,
                  from: myId,
                },
              }
            : m
        )
        .sort((a, b) => lastMsgTime(b) - lastMsgTime(a))
    );
  };

  const partner = useMemo(() => {
    const m = matches.find((x) => x._id === current);
    return m ? peerOf(m, myId) : undefined;
  }, [matches, current, myId]);

  const respond = async (s: "confirmed" | "declined" | "cancelled") => {
    if (!invite) return;
    try {
      const { data } = await api.patch<WalkInvite>(
        `/walk-invites/${invite._id}`,
        { status: s }
      );
      setInvite(
        data.status === "proposed" || data.status === "confirmed" ? data : null
      );
    } catch (e: any) {
      setErr(e?.response?.data?.message || t("chat.err.invite"));
    }
  };

  const sendInvite = async (payload: {
    date: string;
    time: string;
    place?: string;
    note?: string;
  }) => {
    if (!current) return;
    try {
      const { data } = await api.post<WalkInvite>(
        `/matches/${current}/walk-invite`,
        payload
      );
      setInvite(data);
      setScheduleOpen(false);
    } catch (e: any) {
      setErr(e?.response?.data?.message || t("chat.err.send"));
    }
  };

  return {
    myId,
    matches,
    current,
    messages,
    text,
    setText,
    sending,
    invite,
    err,
    scheduleOpen,
    setScheduleOpen,
    showListOnMobile,
    partner,
    partnerPet: pickPet(partner),
    partnerTitle: partner ? pairTitle(partner) : "",
    openChat: (id: string) => {
      setCurrent(id);
      setShowListOnMobile(false);
    },
    backToList: () => setShowListOnMobile(true),
    send,
    respond,
    sendInvite,
  };
}
