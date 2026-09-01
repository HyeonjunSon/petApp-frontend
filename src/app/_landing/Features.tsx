"use client";

const CARDS = [
  {
    em: "📣",
    title: "Neighbourhood feed",
    desc: "Lost-dog alerts, walk-mate calls, and recommendations from people who actually walk your streets.",
  },
  {
    em: "🐕",
    title: "Walk together",
    desc: "Post a walk with a time and a meeting spot, see who's in, and head out as a pack.",
  },
  {
    em: "🎾",
    title: "Meet the pack",
    desc: "Browse the dogs around you by distance and put names to the faces you pass every day.",
  },
];

export default function Features() {
  return (
    <section className="ld-sect" id="feats" style={{ paddingTop: 0 }}>
      <h2>Everything happening on your block</h2>
      <p className="lead">
        No swiping, no matching — just your neighbourhood&apos;s dogs and their
        people.
      </p>
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
