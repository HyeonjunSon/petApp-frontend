/** Shared types + helpers for /chat. */

export type Pet = { _id: string; name?: string; photos?: { url: string }[] };

export type Peer = {
  _id: string;
  name?: string;
  faceUrl?: string;
  pets?: Pet[];
  ownedPets?: Pet[];
};

export type Match = {
  _id: string;
  users: Peer[];
  lastMessage?: { text?: string; createdAt?: string; from?: string };
  unreadCount?: number;
};

export type Message = {
  _id?: string;
  from?: string;
  text: string;
  createdAt?: string;
  match?: string;
  clientTempId?: string;
  seenBy?: string[];
};

export type WalkInvite = {
  _id: string;
  from: string;
  to: string;
  match: string;
  date: string;
  time: string;
  place?: string;
  note?: string;
  status: "proposed" | "confirmed" | "declined" | "cancelled" | "completed";
  createdAt?: string;
};

export const lastMsgTime = (m?: Match) =>
  new Date(m?.lastMessage?.createdAt || 0).getTime();

export const pickPet = (p?: Peer): Pet | undefined => {
  const list = (p?.ownedPets?.length ? p.ownedPets : p?.pets) || [];
  return list[0];
};

export const peerOf = (m: Match, myId: string) =>
  m.users.find((u) => u._id !== myId);

export const formatTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const pairTitle = (peer?: Peer): string => {
  const pet = pickPet(peer);
  if (peer && pet) return `${peer.name || "Someone"} & ${pet.name || ""}`;
  return peer?.name || "";
};
