// types/chat.ts
export type User = { _id: string; name?: string };

export type Match = {
  _id: string;
  users: User[];              // 나 + 상대
  lastMessage?: Message;      // 서버에서 넣어주면 베스트 (없어도 동작)
  unreadCount?: number;       // 서버에서 나 기준으로 계산해주면 베스트
};

export type Message = {
  _id: string;
  matchId: string;
  from: string;               // userId
  text: string;
  createdAt: string;
  seenBy: string[];           // 읽은 사용자들의 userId 배열
};

// 상대 찾기
export const getPeer = (m: Match, meId: string) =>
  m.users.find(u => u._id !== meId);
