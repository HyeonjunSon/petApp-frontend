"use client";

/** 알림 설정. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Page } from "@/components/shell/Page";
import { Button, Switch, Banner, Toast, type ToastData } from "@/components/ui";

const PUSH = [
  ["match", "New match suggestions"],
  ["invite", "Walk plan invites"],
  ["inviteStatus", "Walk plan status changes"],
  ["message", "New messages"],
  ["follow", "New followers"],
];
const EMAIL = [
  ["weekly", "Weekly match digest"],
  ["newMessage", "New messages"],
  ["walkAlert", "Walk plan alerts"],
  ["profileView", "Profile view alerts"],
];
const ETC = [
  ["serviceUpdate", "Service updates"],
  ["events", "Events & offers"],
  ["marketing", "Marketing emails"],
];

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
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map(([k, label]) => (
          <Switch key={k} on={state[k] ?? true} onChange={(v) => setState(k, v)} label={label} />
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
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Notifications" maxWidth={680}>
      {err && <div style={{ marginBottom: 16 }}><Banner tone="rose">{err}</Banner></div>}

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>Notification consent</h2>
        <Switch on={master} onChange={setMaster} label="Receive all notifications" />
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>
          Turn on to receive all notifications below.
        </p>
      </div>

      <Group title="Push notifications" items={PUSH} state={state} setState={setState} />
      <Group title="Email notifications" items={EMAIL} state={state} setState={setState} />
      <Group title="Other" items={ETC} state={state} setState={setState} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Button variant="secondary" onClick={() => router.push("/settings")}>Cancel</Button>
        <Button onClick={save} loading={busy} icon="check">Save</Button>
      </div>

      <Toast toast={toast} />
    </Page>
  );
}
