"use client";

/** Plan details — walk-invite detail + status actions. */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import { Button, Avatar, Spinner, EmptyState } from "@/components/ui";
import { type Match, type WalkInvite, peerOf, pickPet } from "../../chat/types";

const STATUS: Record<string, string> = {
  proposed: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
};

const PILL_TONES: Record<string, { bg: string; fg: string }> = {
  proposed: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  confirmed: { bg: "var(--success-soft)", fg: "var(--success)" },
  completed: { bg: "var(--input-bg)", fg: "var(--text-secondary)" },
  declined: { bg: "var(--input-bg)", fg: "var(--text-secondary)" },
  cancelled: { bg: "var(--input-bg)", fg: "var(--text-secondary)" },
};

function Pill({ status }: { status: string }) {
  const t = PILL_TONES[status] || PILL_TONES.completed;
  return (
    <span
      style={{
        fontSize: "var(--fs-micro)",
        fontWeight: 700,
        borderRadius: "var(--radius-pill)",
        padding: "4px 12px",
        background: t.bg,
        color: t.fg,
        whiteSpace: "nowrap",
      }}
    >
      {STATUS[status] || status}
    </span>
  );
}

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: "var(--radius-2xl)",
  boxShadow: "var(--shadow-card)",
  padding: 20,
};
const cardTitleStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "var(--fs-h3)",
  fontWeight: 800,
  color: "var(--text)",
};

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

  const [invite, setInvite] = useState<WalkInvite | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get<WalkInvite[]>("/walk-invites"),
      api.get<Match[]>("/matches"),
    ]).then(([inv, mt]) => {
      const found =
        inv.status === "fulfilled" ? (inv.value.data || []).find((i) => i._id === id) || null : null;
      setInvite(found);
      if (found && mt.status === "fulfilled") {
        setMatch((mt.value.data || []).find((m) => m._id === found.match) || null);
      }
      setLoading(false);
    });
  }, [id]);

  const respond = async (status: "confirmed" | "declined" | "cancelled" | "completed") => {
    if (!invite) return;
    setBusy(true);
    try {
      const { data } = await api.patch<WalkInvite>(`/walk-invites/${invite._id}`, { status });
      setInvite(data);
    } catch {}
    setBusy(false);
  };

  if (loading) {
    return (
      <Page title="Plan details">
        <div className="flex justify-center pt-16" style={{ color: "var(--text-secondary)" }}><Spinner /></div>
      </Page>
    );
  }
  if (!invite) {
    return (
      <Page title="Plan details">
        <EmptyState emoji="🐾" title="Plan not found" action={<Button onClick={() => router.push("/walks")}>Back to walks</Button>} />
      </Page>
    );
  }

  const peer = match ? peerOf(match, myId) : undefined;
  const pet = pickPet(peer);

  return (
    <Page
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          Plan details <Pill status={invite.status} />
        </span>
      }
      maxWidth={900}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Plan info</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            <Info label="Date · Time" value={`${fmtDateKo(invite.date)} ${fmtTime(invite.time)}`} />
            <Info label="Place" value={invite.place || "—"} />
            <Info label="Note" value={invite.note || "—"} />
          </div>
          <div style={{ marginTop: 16 }}>
            <ImagePlaceholder label="Map preview" height={200} />
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Partner owner</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar src={peer?.faceUrl} fallbackText={(peer?.name || "O")[0]} size={48} />
            <div>
              <div style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--text)" }}>
                {peer?.name ? peer.name : "Partner owner"}
              </div>
              <div style={{ fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}>
                {pet?.name ? `Pet: ${pet.name}` : ""}
              </div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ ...cardTitleStyle, margin: "0 0 12px" }}>Plan status</h2>
          {invite.status === "proposed" ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button disabled={busy} onClick={() => respond("confirmed")}>Accept</Button>
              <Button variant="secondary" disabled={busy} onClick={() => respond("declined")}>Decline</Button>
              <Button variant="dangerGhost" disabled={busy} onClick={() => respond("cancelled")}>Cancel plan</Button>
            </div>
          ) : invite.status === "confirmed" ? (
            <div>
              <p style={{ margin: "0 0 12px", fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}>
                Finished your walk? Mark it as completed and a walk record is added automatically.
              </p>
              <Button disabled={busy} icon="check" onClick={() => respond("completed")}>
                Mark as completed
              </Button>
            </div>
          ) : invite.status === "completed" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
                ✅ This walk is completed — a walk record was added automatically.
              </span>
              <Button variant="secondary" onClick={() => router.push("/walks/records")}>
                View records
              </Button>
            </div>
          ) : (
            <span style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
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
      <div style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)" }}>{label}</div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--text)", marginTop: 4 }}>{value}</div>
    </div>
  );
}
