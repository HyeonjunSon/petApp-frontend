"use client";

export default function SectionHead({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-[720px]">
      <div
        className="text-xs font-bold uppercase"
        style={{
          color: "var(--brand-strong)",
          letterSpacing: ".08em",
        }}
      >
        {kicker}
      </div>
      <h2
        className="m-0 mt-2 text-[30px] font-extrabold"
        style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-2 text-[15px] leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
