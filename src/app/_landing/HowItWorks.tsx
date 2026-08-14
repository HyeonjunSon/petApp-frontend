"use client";

const STEPS = [
  {
    title: "펫 프로필 만들기",
    desc: "사진과 성격, 좋아하는 산책 코스를 등록해요.",
  },
  {
    title: "동네 친구 매칭",
    desc: "3km 이내의 친구를 추천받고 서로 좋아요를 눌러요.",
  },
  {
    title: "산책 약속 잡기",
    desc: "채팅으로 시간·장소를 정하고 함께 걸어요.",
  },
];

export default function HowItWorks() {
  return (
    <section className="ld-sect" id="how">
      <h2>이렇게 시작해요</h2>
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
