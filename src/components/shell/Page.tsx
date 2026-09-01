import React from "react";

/**
 * Page — Offleash v2 content frame. Renders as the shell's main column
 * (spanning the rail slot too) with a display-font title row.
 */
export function Page({
  title,
  subtitle,
  right,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  /** kept for compatibility with older call sites; unused in v2 */
  maxWidth?: number;
}) {
  return (
    <main className="shell-main wide">
      {(title || right) && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            {title && <h1 style={{ fontSize: 28 }}>{title}</h1>}
            {subtitle && (
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--fence)" }}>
                {subtitle}
              </p>
            )}
          </div>
          {right && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {right}
            </div>
          )}
        </div>
      )}
      {children}
    </main>
  );
}

/**
 * Centered narrow frame for forms / focused flows (login, onboarding cards).
 */
export function CenteredPage({
  title,
  subtitle,
  children,
  width = 560,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <main className="shell-main wide">
      <div style={{ maxWidth: width, width: "100%", margin: "0 auto" }}>
        {title && <h1 style={{ fontSize: 24 }}>{title}</h1>}
        {subtitle && (
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--fence)" }}>
            {subtitle}
          </p>
        )}
        <div style={{ marginTop: title ? 20 : 0 }}>{children}</div>
      </div>
    </main>
  );
}

/**
 * ImagePlaceholder — photo box with graceful fallback.
 */
export function ImagePlaceholder({
  label,
  height = 200,
  radius = 12,
  src,
  alt = "",
}: {
  label?: string;
  height?: number | string;
  radius?: number;
  src?: string;
  alt?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height,
          objectFit: "cover",
          borderRadius: radius,
          display: "block",
        }}
        onError={(e) => {
          const img = e.currentTarget;
          if (img.dataset.fb === "1") return;
          img.dataset.fb = "1";
          img.src = "/img/pet-placeholder.svg";
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: radius,
        background: "var(--paper)",
        border: "1px dashed var(--line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--fence)",
        fontSize: 13,
        textAlign: "center",
        padding: 12,
      }}
    >
      {label || ""}
    </div>
  );
}
