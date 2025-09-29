import { create } from "zustand";

export type PhotoType = "owner_face" | "pet";

export type User = {
  _id: string;
  email: string;
  name?: string;
  photos?: { url: string; type?: PhotoType }[];
  about?: string;
  goal?: string;
  interests?: string[];
  heroUrl?: string;
  profileRev?: number;
};

type AuthState = {
  user: User | null;

  /** 기존 setUser 유지 (전체 교체) */
  setUser: (u: User | null) => void;

  /** 편의: 일부 필드만 패치하고 싶을 때 */
  patchUser: (patch: Partial<User>) => void;

  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,

  setUser: (u) => set({ user: u }),

  patchUser: (patch) =>
    set((s) => (s.user ? { user: { ...s.user, ...patch } } : { user: s.user })),

  logout: () => {
    try {
      if (typeof window !== "undefined") localStorage.removeItem("token");
    } catch {}
    set({ user: null });
  },
}));
