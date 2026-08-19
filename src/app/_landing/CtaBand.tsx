"use client";

import Link from "next/link";

export default function CtaBand() {
  return (
    <div className="ld-cta" id="safety">
      <div className="in pd-gradient">
        <h2>Make your dog&apos;s first friend today</h2>
        <p>Signing up is free. One profile is all it takes.</p>
        <Link href="/register">Get started</Link>
      </div>
    </div>
  );
}
