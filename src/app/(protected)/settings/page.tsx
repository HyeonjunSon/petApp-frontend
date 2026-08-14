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
  background: "var(--input-bg)",
  borderRadius: 10,
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
      className="pd-card pd-menu"
      style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}
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
    <Page title="설정" subtitle="내 정보와 앱 환경을 관리해요." maxWidth={720}>
      <style>{`.pdi:focus{box-shadow:0 0 0 2px var(--primary)}`}</style>

      <SectionTitle>프로필</SectionTitle>
      <MenuCard>
        <MenuItem
          leading={<Avatar src={face} fallbackText={(user?.name || "나")[0]} size={34} />}
          label="내 프로필 수정"
          onClick={() => router.push("/settings/profile")}
        />
        <MenuItem
          icon="paw"
          bg="var(--primary-10)"
          color="var(--primary)"
          label="내 펫 프로필 수정"
          onClick={() => router.push("/settings/pet")}
        />
      </MenuCard>

      <SectionTitle>매칭 환경</SectionTitle>
      <MenuCard>
        <MenuItem
          icon="filter"
          bg="var(--info-soft)"
          color="var(--info)"
          label="노출 · 필터 설정"
          onClick={() => router.push("/settings/exposure")}
        />
        <MenuItem
          icon="bell"
          bg="var(--warning-soft)"
          color="var(--warning)"
          label="알림 설정"
          onClick={() => router.push("/settings/notifications")}
        />
      </MenuCard>

      <SectionTitle>구독</SectionTitle>
      <MenuCard>
        <MenuItem
          icon="heart"
          bg="var(--primary-10)"
          color="var(--primary)"
          label="프리미엄 구독 관리"
          onClick={() => router.push("/subscription/billing")}
        />
      </MenuCard>

      <SectionTitle>계정</SectionTitle>
      <MenuCard>
        <MenuItem
          icon="shield"
          bg="var(--success-soft)"
          color="var(--success)"
          label="비밀번호 변경"
          onClick={() => setPwOpen(true)}
        />
        <MenuItem
          icon="logout"
          bg="var(--danger-soft)"
          color="var(--danger)"
          label="로그아웃"
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
          label="회원 탈퇴"
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
    if (next.length < 6) return setErr("새 비밀번호는 6자 이상이어야 해요.");
    setBusy(true);
    try {
      await api.post("/auth/change-password", { currentPassword: cur, newPassword: next });
      setOk(true);
      setCur(""); setNext("");
    } catch (e: any) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || "비밀번호를 변경하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="비밀번호 변경" desktop>
      <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {err && <Banner tone="rose">{err}</Banner>}
        {ok && <Banner tone="brand">비밀번호가 변경되었어요.</Banner>}
        <Field label="현재 비밀번호">
          <Input className="pdi" style={INPUT_STYLE} type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
        </Field>
        <Field label="새 비밀번호" hint="6자 이상 입력해 주세요.">
          <Input className="pdi" style={INPUT_STYLE} type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Button fullWidth size="lg" loading={busy} onClick={submit}>변경하기</Button>
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
    <Sheet open={open} onClose={onClose} title="회원 탈퇴" desktop>
      <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
          계정과 모든 데이터가 영구적으로 삭제돼요. 이 작업은 되돌릴 수 없어요.
        </p>
        <Button variant="danger" fullWidth size="lg" loading={busy} onClick={submit}>
          영구 삭제
        </Button>
      </div>
    </Sheet>
  );
}
