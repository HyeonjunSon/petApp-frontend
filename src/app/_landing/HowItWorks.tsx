"use client";

const STEPS = [
  {
    title: "Create a pet profile",
    desc: "Add photos, personality, and favorite walking routes.",
  },
  {
    title: "Match with neighbors",
    desc: "Get suggestions within 3km and like each other to match.",
  },
  {
    title: "Plan a walk",
    desc: "Pick a time and place in chat, then walk together.",
  },
];

export default function HowItWorks() {
  return (
    <section className="ld-sect" id="how">
      <h2>How to get started</h2>
      <div className="ld-steps">
        {STEPS.map((s, i) => (
          <div className="ld-step" key={s.title}>
            <span className="no">{i + 1}</span>
            <b>{s.title}</b>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
