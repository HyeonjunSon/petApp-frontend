"use client";

/**
 * PetDate UI components.
 * Single source of truth: docs/DESIGN.md (sections 6 & 7).
 *
 * Owner: [DS] for spec, [FE common] for implementation.
 * Do NOT add components or icons here without updating DESIGN.md first.
 *
 * Tokens come from globals.css :root / .dark — components use `var(--*)`
 * rather than Tailwind colors so dark mode flips automatically.
 */

import React from "react";

/* =============================================================
   cx — class name joiner
============================================================= */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* =============================================================
   Icon (DESIGN.md §6)
   24×24 viewBox, stroke-based, inherits currentColor.
   Solid fill is allowed for: heart, paw.
============================================================= */
const ICON_PATHS = {
  heart:
    "M12 21s-7.5-4.6-10-9.2C.6 9 1.6 5.5 4.8 4.6 7 4 9 5 12 8c3-3 5-4 7.2-3.4C22.4 5.5 23.4 9 22 11.8 19.5 16.4 12 21 12 21z",
  paw:
    "M11 14c-2 0-3.5 1.3-4 3-.3 1.2.6 2 1.8 2 1 0 1.5-.5 2.2-.5s1.2.5 2.2.5c1.2 0 2.1-.8 1.8-2-.5-1.7-2-3-4-3zM6.5 9.5a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zm11 0a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zM9.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  walk:
    "M13 4a1.6 1.6 0 100-3.2A1.6 1.6 0 0013 4zM11 21l1.5-5L10 13l1-5 3 1 2 3M9 9l2-1M12 16l-2 5",
  chat:
    "M21 11.5a8.4 8.4 0 01-12 7.6L3 21l1.9-5.6A8.4 8.4 0 1121 11.5z",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-6 8-6s8 2 8 6",
  cog:
    "M12 9a3 3 0 100 6 3 3 0 000-6zM3 12l2 .6.7 1.7-1 1.8 1.4 1.4 1.8-1 1.7.7L12 21l.6-2 1.7-.7 1.8 1 1.4-1.4-1-1.8.7-1.7L21 12l-2-.6-.7-1.7 1-1.8-1.4-1.4-1.8 1-1.7-.7L12 3l-.6 2-1.7.7-1.8-1L6.5 6.1l1 1.8-.7 1.7z",
  shield: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3zM9 12l2 2 4-4",
  bell:
    "M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 21a2 2 0 004 0",
  pin:
    "M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10zm0-7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  cal:
    "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z",
  clock: "M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z",
  camera:
    "M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm9 3a3.2 3.2 0 100 6.4A3.2 3.2 0 0012 11z",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 13l4 4L19 7",
  back: "M15 18l-6-6 6-6",
  fwd: "M9 18l6-6-6-6",
  filter: "M3 5h18M6 12h12M10 19h4",
  refresh: "M21 12a9 9 0 11-3-6.7M21 4v4h-4",
  flag: "M5 21V4m0 0h11l-2 4 2 4H5",
  block: "M12 3a9 9 0 100 18 9 9 0 000-18zM5.6 5.6l12.8 12.8",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  edit: "M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3zM13.5 6.5l3 3",
  logout:
    "M15 12H4m0 0l4-4m-4 4l4 4M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4",
  sun:
    "M12 4V2M12 22v-2M4 12H2M22 12h-2M4.93 4.93L3.5 3.5M20.5 20.5l-1.43-1.43M4.93 19.07L3.5 20.5M20.5 3.5l-1.43 1.43M12 17a5 5 0 100-10 5 5 0 000 10z",
  moon: "M21 12.8A9 9 0 1111.2 3a7 7 0 109.8 9.8z",
  info: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 8h.01M11 12h1v4h1",
} as const;

export type IconName = keyof typeof ICON_PATHS;
const SOLID_ALLOWED: Set<IconName> = new Set(["heart", "paw"]);

export function Icon({
  name,
  size = 22,
  fill = false,
  color,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  fill?: boolean;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const solid = fill && SOLID_ALLOWED.has(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solid ? "currentColor" : "none"}
      stroke={solid ? "none" : "currentColor"}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx("shrink-0", className)}
      style={{ color, ...style }}
      aria-hidden
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/* =============================================================
   Spinner — small inline loader
============================================================= */
export function Spinner({ className }: { className?: string }) {
  return <span className={cx("pd-spinner", className)} aria-hidden />;
}

/* =============================================================
   Skeleton (DESIGN.md §7.12)
============================================================= */
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={cx("pd-skel", className)} style={style} aria-hidden />;
}

