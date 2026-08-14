"use client";

const CARDS = [
  {
    em: "💜",
    title: "취향 매칭",
    desc: "견종·나이·산책 시간대가 맞는 동네 친구를 추천해요. 마음에 들면 좋아요, 아니면 패스.",
  },
  {
    em: "🐕",
    title: "같이 산책하기",
    desc: "채팅에서 바로 산책 약속을 잡고, 거리·시간·사진으로 기록을 남겨요.",
  },
  {
    em: "🛡️",
    title: "안전한 만남",
    desc: "보호자 인증 배지와 매너 평점, 신고·차단 기능으로 안심하고 만나요.",
  },
];

export default function Features() {
  return (
    <section className="ld-sect" id="feats" style={{ paddingTop: 0 }}>
      <h2>산책 메이트가 필요한 순간</h2>
      <p className="lead">매칭부터 산책 기록까지, 한 곳에서 해결해요.</p>
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
