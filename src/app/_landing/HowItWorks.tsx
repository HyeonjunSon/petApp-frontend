"use client";

const STEPS = [
  {
    title: "Claim your home turf",
    desc: "Add your dog and pick the neighbourhood you walk.",
  },
  {
    title: "Follow the feed",
    desc: "See alerts, walk calls, and posts from within walking distance.",
  },
  {
    title: "Head outside",
    desc: "Join a walk or call one of your own — the pack meets outside.",
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