/* =============================================================
   Button (DESIGN.md §7.1)
============================================================= */
type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "dangerGhost";
type ButtonSize = "sm" | "md" | "lg";

const BTN_H: Record<ButtonSize, number> = { sm: 36, md: 44, lg: 52 };
const BTN_FONT: Record<ButtonSize, string> = { sm: "13px", md: "15px", lg: "16px" };
const BTN_PAD: Record<ButtonSize, string> = { sm: "0 14px", md: "0 18px", lg: "0 22px" };

function buttonStyle(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth?: boolean
): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: 700,
    borderRadius: "var(--r-btn)",
    transition: "opacity .15s, background .15s, box-shadow .15s",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    height: BTN_H[size],
    fontSize: BTN_FONT[size],
    padding: BTN_PAD[size],
    width: fullWidth ? "100%" : undefined,
  };
  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: "var(--brand)", color: "#fff" },
    secondary: {
      background: "var(--bg)",
      color: "var(--ink)",
      boxShadow: "inset 0 0 0 1px var(--border)",
    },
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
      type={rest.type ?? "button"}
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

/* =============================================================
   Chip (DESIGN.md §7.2)
============================================================= */
export function Chip({
  active,
  onClick,
  className,
  children,
  style,
  disabled,
}: {
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
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
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        border: "none",
        background: active ? "var(--brand-soft)" : "var(--bg)",
        color: active ? "var(--brand-strong)" : "var(--ink-soft)",
        boxShadow: active
          ? "inset 0 0 0 1px var(--brand)"
          : "inset 0 0 0 1px var(--border)",
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* =============================================================
   Input / Textarea / Select (DESIGN.md §7.3)
============================================================= */
const INPUT_BASE: React.CSSProperties = {
  width: "100%",
  borderRadius: "var(--r-input)",
  background: "var(--bg)",
  color: "var(--ink)",
  fontSize: 14,
  outline: "none",
  transition: "border-color .15s",
  fontFamily: "inherit",
};

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ invalid, className, style, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={className}
      style={{
        ...INPUT_BASE,
        height: 44,
        padding: "0 14px",
        border: `1px solid ${invalid ? "var(--danger)" : "var(--border)"}`,
        ...style,
      }}
      {...rest}
    />
  );
});

export function Textarea({
  invalid,
  className,
  style,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={className}
      style={{
        ...INPUT_BASE,
        minHeight: 80,
        padding: "10px 14px",
        border: `1px solid ${invalid ? "var(--danger)" : "var(--border)"}`,
        ...style,
      }}
      {...rest}
    />
  );
}

