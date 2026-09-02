"use client";

/** Plan details — walk-invite detail + status actions. */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useWalkInvitesQuery,
  useMatchesQuery,
  useUpdateInviteMutation,
} from "@/store/api";
import { useAuth } from "@/store/auth";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import { Avatar, Spinner, EmptyState, Icon } from "@/components/ui";
import { type Match, type WalkInvite, peerOf, pickPet } from "../../chat/types";

const STATUS: Record<string, string> = {
  proposed: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
};

/** confirmed/completed → .pill, 그 외 → .tag (v2 무채색 상태 표기) */
function StatusBadge({ status }: { status: string }) {
  const label = STATUS[status] || status;
  if (status === "confirmed" || status === "completed") {
    return <span className="pill">{label}</span>;
  }
  return <span className="tag">{label}</span>;
}

/** "HH:MM" → "10:00 AM" */
function fmtTime(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(Number.isNaN(m) ? 0 : m).padStart(2, "0")} ${ampm}`;
}

/** "2026-08-11" → "Aug 11 (Mon)" */
function fmtDateKo(date?: string) {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  const mo = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
  return `${mo} ${d.getDate()} (${wd})`;
}

export default function WalkInviteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  /* RTK Query — 목록 캐시에서 찾고, 상태 변경은 Invites 태그 무효화로 자동 반영 */
  const { data: invites = [], isLoading: loading } = useWalkInvitesQuery();
  const { data: matches = [] } = useMatchesQuery();
  const [updateInvite] = useUpdateInviteMutation();
  const invite: WalkInvite | null = invites.find((i) => i._id === id) || null;
  const match: Match | null = invite
    ? matches.find((m) => m._id === invite.match) || null
    : null;
  const [busy, setBusy] = useState(false);

  const respond = async (status: "confirmed" | "declined" | "cancelled" | "completed") => {
    if (!invite) return;
    setBusy(true);
    try {
      await updateInvite({ id: invite._id, status }).unwrap();
    } catch {}
    setBusy(false);
  };

  if (loading) {
    return (
      <Page title="Plan details">
        <div className="flex justify-center pt-16" style={{ color: "var(--fence)" }}><Spinner /></div>
      </Page>
    );
  }
  if (!invite) {
    return (
      <Page title="Plan details">
        <EmptyState
          emoji="🐾"
          title="Plan not found"
          action={
            <button type="button" className="btn" onClick={() => router.push("/walks")}>
              Back to walks
            </button>
          }
        />
      </Page>
    );
  }

  const peer = match ? peerOf(match, myId) : undefined;
  const pet = pickPet(peer);

  return (
    <Page
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          Plan details <StatusBadge status={invite.status} />
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 900 }}>
        <div className="card">
          <h2 style={{ fontSize: 18, margin: "0 0 14px" }}>Plan info</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            <Info label="Date · Time" value={`${fmtDateKo(invite.date)} ${fmtTime(invite.time)}`} />
            <Info label="Place" value={invite.place || "—"} />
            <Info label="Note" value={invite.note || "—"} />
          </div>
          <div style={{ marginTop: 16 }}>
            <ImagePlaceholder label="Map preview" height={200} />
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 18, margin: "0 0 14px" }}>Partner owner</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar src={peer?.faceUrl} fallbackText={(peer?.name || "O")[0]} size={48} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                {peer?.name ? peer.name : "Partner owner"}
              </div>
              <div style={{ fontSize: 14, color: "var(--fence)" }}>
                {pet?.name ? `Pet: ${pet.name}` : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>Plan status</h2>
          {invite.status === "proposed" ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn" disabled={busy} onClick={() => respond("confirmed")}>
                Accept
              </button>
              <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => respond("declined")}>
                Decline
              </button>
              <button type="button" className="btn btn-danger" disabled={busy} onClick={() => respond("cancelled")}>
                Cancel plan
              </button>
            </div>
          ) : invite.status === "confirmed" ? (
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--fence)" }}>
                Finished your walk? Mark it as completed and a walk record is added automatically.
              </p>
              <button type="button" className="btn" disabled={busy} onClick={() => respond("completed")}>
                <Icon name="check" size={16} />
                Mark as completed
              </button>
            </div>
          ) : invite.status === "completed" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, color: "var(--fence)" }}>
                ✅ This walk is completed — a walk record was added automatically.
              </span>
              <button type="button" className="btn btn-ghost" onClick={() => router.push("/walks/records")}>
                View records
              </button>
            </div>
          ) : (
            <span style={{ fontSize: 15, color: "var(--fence)" }}>
              This plan is {STATUS[invite.status]?.toLowerCase()}.
            </span>
          )}
        </div>
      </div>
    </Page>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--fence)" }}>{label}</div>
      <div style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{value}</div>
    </div>
  );
}
