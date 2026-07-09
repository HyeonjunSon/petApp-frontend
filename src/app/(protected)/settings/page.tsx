"use client";

/** 프로필 / 설정 — settings hub. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Card as UICard, Button, Avatar, Sheet, Field, Input, Banner } from "@/components/ui";

function Row({
  avatar,
  title,
  desc,
  action,
}: {
  avatar?: React.ReactNode;
  title: string;
  desc: string;
  action: React.ReactNode;
}) {
  return (
    <UICard>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {avatar}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{title}</div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>{desc}</div>
        </div>
        {action}
      </div>
    </UICard>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

export default function SettingsHubPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const [pwOpen, setPwOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const face =
    (user as any)?.faceUrl ||
    (user?.photos || []).find((p) => p.type === "owner_face")?.url;

  return (
    <Page title="Profile / Settings" maxWidth={900}>
      <Section title="Pet profile">
        <Row
          avatar={<Avatar fallbackText="Pet" size={44} />}
          title="My pet profile"
          desc="Edit photo, temperament, walk style"
          action={<Button onClick={() => router.push("/settings/pet")}>Edit</Button>}
        />
      </Section>

      <Section title="Owner profile">
        <Row
          avatar={<Avatar src={face} fallbackText={(user?.name || "Me")[0]} size={44} />}
          title="My profile"
          desc="Edit nickname, bio, photo"
          action={<Button onClick={() => router.push("/settings/profile")}>Edit</Button>}
        />
      </Section>

      <Section title="Preferences">
        <Row
          title="Visibility & filters"
          desc="Manage radius, breed, age filters"
          action={<Button variant="secondary" onClick={() => router.push("/settings/exposure")}>Open</Button>}
        />
        <Row
          title="Notifications"
          desc="Manage match, chat, walk alerts"
          action={<Button variant="secondary" onClick={() => router.push("/settings/notifications")}>Open</Button>}
        />
      </Section>

      <Section title="Subscription">
        <Row
          title="Premium subscription"
          desc="Unlimited matches · Super Likes · premium filters"
          action={<Button variant="secondary" onClick={() => router.push("/subscription/billing")}>Manage</Button>}
        />
      </Section>

      <Section title="Account">
        <Row
          title="Change password"
          desc="Change your login password"
          action={<Button variant="secondary" onClick={() => setPwOpen(true)}>Change</Button>}
        />
        <Row
          title="Account"
          desc="Log out or delete account"
          action={
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                variant="secondary"
                onClick={async () => {
                  try { await api.post("/auth/logout"); } catch {}
                  logout();
                  setUser(null);
                  router.replace("/login");
                }}
              >
                Log out
              </Button>
              <Button variant="dangerGhost" onClick={() => setDelOpen(true)}>Delete account</Button>
            </div>
          }
        />
      </Section>

      <PasswordSheet open={pwOpen} onClose={() => setPwOpen(false)} />
      <DeleteSheet
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onDeleted={() => {
          logout();
          setUser(null);
          router.replace("/login");
        }}
      />
    </Page>
  );
}

function PasswordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const submit = async () => {
    setErr(null);
    if (next.length < 6) return setErr("New password must be at least 6 characters.");
    setBusy(true);
    try {
      await api.post("/auth/change-password", { currentPassword: cur, newPassword: next });
      setOk(true);
      setCur(""); setNext("");
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "Could not change.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Change password" desktop>
      <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {err && <Banner tone="rose">{err}</Banner>}
        {ok && <Banner tone="brand">Password changed.</Banner>}
        <Field label="Current password"><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
        <Field label="New password" hint="At least 6 characters"><Input type="password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <Button fullWidth size="lg" loading={busy} onClick={submit}>Change</Button>
      </div>
    </Sheet>
  );
}

function DeleteSheet({ open, onClose, onDeleted }: { open: boolean; onClose: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await api.delete("/account"); onDeleted(); } catch {} finally { setBusy(false); }
  };
  return (
    <Sheet open={open} onClose={onClose} title="Delete account" desktop>
      <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>
          Your account and all data will be permanently deleted. This cannot be undone.
        </p>
        <Button variant="danger" fullWidth size="lg" loading={busy} onClick={submit}>
          Delete permanently
        </Button>
      </div>
    </Sheet>
  );
}