export function Select({
  invalid,
  className,
  children,
  style,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={className}
      style={{
        ...INPUT_BASE,
        height: 44,
        padding: "0 14px",
        border: `1px solid ${invalid ? "var(--danger)" : "var(--border)"}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

/* =============================================================
   Field (DESIGN.md §7.4)
============================================================= */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      {label && (
        <div
          className="mb-1.5"
          style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}
        >
          {label}
          {required && (
            <span style={{ marginLeft: 2, color: "var(--danger)" }}>*</span>
          )}
        </div>
      )}
      {children}
      {error ? (
        <p className="mt-1" style={{ fontSize: 12, color: "var(--danger)" }}>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
          {hint}
        </p>
      ) : null}
    </label>
  );
}

/* =============================================================
   Card + CardHeader (DESIGN.md §7.5)
============================================================= */
export function Card({
  padded = true,
  className,
  children,
  style,
}: {
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-card)",
        boxShadow: "var(--sh-card)",
        padding: padded ? 20 : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <p
            className="mt-0.5"
            style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

/* =============================================================
   Badge (DESIGN.md §7.6)
============================================================= */
type BadgeTone = "neutral" | "brand" | "glass" | "amber" | "rose" | "slate";

const BADGE_TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: "rgba(15,23,42,.55)", fg: "#fff" },
  brand: { bg: "var(--brand-soft)", fg: "var(--brand-strong)" },
  glass: { bg: "rgba(255,255,255,.9)", fg: "var(--ink)" },
  amber: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  rose: { bg: "var(--danger-soft)", fg: "var(--danger)" },
  slate: { bg: "var(--surface-2)", fg: "var(--ink-soft)" },
};

export function Badge({
  tone = "neutral",
  className,
  children,
  style,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
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

/* =============================================================
   Avatar + PairAvatar (DESIGN.md §7.7)
   onError falls back to /img/pet-placeholder.svg (NO <cloud> literal).
============================================================= */
export function Avatar({
  src,
  size = 40,
  ring,
  alt = "",
  fallbackText,
  className,
  style,
}: {
  src?: string;
  size?: number;
  ring?: boolean;
  alt?: string;
  fallbackText?: string;
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
        background: "var(--ink)",
        color: "#fff",
        boxShadow: ring ? "0 0 0 2px var(--bg), 0 0 0 4px var(--brand)" : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.42),
        fontWeight: 700,
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
        fallbackText
      )}
    </div>
  );
}

export function PairAvatar({
  face,
  pet,
  size = 46,
}: {
  face?: string;
  pet?: string;
  size?: number;
}) {
  const s = Math.round(size * 0.68);
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <Avatar
        src={pet}
        size={s}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          boxShadow: "0 0 0 2px var(--bg)",
        }}
      />
      <Avatar
        src={face}
        size={s}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          boxShadow: "0 0 0 2px var(--bg)",
        }}
      />
    </div>
  );
}

/* =============================================================
   Sheet (DESIGN.md §7.8)
   Bottom sheet on mobile, centered modal on desktop.
============================================================= */
export function Sheet({
  open,
  onClose,
  title,
  children,
  desktop = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  desktop?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "var(--overlay)",
        display: "flex",
        alignItems: desktop ? "center" : "flex-end",
        justifyContent: "center",
        animation: "pd-fade .2s ease",
        padding: desktop ? 24 : 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: desktop ? 440 : "none",
          maxHeight: "92vh",
          overflow: "auto",
          background: "var(--bg)",
          color: "var(--ink)",
          borderRadius: desktop ? "var(--r-card)" : "20px 20px 0 0",
          animation: desktop
            ? "pd-pop .25s ease"
            : "pd-sheet .28s cubic-bezier(.2,.9,.3,1)",
          boxShadow: "var(--sh-pop)",
        }}
      >
        {!desktop && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "10px 0 2px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 5,
                borderRadius: 999,
                background: "var(--border-strong)",
              }}
            />
          </div>
        )}
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px 8px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                color: "var(--ink-soft)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <Icon name="close" size={22} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* =============================================================
   Toast (DESIGN.md §7.9)
   Component is presentational. Auto-dismiss is the caller's job
   (use a setTimeout in the page) — keeps Toast deterministic.
============================================================= */
export type ToastData = { msg: string; type?: "ok" | "error" } | null;

export function Toast({ toast }: { toast: ToastData }) {
  if (!toast) return null;
  const err = toast.type === "error";
  return (
    <div
      role="status"
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
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Icon name={err ? "close" : "check"} size={16} />
      {toast.msg}
    </div>
  );
}

/* =============================================================
   EmptyState (DESIGN.md §7.10)
============================================================= */
export function EmptyState({
  emoji = "🐾",
  title,
  desc,
  action,
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
      {desc && (
        <div
          style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 240 }}
        >
          {desc}
        </div>
      )}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

/* =============================================================
   Switch (DESIGN.md §7.11)
============================================================= */
export function Switch({
  on,
  onChange,
  label,
  disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      aria-pressed={on}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "transparent",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: 0,
        width: label ? "100%" : undefined,
        justifyContent: label ? "space-between" : "flex-start",
        fontFamily: "inherit",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {label && (
        <span style={{ fontSize: 14, color: "var(--ink)" }}>{label}</span>
      )}
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

/* =============================================================
   Banner (DESIGN.md §7.14) — inline notice, sibling to Toast.
============================================================= */
type BannerTone = "info" | "brand" | "amber" | "rose";

const BANNER_TONES: Record<BannerTone, { bg: string; fg: string }> = {
  info: { bg: "var(--surface-2)", fg: "var(--ink)" },
  brand: { bg: "var(--brand-tint)", fg: "var(--brand-strong)" },
  amber: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  rose: { bg: "var(--danger-soft)", fg: "var(--danger)" },
};

export function Banner({
  tone = "info",
  icon,
  className,
  children,
  style,
}: {
  tone?: BannerTone;
  icon?: IconName;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const t = BANNER_TONES[tone];
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: "var(--r-input)",
        background: t.bg,
        color: t.fg,
        fontSize: 13,
        fontWeight: 500,
        ...style,
      }}
    >
      {icon ? (
        <Icon name={icon} size={16} />
      ) : (
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: t.fg,
            flexShrink: 0,
          }}
        />
      )}
      <span style={{ flex: 1 }}>{children}</span>
    </div>
  );
}

/* =============================================================
   SectionTitle (DESIGN.md §7.13)
============================================================= */
export function SectionTitle({
  children,
  action,
  style,
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
      <h3
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 700,
          color: "var(--ink)",
        }}
      >
        {children}
      </h3>
      {action}
    </div>
  );
}
