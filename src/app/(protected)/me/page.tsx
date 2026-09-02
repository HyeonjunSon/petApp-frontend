"use client";

/** Me — Offleash v2 프로필 허브. 기존 /profile 데이터·링크 유지, v2 카드 문법. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api"; // logout만 (인증 플로우는 RTK 경계 밖)
import { useAuth } from "@/store/auth";
import { Avatar } from "@/components/ui";
import { usePetsQuery, useMatchesQuery, useWalkInvitesQuery } from "@/store/api";

export default function MePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  /* RTK Query — 홈/산책 화면과 캐시 공유 */
  const { data: pets = [] } = usePetsQuery();
  const { data: matchesData } = useMatchesQuery();
  const { data: invitesData } = useWalkInvitesQuery();
  const matchCount = matchesData ? matchesData.length : null;
  const walkCount = invitesData
    ? invitesData.filter((i) => i.status === "completed").length
    : null;

  const onLogout = async () => {
    setBusy(true);
    try {
      await api.post("/auth/logout");
    } catch {}
    logout();
    setUser(null);
    router.replace("/login");
  };

  const face =
    (user as any)?.faceUrl ||
    (user?.photos || []).find((p) => p.type === "owner_face")?.url;
  const name = user?.name || "Owner";

  const rows: Array<{ label: string; sub?: string; to?: string; danger?: boolean; act?: () => void }> = [
    { label: "My pets", sub: pets.map((p) => p.name).join(" · ") || "Add your first pet", to: "/settings/pet" },
    { label: "Edit profile", sub: "Photos, bio, walk style", to: "/settings/profile" },
    { label: "Neighbourhood & visibility", sub: user?.locationName || "Set your area and radius", to: "/settings/exposure" },
    { label: "Notifications", to: "/settings/notifications" },
    { label: "Plan", sub: "Free — manage Premium", to: "/subscription" },
    { label: "Account & password", to: "/settings" },
    { label: "Terms · Privacy", to: "/terms" },
  ];

  return (
    <main className="shell-main wide">
      <h1 style={{ fontSize: 28 }}>Me</h1>

      <div className="card" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Avatar src={face} fallbackText={name[0] || "O"} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 22 }}>{name}</h2>
          <span style={{ color: "var(--fence)", fontSize: 14 }}>
            {[user?.locationName, user?.email].filter(Boolean).join(" · ")}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => router.push("/settings/profile")}>
          Edit
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          [matchCount === null ? "—" : String(matchCount), "Matches"],
          [walkCount === null ? "—" : String(walkCount), "Walks"],
          [String(pets.length), "Pets"],
        ].map(([v, l]) => (
          <div key={l} className="card" style={{ textAlign: "center", padding: "14px 8px" }}>
            <div className="display" style={{ fontSize: 26 }}>{v}</div>
            <div style={{ color: "var(--fence)", fontSize: 13 }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="card pd-menu" style={{ padding: 0, overflow: "hidden" }}>
        {rows.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={r.act || (() => r.to && router.push(r.to))}
            style={{
              display: "flex", width: "100%", alignItems: "center", gap: 12,
              padding: "14px 18px", background: "none", border: 0, cursor: "pointer",
              fontFamily: "inherit", fontSize: 15, textAlign: "left",
              color: r.danger ? "var(--collar)" : "var(--ink)",
            }}
          >
            <span style={{ fontWeight: 600 }}>{r.label}</span>
            {r.sub && (
              <span className="pd-line1" style={{ color: "var(--fence)", fontSize: 13, flex: 1 }}>
                {r.sub}
              </span>
            )}
            <span style={{ marginLeft: "auto", color: "var(--fence)" }} aria-hidden>›</span>
          </button>
        ))}
      </div>

      <button className="btn btn-ghost" onClick={onLogout} disabled={busy} style={{ alignSelf: "flex-start" }}>
        {busy ? "Logging out…" : "Log out"}
      </button>
    </main>
  );
}
