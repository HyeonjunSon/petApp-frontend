"use client";

import React from "react";

/* ============================================================
   cx helper
   ============================================================ */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ============================================================
   Icon (stroke, 24 viewBox, currentColor)
   ============================================================ */
const ICON_PATHS: Record<string, string> = {
  heart: "M12 21s-7.5-4.6-10-9.2C.6 9 1.6 5.5 4.8 4.6 7 4 9 5 12 8c3-3 5-4 7.2-3.4C22.4 5.5 23.4 9 22 11.8 19.5 16.4 12 21 12 21z",
  close: "M6 6l12 12M18 6L6 18",
  info: "M12 16v-5M12 8h.01M12 3a9 9 0 100 18 9 9 0 000-18z",
  back: "M15 18l-6-6 6-6",
  fwd: "M9 18l6-6-6-6",
  paw: "M11 14c-2 0-3.5 1.3-4 3-.3 1.2.6 2 1.8 2 1 0 1.5-.5 2.2-.5s1.2.5 2.2.5c1.2 0 2.1-.8 1.8-2-.5-1.7-2-3-4-3zM6.5 9.5a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zm11 0a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zM9.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  walk: "M13 4a1.6 1.6 0 100-3.2A1.6 1.6 0 0013 4zM11 21l1.5-5L10 13l1-5 3 1 2 3M9 9l2-1M12 16l-2 5",
  chat: "M21 11.5a8.4 8.4 0 01-12 7.6L3 21l1.9-5.6A8.4 8.4 0 1121 11.5z",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-6 8-6s8 2 8 6",
  plus: "M12 5v14M5 12h14",
  camera: "M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm9 3a3.2 3.2 0 100 6.4A3.2 3.2 0 0012 11z",
  pin: "M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10zm0-7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  cal: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z",
  clock: "M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z",
  cog: "M12 9a3 3 0 100 6 3 3 0 000-6zM3 12l2 .6.7 1.7-1 1.8 1.4 1.4 1.8-1 1.7.7L12 21l.6-2 1.7-.7 1.8 1 1.4-1.4-1-1.8.7-1.7L21 12l-2-.6-.7-1.7 1-1.8-1.4-1.4-1.8 1-1.7-.7L12 3l-.6 2-1.7.7-1.8-1L6.5 6.1l1 1.8-.7 1.7z",
  shield: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3zM9 12l2 2 4-4",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 21a2 2 0 004 0",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4-4",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  check: "M5 13l4 4L19 7",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  ruler: "M3 8l5-5 13 13-5 5L3 8zm4 0l1.5 1.5M10 5l1.5 1.5M13 8l1.5 1.5M16 11l1.5 1.5",
  edit: "M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3zM13.5 6.5l3 3",
  logout: "M15 12H4m0 0l4-4m-4 4l4 4M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4",
  bolt: "M13 3L4 14h6l-1 7 9-11h-6l1-7z",
  filter: "M3 5h18M6 12h12M10 19h4",
  refresh: "M21 12a9 9 0 11-3-6.7M21 4v4h-4",
  flag: "M5 21V4m0 0h11l-2 4 2 4H5",
  block: "M12 3a9 9 0 100 18 9 9 0 000-18zM5.6 5.6l12.8 12.8",
  ext: "M9 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3M14 4h6m0 0v6m0-6L10 14",
  route: "M6 19a2 2 0 100-4 2 2 0 000 4zm12-10a2 2 0 100-4 2 2 0 000 4zM8 17h6a3 3 0 003-3V9M6 15V8",
  upload: "M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2",
};

export type IconName = keyof typeof ICON_PATHS;
const SOLID_ICONS = new Set<IconName>(["heart", "star", "paw"]);

export function Icon({
  name, size = 24, fill = false, color, className, style, ...rest
}: {
  name: IconName;
  size?: number;
  fill?: boolean;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const d = ICON_PATHS[name] || "";
  const solid = fill && SOLID_ICONS.has(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solid ? "currentColor" : "none"}
      stroke={solid ? "none" : "currentColor"}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ color, flexShrink: 0, ...style }}
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}

/* ============================================================
   Spinner
   ============================================================ */
export function Spinner({ className }: { className?: string }) {
  return <span className={cx("pd-spinner", className)} aria-hidden />;
}

/* ============================================================
   Button
   ============================================================ */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerGhost";
type ButtonSize = "sm" | "md" | "lg";

const BTN_HEIGHT: Record<ButtonSize, number> = { sm: 36, md: 44, lg: 52 };
const BTN_FONT: Record<ButtonSize, string> = { sm: "13px", md: "16px", lg: "16px" };
const BTN_PAD: Record<ButtonSize, string> = { sm: "0 14px", md: "0 20px", lg: "0 24px" };

