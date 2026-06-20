"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { personalBests } from "@/data/profile";

function CountTime({ time, className }: { time: string; className?: string }) {
  // animate digits by scrubbing a value toward the final seconds
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current!;
    if (prefersReducedMotion()) {
      el.textContent = time;
      return;
    }
    // parse mm:ss.xx or ss.xx
    const parts = time.split(":");
    const hasMin = parts.length === 2;
    const minutes = hasMin ? Number(parts[0]) : 0;
    const secs = Number(hasMin ? parts[1] : parts[0]);
    const total = minutes * 60 + secs;
    const decimals = (time.split(".")[1] || "").length;

    const obj = { v: 0 };
    gsap.to(obj, {
      v: total,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: () => {
        if (hasMin) {
          const m = Math.floor(obj.v / 60);
          const s = obj.v - m * 60;
          el.textContent = `${m}:${s.toFixed(decimals).padStart(decimals + 3, "0")}`;
        } else {
          el.textContent = obj.v.toFixed(decimals);
        }
      },
    });
  }, []);

  return (
    <span ref={ref} className={className}>
      {time}
    </span>
  );
}

export function Numbers() {
  const root = useRef<HTMLElement>(null);
  const flagship = personalBests.find((p) => p.flagship)!;
  const rest = personalBests.filter((p) => !p.flagship);

  useGSAP(
    () => {
      gsap.from(".num-row", {
        y: 30,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".num-grid", start: "top 80%" },
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative bg-ink py-[clamp(4rem,12vw,9rem)]"
    >
      <div className="mx-auto max-w-7xl px-[clamp(1rem,4vw,3rem)]">
        <div className="flex items-baseline justify-between border-b border-bone/15 pb-6">
          <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] text-bone">
            Personal bests
          </h2>
          <span className="overline hidden md:inline">By the numbers</span>
        </div>

        {/* flagship */}
        <div className="grid grid-cols-1 items-end gap-6 py-[clamp(2.5rem,6vw,5rem)] md:grid-cols-12">
          <div className="md:col-span-3">
            <span className="overline text-gold">Flagship</span>
            <p className="mt-3 font-display text-3xl text-bone">{flagship.event}</p>
          </div>
          <div className="md:col-span-6">
            <CountTime
              time={flagship.time}
              className="tnum block font-display text-[clamp(4.5rem,20vw,16rem)] leading-[0.8] text-garnet-bright"
            />
          </div>
          <div className="md:col-span-3 md:text-right">
            <p className="text-bone/70">{flagship.venue}</p>
            <p className="text-bone/50">{flagship.date}</p>
            {flagship.note && (
              <p className="mt-2 text-sm text-gold/80">{flagship.note}</p>
            )}
          </div>
        </div>

        {/* the rest */}
        <div className="num-grid divide-y divide-bone/10 border-t border-bone/15">
          {rest.map((pb) => (
            <div
              key={pb.event}
              className="num-row grid grid-cols-12 items-center gap-4 py-6"
            >
              <span className="col-span-4 font-display text-xl text-bone md:col-span-3 md:text-2xl">
                {pb.event}
              </span>
              <CountTime
                time={pb.time}
                className="tnum col-span-4 font-display text-[clamp(1.6rem,5vw,3rem)] leading-none text-bone md:col-span-5"
              />
              <span className="col-span-4 text-right text-sm text-bone/55 md:col-span-4">
                {pb.venue}
                <span className="block text-bone/35">{pb.date}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
