"use client";

import Link from "next/link";

export default function TopNav() {
  return (
    <header className="ld-header">
      <div className="in">
        <Link href="/" className="logo" aria-label="Offleash home">
          <span className="logo-dot" />
          Offleash
        </Link>
        <nav className="ld-nav">
          <a href="#feats">Neighbourhood</a>
          <a href="#how">How it works</a>
          <a href="#join">Join the pack</a>
        </nav>
        <span className="cta">
          <Link href="/login" className="lg">
            Log in
          </Link>
          <Link href="/register" className="btn btn-sm">
            Get started
          </Link>
        </span>
      </div>
    </header>
  );
}
