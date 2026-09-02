"use client";

/** Likes you — RTK Query. like 뮤테이션이 LikesMe 태그를 무효화해
    Like back 후 목록이 캐시에서 자동 갱신된다. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Page } from "@/components/shell/Page";
import { Toast, type ToastData } from "@/components/ui";
import { useLikesMeQuery, useLikeMutation, type Liker } from "@/store/api";

export default function LikesMePage() {
  const router = useRouter();
  const { data, isLoading } = useLikesMeQuery();
  const [like, { isLoading: liking }] = useLikeMutation();
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const likeBack = async (u: Liker) => {
    if (liking) return;
    try {
      const r = await like(u.id).unwrap();
      if (r?.matchId) setToast({ msg: `It's a match with ${u.petName || u.name}! 🎾`, type: "ok" });
      else setToast({ msg: "Liked back!", type: "ok" });
    } catch {
      setToast({ msg: "Something went wrong. Please try again.", type: "error" });
    }
  };

  const count = data ? (data.locked ? data.count : data.users.length) : 0;

  return (
    <Page
      title="Likes you"
      subtitle={
        isLoading || !data
          ? "See the friends who liked you."
          : count === 0
            ? "No likes yet — say hi in the Pack first."
            : `${count} neighbour${count === 1 ? "" : "s"} liked you.`
      }
      right={
        <button type="button" className="btn btn-ghost" onClick={() => router.push("/matches")}>
          Back to matches
        </button>
      }
    >
      {isLoading || !data ? (
        <div className="card" style={{ color: "var(--fence)" }}>Loading…</div>
      ) : data.locked ? (
        <>
          <div
            className="card"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}
          >
            <span style={{ fontSize: 15, color: "var(--fence)" }}>
              {count > 0
                ? `${count} neighbour${count === 1 ? "" : "s"} already liked you — upgrade to see who.`
                : "Upgrade to Premium to see everyone who likes you."}
            </span>
            <button type="button" className="btn btn-ball" onClick={() => router.push("/subscription")}>
              See who it is
            </button>
          </div>
          {count > 0 && (
            <div className="pack-grid">
              {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
                <div key={i} className="dog-card" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="dog-photo" style={{ display: "grid", placeItems: "center", fontSize: 56 }}>
                    <span aria-hidden style={{ filter: "blur(8px)" }}>🐕</span>
                  </div>
                  <div className="dog-info" style={{ flex: 1 }}>
                    <div className="dog-name">🔒 Likes you</div>
                    <p className="dog-breed" style={{ margin: "3px 0 0" }}>Subscribe to see this profile.</p>
                  </div>
                  <div className="dog-acts">
                    <button
                      type="button"
                      className="btn btn-ball btn-sm"
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => router.push("/subscription")}
                    >
                      Start Premium
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : data.users.length === 0 ? (
        <div className="card" style={{ color: "var(--fence)" }}>
          No likes yet. Say hi to a few neighbours in the Pack — likes usually come back.
        </div>
      ) : (
        <div className="pack-grid">
          {data.users.map((u) => (
            <div key={u.id} className="dog-card" style={{ display: "flex", flexDirection: "column" }}>
              <div className="dog-photo">
                {u.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.photo} alt="" />
                )}
              </div>
              <div className="dog-info" style={{ flex: 1 }}>
                <div className="dog-name">{u.petName || u.name}</div>
                <div className="dog-breed">
                  {[u.breed, u.name].filter((v) => v && v !== (u.petName || u.name)).join(" · ") || "Neighbour"}
                </div>
              </div>
              <div className="dog-acts">
                <button
                  type="button"
                  className="btn btn-ball btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={liking}
                  onClick={() => likeBack(u)}
                >
                  Like back 🐾
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Toast toast={toast} />
    </Page>
  );
}
