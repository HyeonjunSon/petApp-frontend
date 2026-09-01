"use client";

/** 설정 화면용 세그먼트 컨트롤 (테마·언어 등). */

import { Icon, type IconName } from "@/components/ui";

export default function Segmented<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { v: T; label: string; icon?: IconName }[];
}) {
  return (
    <div
      className="flex gap-1 p-1"
      style={{ background: "var(--paper)", borderRadius: 999 }}
    >
      {items.map((it) => {
        const active = it.v === value;
        return (
          <button
            key={it.v}
            type="button"
            onClick={() => onChange(it.v)}
            className="flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5"
            style={{
              background: active ? "var(--ink)" : "transparent",
              color: active ? "var(--paper)" : "var(--fence)",
              fontSize: "var(--fs-meta)",
              fontWeight: active ? 600 : 500,
              border: "none",
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {it.icon && <Icon name={it.icon} size={14} />}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
