"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="ld-hero">
      <div>
        <h1>
          Your neighbourhood,
          <br />
          <em>off the leash</em>
        </h1>
        <p className="sub">
          The block&apos;s dogs, walks, and people — one feed for your
          neighbourhood pack.
        </p>
        <div className="btns">
          <Link href="/register" className="btn">
            Bring your dog to the block
          </Link>
          <Link href="/login" className="btn btn-ghost">
            Take a look
          </Link>
        </div>
      </div>
      <div className="visual" aria-hidden>
        <div className="ld-stack">
          <div className="ld-shot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/hero-bori.jpg" alt="" />
            <div className="bd">
              <div className="nm">
                Bori <small>240 m</small>
              </div>
              <div className="mt">Welsh Corgi · two blocks over</div>
              <div className="tags">
                <span className="tag tag-want">Walk mates wanted</span>
                <span className="tag">Morning walks</span>
              </div>
            </div>
          </div>
          <div className="walk-card ld-walk">
            <div className="walk-when">7:30</div>
            <div className="walk-with">Evening loop · Bori +2 going</div>
            <div className="walk-where">Meet at the park gate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
