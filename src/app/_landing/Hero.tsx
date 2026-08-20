"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="ld-hero">
      <div>
        <h1>
          Find your dog&apos;s perfect
          <br />
          <em>walking mate</em>
        </h1>
        <p className="sub">
          Meet nearby owners and pets — walk together,
          <br />
          become friends, and maybe more.
        </p>
        <div className="btns">
          <Link href="/register" className="ld-btn-hero">
            Start for free
          </Link>
          <Link href="/login" className="ld-btn-hero ghost">
            Take a look
          </Link>
        </div>
      </div>
      <div className="visual" aria-hidden>
        <div className="ld-match">
          <div className="ph">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/hero-bori.jpg" alt="" />
            <span className="dist">0.8km</span>
          </div>
          <div className="bd">
            <div className="nm">Bori · 2 yrs</div>
            <div className="mt">Welsh Corgi · Female · Owner Minji</div>
            <div className="tags">
              <span className="tag">Morning walks</span>
              <span className="tag">Fetch</span>
            </div>
          </div>
          <div className="acts">
            <span className="pass">Pass</span>
            <span className="like">Like</span>
          </div>
        </div>
      </div>
    </section>
  );
}