function buttonStyle(variant: ButtonVariant, size: ButtonSize, full?: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: 700,
    borderRadius: "var(--r-btn)",
    transition: "opacity .15s, background .15s",
    border: "none",
    cursor: "pointer",
    height: BTN_HEIGHT[size],
    fontSize: BTN_FONT[size],
    padding: BTN_PAD[size],
    width: full ? "100%" : undefined,
    fontFamily: "inherit",
  };
  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: "var(--brand)", color: "var(--on-brand)" },
    secondary: { background: "var(--bg)", color: "var(--ink)", boxShadow: "inset 0 0 0 1px var(--border)" },
    ghost: { background: "transparent", color: "var(--brand-strong)" },
    danger: { background: "var(--danger)", color: "#fff" },
    dangerGhost: { background: "transparent", color: "var(--danger)" },
  };
  return { ...base, ...variants[variant] };
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon,
  className,
  children,
  disabled,
  style,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: IconName;
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      className={className}
      disabled={isDisabled}
      style={{
        ...buttonStyle(variant, size, fullWidth),
        opacity: isDisabled ? 0.55 : 1,
        pointerEvents: isDisabled ? "none" : "auto",
        ...style,
      }}
      {...rest}
    >
      {loading ? <Spinner /> : icon ? <Icon name={icon} size={size === "sm" ? 16 : 18} /> : null}
      {children}
    </button>
  );
}

/* ============================================================
   Card
   ============================================================ */
export function Card({
  className,
  children,
  padded = true,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  padded?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cx("surface", className)}
      style={{
        borderRadius: "var(--r-card)",
        padding: padded ? 20 : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title, subtitle, right,
}: {
  title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-bold" style={{ color: "var(--ink)" }}>{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm" style={{ color: "var(--ink-soft)" }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/* ============================================================
   Field + Input + Textarea + Select
   ============================================================ */
export function Field({
  label, hint, error, required, children, className,
}: {
  label?: string; hint?: string; error?: string; required?: boolean;
  children: React.ReactNode; className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      {label && (
        <div className="mb-1.5 text-sm font-medium" style={{ color: "var(--ink)" }}>
          {label}
          {required && <span className="ml-0.5" style={{ color: "var(--danger)" }}>*</span>}
        </div>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs" style={{ color: "var(--ink-soft)" }}>{hint}</p>
      ) : null}
    </label>
  );
}

const inputBaseStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "var(--r-input)",
  background: "var(--bg)",
  color: "var(--ink)",
  padding: "0 14px",
  fontSize: 14,
  outline: "none",
  transition: "border-color .15s",
  fontFamily: "inherit",
  border: "1px solid var(--border)",
};

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, style, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={className}
      style={{
        ...inputBaseStyle,
        height: 44,
        borderColor: invalid ? "var(--danger)" : "var(--border)",
        ...style,
      }}
      {...rest}
    />
  );
});

export function Textarea({
  className, invalid, style, ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={className}
      style={{
        ...inputBaseStyle,
        padding: "10px 14px",
        borderColor: invalid ? "var(--danger)" : "var(--border)",
        ...style,
      }}
      {...rest}
    />
  );
}

