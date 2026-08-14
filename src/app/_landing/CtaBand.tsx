"use client";

import Link from "next/link";

export default function CtaBand() {
  return (
    <div className="ld-cta" id="safety">
      <div className="in pd-gradient">
        <h2>오늘, 초코의 첫 친구를 만들어 주세요</h2>
        <p>가입은 무료예요. 프로필 하나면 준비 끝.</p>
        <Link href="/register">지금 시작하기</Link>
      </div>
    </div>
  );
}
