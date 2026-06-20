"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { journey } from "@/data/profile";

export function Journey() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const trackEl = track.current!;
      const getScroll = () => trackEl.scrollWidth - window.innerWidth;

      const tween = gsap.to(trackEl, {
        x: () => -getScroll(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${getScroll()}`,
          invalidateOnRefresh: true,
        },
      });

      // route progress line + map path draw tied to the same scroll
      gsap.to(".jr-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          scrub: true,
          start: "top top",
          end: () => `+=${getScroll()}`,
        },
      });

      gsap.to(".jr-path", {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          scrub: true,
          start: "top top",
          end: () => `+=${getScroll()}`,
        },
      });

      // reveal each stop as it nears center
      gsap.utils.toArray<HTMLElement>(".jr-stop").forEach((stop) => {
        gsap.from(stop.querySelectorAll(".jr-anim"), {
          y: 24,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stop,
            containerAnimation: tween,
            start: "left 75%",
          },
        });
      });

      return () => ScrollTrigger.refresh();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-ink-soft">
      {/* heading */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-[clamp(1rem,4vw,3rem)] py-7">
        <h2 className="font-display text-[clamp(1.6rem,4vw,3rem)] text-bone">
          The journey
        </h2>
        <span className="overline">Manchester → Chestnut Hill</span>
      </div>

      {/* decorative transatlantic arc */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          className="jr-path"
          d="M 60 320 C 360 60, 840 60, 1140 300"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="2"
          strokeDasharray="2000"
          strokeDashoffset="2000"
        />
      </svg>

      {/* progress line */}
      <div className="absolute bottom-10 left-[clamp(1rem,4vw,3rem)] right-[clamp(1rem,4vw,3rem)] z-20 h-px bg-bone/15">
        <div className="jr-progress h-full origin-left scale-x-0 bg-garnet-bright" />
      </div>

      {/* horizontal track */}
      <div
        ref={track}
        className="absolute top-0 flex h-full items-center gap-[6vw] pl-[clamp(1rem,4vw,3rem)] pr-[40vw] will-change-transform"
      >
        {journey.map((stop, i) => (
          <article
            key={stop.place}
            className="jr-stop relative w-[78vw] shrink-0 md:w-[42vw]"
          >
            <span className="jr-anim tnum font-display text-[clamp(4rem,12vw,9rem)] leading-none text-bone/10">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="-mt-6">
              <span className="jr-anim overline text-gold">{stop.years}</span>
              <h3 className="jr-anim mt-3 font-display text-[clamp(2rem,5vw,4rem)] leading-none text-bone">
                {stop.place}
              </h3>
              <p className="jr-anim mt-2 font-serif text-xl italic text-garnet-bright">
                {stop.school}
              </p>
              <p className="jr-anim mt-5 max-w-md text-bone/70">{stop.blurb}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
