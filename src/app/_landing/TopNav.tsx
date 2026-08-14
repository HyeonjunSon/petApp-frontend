"use client";

import Link from "next/link";

export default function TopNav() {
  return (
    <header className="ld-header">
      <div className="in">
        <Link href="/" className="ld-logo">
          🐾 PetDate
        </Link>
        <nav className="ld-nav">
          <a href="#feats">기능</a>
          <a href="#how">이용 방법</a>
          <a href="#safety">안전</a>
        </nav>
        <span className="cta">
          <Link href="/login" className="lg">
            로그인
          </Link>
          <Link href="/register" className="ld-btn-sm">
            시작하기
          </Link>
        </span>
      </div>
    </header>
  );
}
