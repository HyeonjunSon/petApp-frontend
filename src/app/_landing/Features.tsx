"use client";

const CARDS = [
  {
    em: "💜",
    title: "Smart matching",
    desc: "Get matched with neighbors whose breed, age, and walk times fit yours. Like the ones you love, pass on the rest.",
  },
  {
    em: "🐕",
    title: "Walk together",
    desc: "Plan a walk right from chat, then log it with distance, time, and photos.",
  },
  {
    em: "🛡️",
    title: "Safe meetups",
    desc: "Verified-owner badges, manner ratings, and report/block tools keep every meetup safe.",
  },
];

export default function Features() {
  return (
    <section className="ld-sect" id="feats" style={{ paddingTop: 0 }}>
      <h2>For every moment you need a walking mate</h2>
      <p className="lead">From matching to walk logs — all in one place.</p>
      <div className="ld-feats">
        {CARDS.map((c) => (
          <div className="ld-feat" key={c.title}>
            <span className="em">{c.em}</span>
            <b>{c.title}</b>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
