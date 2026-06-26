"use client";

/** Local segmented control for settings page (theme + language). */

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
      className="flex gap-1 rounded-xl p-1"
      style={{ background: "var(--surface-2)" }}
    >
      {items.map((it) => {
        const active = it.v === value;
        return (
          <button
            key={it.v}
            type="button"
            onClick={() => onChange(it.v)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[9px] px-2 py-2.5 text-[13px] ${active ? "font-bold" : "font-medium"}`}
            style={{
              background: active ? "var(--bg)" : "transparent",
              color: active ? "var(--ink)" : "var(--ink-soft)",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: active ? "0 1px 2px rgba(0,0,0,.05)" : "none",
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