export function Select({
  className, invalid, children, style, ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={className}
      style={{
        ...inputBaseStyle,
        height: 44,
        borderColor: invalid ? "var(--danger)" : "var(--border)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

/* ============================================================
   Chip (selectable)
   ============================================================ */
export function Chip({
  active, children, onClick, className, style,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 34,
        padding: "0 14px",
        borderRadius: "var(--r-chip)",
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: "nowrap",
        transition: "all .15s",
        cursor: "pointer",
        background: active ? "var(--brand-soft)" : "var(--bg)",
        color: active ? "var(--brand-strong)" : "var(--ink-soft)",
        border: "none",
        boxShadow: active ? "inset 0 0 0 1px var(--brand)" : "inset 0 0 0 1px var(--border)",
        fontFamily: "inherit",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ============================================================
   Badge
   ============================================================ */
type BadgeTone = "neutral" | "brand" | "glass" | "success" | "warning" | "danger" | "slate" | "amber" | "rose";
const BADGE_TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: "rgba(15,23,42,.55)", fg: "#fff" },
  brand: { bg: "var(--brand-soft)", fg: "var(--brand-strong)" },
  glass: { bg: "rgba(255,255,255,.9)", fg: "var(--ink)" },
  success: { bg: "var(--brand-soft)", fg: "var(--brand-strong)" },
  warning: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  amber: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  danger: { bg: "var(--danger-soft)", fg: "var(--danger)" },
  rose: { bg: "var(--danger-soft)", fg: "var(--danger)" },
  slate: { bg: "var(--surface-2)", fg: "var(--ink-soft)" },
};

export function Badge({
  tone = "neutral", children, className, style,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = BADGE_TONES[tone];
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 22,
        padding: "0 9px",
        borderRadius: "var(--r-chip)",
        fontSize: 12,
        fontWeight: 700,
        background: t.bg,
        color: t.fg,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ============================================================
   Banner
   ============================================================ */
export function Banner({
  tone = "brand", children,
}: { tone?: "brand" | "rose" | "amber"; children: React.ReactNode }) {
  const tones = {
    brand: { bg: "var(--brand-tint)", border: "var(--brand-soft)", fg: "var(--brand-strong)" },
    rose: { bg: "var(--danger-soft)", border: "var(--danger-soft)", fg: "var(--danger)" },
    amber: { bg: "var(--warning-soft)", border: "var(--warning-soft)", fg: "var(--warning)" },
  } as const;
  const t = tones[tone];
  return (
    <div
      style={{
        borderRadius: 12,
        padding: "10px 16px",
        fontSize: 14,
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.fg,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   Avatar / PairAvatar
   ============================================================ */
export function Avatar({
  src, size = 40, ring, emoji, alt = "", className, style,
}: {
  src?: string;
  size?: number;
  ring?: boolean;
  emoji?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        background: "var(--surface-2)",
        boxShadow: ring ? "0 0 0 2px var(--bg), 0 0 0 4px var(--brand)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fb === "1") return;
            img.dataset.fb = "1";
            img.src = "/img/pet-placeholder.svg";
          }}
        />
      ) : (
        emoji
      )}
    </div>
  );
}

export function PairAvatar({
  face, pet, size = 46,
}: { face?: string; pet?: string; size?: number }) {
  const s = Math.round(size * 0.68);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <Avatar src={pet} size={s} style={{ position: "absolute", top: 0, left: 0, boxShadow: "0 0 0 2px var(--bg)" }} />
      <Avatar src={face} size={s} style={{ position: "absolute", bottom: 0, right: 0, boxShadow: "0 0 0 2px var(--bg)" }} />
    </div>
  );
}

/* ============================================================
   Sheet (bottom on mobile / centered modal on desktop)
   ============================================================ */
export function Sheet({
  open, onClose, children, title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  /** @deprecated layout is now responsive via CSS (bottom sheet on mobile, centered modal on desktop) */
  desktop?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      // mobile: dim + dock to bottom · desktop: dim + center as a dialog
      className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6"
      style={{ background: "var(--overlay)", animation: "pd-fade .2s ease" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[92vh] overflow-auto rounded-t-[20px] md:w-full md:max-w-[460px] md:rounded-2xl"
        style={{ background: "var(--bg)", boxShadow: "var(--sh-pop)", animation: "pd-pop .25s ease" }}
      >
        {/* grab handle — mobile only */}
        <div className="flex justify-center pb-0.5 pt-2.5 md:hidden">
          <div style={{ width: 40, height: 5, borderRadius: 999, background: "var(--border-strong)" }} />
        </div>
        {title && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 8px" }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
            <button type="button" onClick={onClose} style={{ color: "var(--ink-soft)", display: "flex", background: "transparent", border: "none", cursor: "pointer", padding: 4 }}>
              <Icon name="close" size={22} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   Toast
   ============================================================ */
export type ToastData = { msg: string; type?: "ok" | "error" } | null;

export function Toast({ toast }: { toast: ToastData }) {
  if (!toast) return null;
  const err = toast.type === "error";
  return (
    <div
      style={{
        position: "fixed",
        bottom: 96,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 95,
        background: err ? "var(--danger)" : "var(--ink)",
        color: "#fff",
        padding: "11px 18px",
        borderRadius: "var(--r-chip)",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
        boxShadow: "var(--sh-pop)",
        animation: "pd-rise .25s ease",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Icon name={err ? "info" : "check"} size={16} /> {toast.msg}
    </div>
  );
}

/* ============================================================
   EmptyState
   ============================================================ */
export function EmptyState({
  emoji = "🐾", title, desc, action,
}: {
  emoji?: string;
  title: React.ReactNode;
  desc?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "48px 28px",
        gap: 6,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: "var(--brand-tint)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          marginBottom: 6,
        }}
      >
        {emoji}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{title}</div>
      {desc && <div style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 240 }}>{desc}</div>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

/* ============================================================
   Switch
   ============================================================ */
export function Switch({
  on, onChange, label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
        width: label ? "100%" : "auto",
        justifyContent: label ? "space-between" : "flex-start",
      }}
    >
      {label && <span style={{ fontSize: 14, color: "var(--ink)" }}>{label}</span>}
      <span
        style={{
          width: 46,
          height: 28,
          borderRadius: 999,
          padding: 3,
          flexShrink: 0,
          background: on ? "var(--brand)" : "var(--border-strong)",
          transition: "background .2s",
          display: "flex",
          justifyContent: on ? "flex-end" : "flex-start",
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,.2)",
          }}
        />
      </span>
    </button>
  );
}

/* ============================================================
   SectionTitle
   ============================================================ */
export function SectionTitle({
  children, action, style,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "0 0 10px",
        ...style,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{children}</h3>
      {action}
    </div>
  );
}
