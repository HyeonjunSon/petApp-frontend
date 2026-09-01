"use client";

/** 설정 허브 — 시안 프로필 페이지의 메뉴 카드 문법. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Avatar, Sheet, Field, Input, Banner, Button, Icon, type IconName } from "@/components/ui";

const INPUT_STYLE: React.CSSProperties = {
  border: "none",
  background: "var(--paper)",
  borderRadius: "var(--radius-input)",
  height: 46,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "var(--fs-h3)",
        fontWeight: 800,
        margin: "28px 0 12px",
        color: "var(--text)",
      }}
    >
      {children}
    </div>
  );
}

function MenuCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="card pd-menu"
      style={{ padding: 0, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

function MenuItem({
  icon,
  bg,
  color,
  leading,
  label,
  onClick,
  danger,
}: {
  icon?: IconName;
  bg?: string;
  color?: string;
  leading?: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        padding: "14px 16px",
        textAlign: "left",
        fontSize: "var(--fs-body-sm)",
        fontWeight: 600,
        color: danger ? "var(--danger)" : "var(--text)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {leading || (
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            display: "grid",
            placeItems: "center",
            background: bg,
            color,
            flexShrink: 0,
          }}
        >
          {icon && <Icon name={icon} size={17} fill={icon === "paw"} />}
        </span>
      )}
      {label}
      <span style={{ marginLeft: "auto", color: "var(--text-secondary)", display: "flex" }}>
        <Icon name="fwd" size={16} />
      </span>
    </button>
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
    <Page title="Settings" subtitle="Manage your info and preferences." maxWidth={720}>
      <style>{`.pdi:focus{outline:2px solid var(--ink) !important}`}</style>

      <SectionTitle>Profile</SectionTitle>
      <MenuCard>
        <MenuItem
          leading={<Avatar src={face} fallbackText={(user?.name || "Me")[0]} size={34} />}
          label="Edit my profile"
          onClick={() => router.push("/settings/profile")}
        />
        <MenuItem
          icon="paw"
          bg="var(--primary-10)"
          color="var(--primary)"
          label="Edit pet profile"
          onClick={() => router.push("/settings/pet")}
        />
      </MenuCard>

      <SectionTitle>Matching</SectionTitle>
      <MenuCard>
        <MenuItem
          icon="filter"
          bg="var(--info-soft)"
          color="var(--info)"
          label="Visibility & filters"
          onClick={() => router.push("/settings/exposure")}
        />
        <MenuItem
          icon="bell"
          bg="var(--warning-soft)"
          color="var(--warning)"
          label="Notifications"
          onClick={() => router.push("/settings/notifications")}
        />
      </MenuCard>

      <SectionTitle>Subscription</SectionTitle>
      <MenuCard>
        <MenuItem
          icon="heart"
          bg="var(--primary-10)"
          color="var(--primary)"
          label="Manage Premium"
          onClick={() => router.push("/subscription/billing")}
        />
      </MenuCard>

      <SectionTitle>Account</SectionTitle>
      <MenuCard>
        <MenuItem
          icon="shield"
          bg="var(--success-soft)"
          color="var(--success)"
          label="Change password"
          onClick={() => setPwOpen(true)}
        />
        <MenuItem
          icon="logout"
          bg="var(--danger-soft)"
          color="var(--danger)"
          label="Log out"
          danger
          onClick={async () => {
            try { await api.post("/auth/logout"); } catch {}
            logout();
            setUser(null);
            router.replace("/login");
          }}
        />
        <MenuItem
          icon="trash"
          bg="var(--danger-soft)"
          color="var(--danger)"
          label="Delete account"
          danger
          onClick={() => setDelOpen(true)}
        />
      </MenuCard>

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
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "Failed to change password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Change password" desktop>
      <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {err && <Banner tone="rose">{err}</Banner>}
        {ok && <Banner tone="brand">Your password has been changed.</Banner>}
        <Field label="Current password">
          <Input className="pdi" style={INPUT_STYLE} type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
        </Field>
        <Field label="New password" hint="Must be at least 6 characters.">
          <Input className="pdi" style={INPUT_STYLE} type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Button fullWidth size="lg" loading={busy} onClick={submit}>Change password</Button>
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
        <p style={{ margin: 0, fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
          Your account and all data will be permanently deleted. This action cannot be undone.
        </p>
        <Button variant="danger" fullWidth size="lg" loading={busy} onClick={submit}>
          Delete permanently
        </Button>
      </div>
    </Sheet>
  );
}
