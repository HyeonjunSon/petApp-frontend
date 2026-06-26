import React from "react";

/**
 * Page — standard content frame for app screens.
 * Big bold title (wireframe) + optional right-aligned actions.
 */
export function Page({
  title,
  subtitle,
  right,
  children,
  maxWidth = 1080,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  return (
    <div style={{ padding: "32px 40px 64px" }}>
      <div style={{ maxWidth, margin: "0 auto" }}>
        {(title || right) && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            <div>
              {title && (
                <h1
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 800,
                    color: "var(--ink)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 14,
                    color: "var(--ink-soft)",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {right && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {right}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
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
    <div style={{ padding: "48px 24px 64px" }}>
      <div style={{ maxWidth: width, margin: "0 auto" }}>
        {title && (
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 14,
              color: "var(--ink-soft)",
            }}
          >
            {subtitle}
          </p>
        )}
        <div style={{ marginTop: title ? 24 : 0 }}>{children}</div>
      </div>
    </div>
  );
}

/**
 * ImagePlaceholder — the gray "X" placeholder boxes used throughout the
 * wireframes for not-yet-uploaded pet/profile photos.
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
        background: "var(--surface-2)",
        border: "1px dashed var(--border-strong)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--ink-faint)",
        fontSize: 13,
        textAlign: "center",
        padding: 12,
      }}
    >
      {label || ""}
    </div>
  );
}
