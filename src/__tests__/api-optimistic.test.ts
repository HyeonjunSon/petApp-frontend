/**
 * @jest-environment node
 *
 * RTK Query optimistic updates — the paw reaction toggles the posts cache
 * immediately and rolls back when the server rejects.
 */
import { configureStore } from "@reduxjs/toolkit";
import { offleashApi, type ApiPost } from "@/store/api";

const post: ApiPost = {
  id: "p1",
  author: { id: "u2", name: "Maya" },
  type: "walk-request",
  body: "walk buddy wanted",
  distanceM: 700,
  reactions: 8,
  reacted: false,
  commentCount: 0,
  createdAt: new Date().toISOString(),
};

const stores: Array<ReturnType<typeof configureStore>> = [];

function makeStore() {
  const store = configureStore({
    reducer: { [offleashApi.reducerPath]: offleashApi.reducer },
    middleware: (gdm) => gdm().concat(offleashApi.middleware),
  });
  stores.push(store);
  return store;
}

const cachedPosts = (store: ReturnType<typeof makeStore>) =>
  offleashApi.endpoints.posts.select()(store.getState() as any).data as ApiPost[] | undefined;

afterEach(() => {
  jest.restoreAllMocks();
  // keepUnusedDataFor 타이머 정리 — jest가 깨끗하게 종료되도록
  stores.splice(0).forEach((st) => st.dispatch(offleashApi.util.resetApiState()));
});

describe("reactPost optimistic update", () => {
  it("toggles the cached post before the server responds", async () => {
    const store = makeStore();
    await store.dispatch(offleashApi.util.upsertQueryData("posts", undefined, [{ ...post }]));

    let release!: () => void;
    jest.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise((resolve) => {
          release = () =>
            resolve(
              new Response(JSON.stringify({ reacted: true, reactions: 9 }), {
                status: 200,
                headers: { "content-type": "application/json" },
              })
            );
        })
    );

    const pending = store.dispatch(
      offleashApi.endpoints.reactPost.initiate({ id: "p1", wasReacted: false })
    );

    await new Promise((r) => setTimeout(r, 0)); // onQueryStarted가 미들웨어 태스크에서 실행됨
    // 서버 응답 전: 캐시가 이미 토글돼 있어야 한다
    expect(cachedPosts(store)?.[0]).toMatchObject({ reacted: true, reactions: 9 });

    release();
    await pending;
    expect(cachedPosts(store)?.[0]).toMatchObject({ reacted: true, reactions: 9 });
  });

  it("rolls the cache back when the request fails", async () => {
    const store = makeStore();
    await store.dispatch(offleashApi.util.upsertQueryData("posts", undefined, [{ ...post }]));

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 500, headers: { "content-type": "application/json" } }));

    await store.dispatch(offleashApi.endpoints.reactPost.initiate({ id: "p1", wasReacted: false }));

    expect(cachedPosts(store)?.[0]).toMatchObject({ reacted: false, reactions: 8 });
  });
});

describe("like optimistic deck removal", () => {
  it("removes the card from the discover cache and restores it on failure", async () => {
    const store = makeStore();
    const card = { id: "u9", photos: [] } as any;
    await store.dispatch(offleashApi.util.upsertQueryData("discover", undefined, [card]));

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 402, headers: { "content-type": "application/json" } }));

    await store.dispatch(offleashApi.endpoints.like.initiate("u9"));

    const deck = offleashApi.endpoints.discover.select()(store.getState() as any).data;
    expect(deck).toHaveLength(1); // 402 → rollback
  });
});
