"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="ld-hero">
      <div>
        <h1>
          우리 강아지의
          <br />
          <em>산책 친구</em>를 찾아보세요
        </h1>
        <p className="sub">
          가까운 동네 보호자와 펫을 만나 같이 걷고,
          <br />
          친구가 되고, 데이트까지 이어져요.
        </p>
        <div className="btns">
          <Link href="/register" className="ld-btn-hero">
            무료로 시작하기
          </Link>
          <Link href="/login" className="ld-btn-hero ghost">
            둘러보기
          </Link>
        </div>
      </div>
      <div className="visual" aria-hidden>
        <div className="ld-match">
          <div className="ph">
            🐩<span className="dist">0.8km</span>
          </div>
          <div className="bd">
            <div className="nm">보리 · 2살</div>
            <div className="mt">푸들 · 여아 · 김민지 보호자</div>
            <div className="tags">
              <span className="tag">아침 산책</span>
              <span className="tag">공놀이</span>
            </div>
          </div>
          <div className="acts">
            <span className="pass">패스</span>
            <span className="like">좋아요</span>
          </div>
        </div>
      </div>
    </section>
  );
}
