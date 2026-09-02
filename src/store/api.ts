/**
 * Offleash API — RTK Query 단일 api slice.
 *
 * 경계(의도적):
 *  · 데이터 페칭/캐시/무효화 → RTK Query (이 파일, 태그 기반)
 *  · 실시간 채팅 → Socket.IO 훅(chat/useChat) 유지 — 소켓 스트림은 쿼리 캐시 대상이 아님
 *  · 인증 세션(user/token) → zustand(useAuth) 유지, 업로드/인증 플로우는 axios(lib/api)
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Card } from "@/lib/card";
import { adapt } from "@/lib/card";
import type { Pet } from "@/types/pet";
import type { Match, WalkInvite } from "@/app/(protected)/chat/types";
import type { PostType } from "@/lib/feed-demo";

/* lib/api.ts와 동일한 베이스 URL 규칙 */
function normalizeBase(u: string | undefined) {
  const raw = (u || "").trim();
  if (!raw) return "http://localhost:5050/api";
  const noTrail = raw.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(noTrail)) return noTrail;
  if (noTrail.startsWith("//")) return "https:" + noTrail;
  return "https://" + noTrail;
}

export type ApiPost = {
  id: string;
  author: { id: string; name: string; faceUrl?: string };
  type: PostType;
  body: string;
  locationName?: string;
  distanceM: number | null;
  reactions: number;
  reacted: boolean;
  commentCount: number;
  topComment?: { author: string; body: string; createdAt: string } | null;
  mine?: boolean;
  createdAt: string;
};

export type Liker = {
  id: string;
  name: string;
  petName?: string;
  breed?: string;
  photo?: string;
  likedAt?: string;
};
export type LikesMe = { locked: true; count: number } | { locked: false; users: Liker[] };

export type WalkRecord = {
  _id: string;
  pet: string;
  distanceKm: number;
  durationMin: number;
  startedAt: string;
};

export type BillingMe = {
  subscription: {
    status: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    plan?: { code: string; label: string };
  } | null;
  active: boolean;
  entitlements: { feature: string; expiresAt?: string | null }[];
  demo?: boolean;
};

export type PlanDto = {
  code: string;
  label: string;
  priceCents: number;
  currency?: string;
  interval: "month" | "year";
  features?: string[];
};

