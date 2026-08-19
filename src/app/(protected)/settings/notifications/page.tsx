"use client";

/** 알림 설정. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Button, Switch, Banner, Toast, type ToastData } from "@/components/ui";

const PUSH = [
  ["match", "New match suggestions"],
  ["invite", "Walk meetup invites"],
  ["inviteStatus", "Walk meetup status updates"],
  ["message", "New messages"],
  ["follow", "New followers"],
];
const EMAIL = [
  ["weekly", "Weekly match digest"],
  ["newMessage", "New messages"],
  ["walkAlert", "Walk meetup reminders"],
  ["profileView", "Profile view alerts"],
];
const ETC = [
  ["serviceUpdate", "Service updates"],
  ["events", "Events & offers"],
  ["marketing", "Marketing emails"],
];

function SectionTitle({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <h2 style={{ margin: first ? "0 0 12px" : "28px 0 12px", fontSize: "var(--fs-h3)", fontWeight: 800, color: "var(--text)" }}>
      {children}
    </h2>
  );
}

function Group({
  title,
  items,
  state,
  setState,
}: {
  title: string;
  items: string[][];
  state: Record<string, boolean>;
  setState: (k: string, v: boolean) => void;
}) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="pd-card" style={{ padding: "6px 16px" }}>
        {items.map(([k, label], i) => (
          <div
            key={k}
            style={{
              padding: "13px 0",
              borderTop: i === 0 ? "none" : "0.5px solid var(--border)",
            }}
          >
            <Switch on={state[k] ?? true} onChange={(v) => setState(k, v)} label={label} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [master, setMaster] = useState(true);
  const [state, setStateMap] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      if (typeof data?.push === "boolean") setMaster(data.push);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const setState = (k: string, v: boolean) => setStateMap((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.put("/settings", { push: master });
      setToast({ msg: "Notification settings saved", type: "ok" });
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "Failed to save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Notifications" subtitle="Choose which notifications you receive." maxWidth={680}>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <SectionTitle first>Notification consent</SectionTitle>
      <div className="pd-card" style={{ padding: 16 }}>
        <Switch on={master} onChange={setMaster} label="Receive all notifications" />
        <p style={{ margin: "8px 0 0", fontSize: "var(--fs-meta)", color: "var(--text-secondary)" }}>
          Turn this on to receive all notifications below.
        </p>
      </div>

      <Group title="Push notifications" items={PUSH} state={state} setState={setState} />
      <Group title="Email notifications" items={EMAIL} state={state} setState={setState} />
      <Group title="Other" items={ETC} state={state} setState={setState} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>Cancel</Button>
        <Button onClick={save} loading={busy} icon="check">Save</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
