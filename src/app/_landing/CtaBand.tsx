"use client";

import Link from "next/link";

export default function CtaBand() {
  return (
    <div className="ld-cta" id="join">
      <div className="in">
        <h2>Bring your dog to the block</h2>
        <p>Free to join. Your neighbourhood pack is already out there.</p>
        <Link href="/register" className="btn">
          Get started
        </Link>
      </div>
    </div>
  );
}
