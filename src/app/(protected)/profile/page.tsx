"use client";

/** 프로필 — 시안의 프로필 허브. 히어로 + 통계 + 메뉴 카드 그룹. */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Page } from "@/components/shell/Page";
import { Avatar, Icon, Spinner, type IconName } from "@/components/ui";
import type { Pet } from "@/types/pet";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [walkCount, setWalkCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get<Pet[]>("/pets"),
      api.get("/matches"),
      api.get("/walk-invites"),
    ]).then(([pt, mt, inv]) => {
      if (pt.status === "fulfilled") setPets(pt.value.data || []);
      if (mt.status === "fulfilled") setMatchCount((mt.value.data || []).length);
      if (inv.status === "fulfilled")
        setWalkCount(
          (inv.value.data || []).filter((i: any) => i.status === "completed").length
        );
    });
  }, []);

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
  const name = user?.name || "사용자";
  const petSummary = pets
    .map((p) => `${p.name}${p.breed ? `(${p.breed})` : ""}`)
    .join(" · ");

  return (
    <Page title="프로필" subtitle="내 정보와 펫 프로필을 관리해요." maxWidth={1040}>
      {/* 히어로 */}
      <div
        className="pd-card"
        style={{
          padding: 28,
          display: "flex",
          alignItems: "center",
          gap: 22,
          flexWrap: "wrap",
        }}
      >
        <Avatar src={face} fallbackText={name[0] || "P"} size={84} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: "var(--fs-h2)",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {name}
            <span
              style={{
                background: "var(--success-soft)",
                color: "var(--success)",
                fontSize: "var(--fs-micro)",
                fontWeight: 700,
                borderRadius: "var(--radius-pill)",
                padding: "3px 10px",
              }}
            >
              ✓ 인증완료
            </span>
          </h3>
          <p
            className="pd-line1"
            style={{
              margin: "4px 0 0",
              fontSize: "var(--fs-meta)",
              color: "var(--text-secondary)",
            }}
          >
            {[user?.locationName, petSummary].filter(Boolean).join(" · ") ||
              user?.email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/settings/profile")}
          style={{
            marginLeft: "auto",
            background: "var(--input-bg)",
            color: "var(--text-secondary)",
            fontSize: "var(--fs-meta)",
            fontWeight: 600,
            borderRadius: "var(--radius-md)",
            padding: "10px 16px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <Icon name="edit" size={15} />
          프로필 수정
        </button>
      </div>

      {/* 통계 */}
      <div
        className="pd-card"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          marginTop: 16,
          padding: "18px 0",
          textAlign: "center",
        }}
      >
        <PStat v={matchCount === null ? "—" : String(matchCount)} l="매칭" first />
        <PStat v={walkCount === null ? "—" : String(walkCount)} l="산책" />
        <PStat v={String(pets.length)} l="내 펫" />
      </div>

      {/* 계정 */}
      <SectionTitle>계정</SectionTitle>
      <MenuCard>
        <MenuItem
          icon="paw"
          bg="var(--primary-10)"
          color="var(--primary)"
          label="내 펫 관리"
          onClick={() => router.push("/settings/pet")}
        />
        <MenuItem
          icon="pin"
          bg="var(--info-soft)"
          color="var(--info)"
          label="내 지역 설정"
          onClick={() => router.push("/settings/exposure")}
        />
        <MenuItem
          icon="shield"
          bg="var(--success-soft)"
          color="var(--success)"
          label="보호자 인증"
          onClick={() => router.push("/settings/profile")}
        />
      </MenuCard>

      {/* 알림 · 차단 */}
      <SectionTitle>알림 · 차단</SectionTitle>
      <MenuCard>
        <MenuItem
          icon="bell"
          bg="var(--warning-soft)"
          color="var(--warning)"
          label="알림 설정"
          onClick={() => router.push("/settings/notifications")}
        />
        <MenuItem
          icon="block"
          bg="var(--danger-soft)"
          color="var(--danger)"
          label="차단 목록"
          onClick={() => router.push("/settings")}
        />
      </MenuCard>

      {/* 기타 */}
      <SectionTitle>기타</SectionTitle>
      <MenuCard>
        <MenuItem
          icon="info"
          bg="var(--input-bg)"
          color="var(--text-secondary)"
          label="이용약관 · 개인정보처리방침"
          onClick={() => router.push("/terms")}
        />
        <MenuItem
          icon="logout"
          bg="var(--danger-soft)"
          color="var(--danger)"
          label={busy ? "로그아웃 중…" : "로그아웃"}
          danger
          right={busy ? <Spinner /> : undefined}
          onClick={onLogout}
        />
      </MenuCard>
    </Page>
  );
}

function PStat({ v, l, first }: { v: string; l: string; first?: boolean }) {
  return (
    <div style={{ borderLeft: first ? "none" : "1px solid var(--border)" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>{v}</div>
      <div
        style={{ fontSize: "var(--fs-caption)", color: "var(--text-secondary)", marginTop: 2 }}
      >
        {l}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "var(--fs-h3)",
        fontWeight: 800,
        letterSpacing: "var(--ls-snug)",
        margin: "28px 0 12px",
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
  label,
  onClick,
  danger,
  right,
}: {
  icon: IconName;
  bg: string;
  color: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  right?: React.ReactNode;
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
        <Icon name={icon} size={17} fill={icon === "paw"} />
      </span>
      {label}
      <span style={{ marginLeft: "auto", color: "var(--text-secondary)", display: "flex" }}>
        {right || <Icon name="fwd" size={16} />}
      </span>
    </button>
  );
}