export const offleashApi = createApi({
  reducerPath: "offleashApi",
  baseQuery: fetchBaseQuery({
    baseUrl: normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL),
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Posts", "Discover", "Pets", "Matches", "Invites", "Walks", "LikesMe", "Billing"],
  endpoints: (b) => ({
    /* ── 피드 ── */
    posts: b.query<ApiPost[], void>({
      query: () => "/posts",
      providesTags: ["Posts"],
    }),
    createPost: b.mutation<ApiPost, { type: PostType; body: string }>({
      query: (body) => ({ url: "/posts", method: "POST", body }),
      /* 새 포스트를 캐시 맨 앞에 낙관적으로 삽입 */
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            offleashApi.util.updateQueryData("posts", undefined, (draft) => {
              draft.unshift(data);
            })
          );
        } catch {}
      },
    }),
    reactPost: b.mutation<{ reacted: boolean; reactions: number }, { id: string; wasReacted: boolean }>({
      query: ({ id }) => ({ url: `/posts/${id}/react`, method: "POST" }),
      /* 🐾 낙관적 토글 + 실패 시 롤백 — RTK Query 시그니처 패턴 */
      async onQueryStarted({ id, wasReacted }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          offleashApi.util.updateQueryData("posts", undefined, (draft) => {
            const p = draft.find((x) => x.id === id);
            if (p) {
              p.reacted = !wasReacted;
              p.reactions += wasReacted ? -1 : 1;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    commentPost: b.mutation<
      { commentCount: number; comment: { author: string; body: string; createdAt: string } },
      { id: string; body: string }
    >({
      query: ({ id, body }) => ({ url: `/posts/${id}/comments`, method: "POST", body: { body } }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            offleashApi.util.updateQueryData("posts", undefined, (draft) => {
              const p = draft.find((x) => x.id === id);
              if (p) {
                p.commentCount = data.commentCount;
                p.topComment = data.comment;
              }
            })
          );
        } catch {}
      },
    }),

    /* ── 디스커버/팩 ── */
    discover: b.query<Card[], void>({
      query: () => "/discover",
      transformResponse: (data: unknown) => (Array.isArray(data) ? data.map(adapt) : []),
      providesTags: ["Discover"],
    }),
    like: b.mutation<{ ok: boolean; matched: boolean; matchId?: string }, string>({
      query: (targetId) => ({ url: `/matches/like/${targetId}`, method: "POST" }),
      /* 덱에서 즉시 제거 + 매치/라익스 캐시 무효화 */
      async onQueryStarted(targetId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          offleashApi.util.updateQueryData("discover", undefined, (draft) =>
            draft.filter((c) => c.id !== targetId)
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Matches", "LikesMe"],
    }),
    pass: b.mutation<{ ok: boolean }, string>({
      query: (targetId) => ({ url: `/matches/pass/${targetId}`, method: "POST" }),
      async onQueryStarted(targetId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          offleashApi.util.updateQueryData("discover", undefined, (draft) =>
            draft.filter((c) => c.id !== targetId)
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    likesMe: b.query<LikesMe, void>({
      query: () => "/matches/likes-me",
      providesTags: ["LikesMe"],
    }),

    /* ── 매치/산책 ── */
    matches: b.query<Match[], void>({
      query: () => "/matches",
      providesTags: ["Matches"],
    }),
    pets: b.query<Pet[], void>({
      query: () => "/pets",
      providesTags: ["Pets"],
    }),
    walkInvites: b.query<WalkInvite[], void>({
      query: () => "/walk-invites",
      providesTags: ["Invites"],
    }),
    walks: b.query<WalkRecord[], { from: string; to: string }>({
      query: ({ from, to }) => ({ url: "/walks", params: { from, to } }),
      providesTags: ["Walks"],
    }),
    createInvite: b.mutation<
      WalkInvite,
      {
        matchId: string;
        date: string;
        time: string;
        place?: string;
        note?: string;
        location?: { lat: number; lng: number };
      }
    >({
      query: ({ matchId, ...body }) => ({
        url: `/matches/${matchId}/walk-invite`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invites"],
    }),
    updateInvite: b.mutation<WalkInvite, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/walk-invites/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Invites", "Walks"],
    }),

    /* ── 구독 ── */
    billingMe: b.query<BillingMe, void>({
      query: () => "/billing/me",
      providesTags: ["Billing"],
    }),
    plans: b.query<PlanDto[], void>({
      query: () => "/billing/plans",
    }),
    checkout: b.mutation<{ ok?: boolean; demo?: boolean; url?: string }, { planCode: string }>({
      query: (body) => ({ url: "/billing/checkout", method: "POST", body }),
      invalidatesTags: ["Billing", "LikesMe"],
    }),
    cancelSubscription: b.mutation<{ ok: boolean; currentPeriodEnd?: string }, void>({
      query: () => ({ url: "/billing/cancel", method: "POST" }),
      invalidatesTags: ["Billing"],
    }),
  }),
});

export const {
  usePostsQuery,
  useCreatePostMutation,
  useReactPostMutation,
  useCommentPostMutation,
  useDiscoverQuery,
  useLikeMutation,
  usePassMutation,
  useLikesMeQuery,
  useMatchesQuery,
  usePetsQuery,
  useWalkInvitesQuery,
  useWalksQuery,
  useCreateInviteMutation,
  useUpdateInviteMutation,
  useBillingMeQuery,
  usePlansQuery,
  useCheckoutMutation,
  useCancelSubscriptionMutation,
} = offleashApi;
