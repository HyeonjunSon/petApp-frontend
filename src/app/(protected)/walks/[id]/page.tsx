"use client";

/** Plan details — walk-invite detail + status actions. */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page, ImagePlaceholder } from "@/components/shell/Page";
import { Card as UICard, Button, Badge, Avatar, Spinner, EmptyState } from "@/components/ui";
import { type Match, type WalkInvite, peerOf, pickPet } from "../../chat/types";

const STATUS: Record<string, string> = {
  proposed: "Pending",
  confirmed: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
};

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

  const respond = async (status: "confirmed" | "declined" | "cancelled") => {
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
        <div className="flex justify-center pt-16" style={{ color: "var(--ink-soft)" }}><Spinner /></div>
      </Page>
    );
  }
  if (!invite) {
    return (
      <Page title="Plan details">
        <EmptyState emoji="🐾" title="Plan not found" action={<Button onClick={() => router.push("/walks")}>Back to Walk Plans</Button>} />
      </Page>
    );
  }

  const peer = match ? peerOf(match, myId) : undefined;
  const pet = pickPet(peer);

  return (
    <Page
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          Plan details <Badge tone={invite.status === "confirmed" ? "brand" : "slate"}>{STATUS[invite.status]}</Badge>
        </span>
      }
      maxWidth={900}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <UICard>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Plan info</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            <Info label="Date & time" value={`${invite.date} ${invite.time}`} />
            <Info label="Place" value={invite.place || "—"} />
            <Info label="Note" value={invite.note || "—"} />
          </div>
          <div style={{ marginTop: 16 }}>
            <ImagePlaceholder label="Map preview" height={200} />
          </div>
        </UICard>

        <UICard>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Partner owner</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar src={peer?.faceUrl} fallbackText={(peer?.name || "P")[0]} size={48} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{peer?.name || "Partner owner"}</div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{pet?.name ? `Pet ${pet.name}` : ""}</div>
            </div>
          </div>
        </UICard>

        <UICard>
          <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Plan status</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button disabled={busy || invite.status !== "proposed"} onClick={() => respond("confirmed")}>Accept</Button>
            <Button variant="secondary" disabled={busy || invite.status !== "proposed"} onClick={() => respond("declined")}>Decline</Button>
            <Button variant="dangerGhost" disabled={busy || invite.status === "cancelled"} onClick={() => respond("cancelled")}>Cancel</Button>
          </div>
        </UICard>
      </div>
    </Page>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{label}</div>
      <div style={{ fontSize: 15, color: "var(--ink)", marginTop: 4 }}>{value}</div>
    </div>
  );
}
