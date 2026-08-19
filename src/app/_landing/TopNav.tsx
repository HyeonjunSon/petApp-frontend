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
          <a href="#feats">Features</a>
          <a href="#how">How it works</a>
          <a href="#safety">Safety</a>
        </nav>
        <span className="cta">
          <Link href="/login" className="lg">
            Log in
          </Link>
          <Link href="/register" className="ld-btn-sm">
            Get started
          </Link>
        </span>
      </div>
    </header>
  );
}
