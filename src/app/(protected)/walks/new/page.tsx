"use client";

/** New plan — create a walk-invite with a matched partner. */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Button, Input, Textarea, Select, Field, Banner } from "@/components/ui";
import { type Match, peerOf, pickPet } from "../../chat/types";

/* 시안 카드: surface + radius-2xl + shadow-card, 보더 없음 */
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

export default function NewWalkInvitePage() {
  const router = useRouter();
  const { user } = useAuth();
  const myId = (user as any)?._id || "";

  const [matches, setMatches] = useState<Match[]>([]);
  const [matchId, setMatchId] = useState("");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [address, setAddress] = useState("");
  const [duration, setDuration] = useState("");
  const [maxPeople, setMaxPeople] = useState("2");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [petCond, setPetCond] = useState("any");
  const [approval, setApproval] = useState("auto");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Match[]>("/matches")
      .then(({ data }) => {
        setMatches(data || []);
        if (data?.[0]) setMatchId(data[0]._id);
      })
      .catch(() => {});
  }, []);

  const submit = async () => {
    setErr(null);
    if (!matchId) return setErr("Please choose a partner. You need a match first.");
    if (!date || !time) return setErr("Please enter a date and start time.");
    setBusy(true);
    try {
      const noteParts = [
        title && `Title: ${title}`,
        address && `Meeting point: ${address}`,
        duration && `About ${duration} min`,
        petCond !== "any" &&
          `Condition: ${petCond === "small" ? "Small dogs only" : petCond === "medium" ? "Medium dogs only" : "Large dogs only"}`,
        `Up to ${maxPeople} people · ${approval === "auto" ? "Auto-accept" : "Manual approval"}`,
      ].filter(Boolean);
      await api.post(`/matches/${matchId}/walk-invite`, {
        date,
        time,
        place: place || undefined,
        note: noteParts.join(" · ") || undefined,
      });
      router.replace("/walks");
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "Couldn't create the plan.");
    } finally {
      setBusy(false);
    }
  };

  const partnerLabel = (m: Match) => {
    const peer = peerOf(m, myId);
    const pet = pickPet(peer);
    return `${pet?.name || "Friend"} · ${peer?.name || "Owner"}`;
  };

  return (
    <Page title="New plan" subtitle="Set up a new walk with a friend." maxWidth={880}>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Basic info</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Partner" required>
              {matches.length === 0 ? (
                <p style={{ fontSize: "var(--fs-meta)", color: "var(--text-secondary)", margin: 0 }}>
                  No matches yet. Make a friend in Discover first.
                </p>
              ) : (
                <Select value={matchId} onChange={(e) => setMatchId(e.target.value)}>
                  {matches.map((m) => (
                    <option key={m._id} value={m._id}>{partnerLabel(m)}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekend morning walk" />
            </Field>
            <Field label="Place">
              <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Seoul Forest" />
            </Field>
            <Field label="Address · Meeting point">
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter an address or meeting point" />
            </Field>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="Estimated duration (min)">
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} inputMode="numeric" style={{ width: 140 }} />
              </Field>
              <Field label="Max people">
                <Select value={maxPeople} onChange={(e) => setMaxPeople(e.target.value)} style={{ width: 110 }}>
                  {["2", "3", "4", "5"].map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </Field>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Schedule</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Field label="Date" required>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 180 }} />
            </Field>
            <Field label="Start time" required>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: 180 }} />
            </Field>
          </div>
          <Field label="Pet condition" className="mt-4">
            <Select value={petCond} onChange={(e) => setPetCond(e.target.value)}>
              <option value="any">Any</option>
              <option value="small">Small dogs only</option>
              <option value="medium">Medium dogs only</option>
              <option value="large">Large dogs only</option>
            </Select>
          </Field>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Participation</h2>
          <Field label="Approval">
            <Select value={approval} onChange={(e) => setApproval(e.target.value)}>
              <option value="auto">Auto-accept</option>
              <option value="manual">Manual approval</option>
            </Select>
          </Field>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button variant="secondary" onClick={() => router.push("/walks")}>Cancel</Button>
          <Button onClick={submit} loading={busy} disabled={matches.length === 0}>
            Create plan
          </Button>
        </div>
      </div>
    </Page>
  );
}
