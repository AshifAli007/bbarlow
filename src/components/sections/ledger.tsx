"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { races, seasonOrder } from "@/data/races";

export function Ledger() {
  const root = useRef<HTMLElement>(null);

  const grouped = seasonOrder
    .map((season) => ({ season, rows: races.filter((r) => r.season === season) }))
    .filter((g) => g.rows.length);

  useGSAP(
    () => {
      ScrollTrigger.batch(".ledger-row", {
        start: "top 92%",
        once: true,
        onEnter: (els) =>
          gsap.from(els, {
            y: 18,
            autoAlpha: 0,
            duration: 0.6,
            stagger: 0.04,
            ease: "power2.out",
            overwrite: true,
          }),
      });
      gsap.set(".ledger-row", { autoAlpha: 1 });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="paper py-[clamp(4rem,10vw,8rem)]">
      <div className="mx-auto max-w-5xl px-[clamp(1rem,4vw,3rem)]">
        <div className="flex items-baseline justify-between border-b-2 border-ink/80 pb-5">
          <h2 className="font-display text-[clamp(2rem,6vw,4.5rem)] text-ink">
            The record
          </h2>
          <span className="overline text-ink/60">{races.length} results</span>
        </div>

        {grouped.map((g) => (
          <div key={g.season} className="mt-12">
            <div className="flex items-center gap-3">
              <span className="font-serif text-lg italic text-garnet">
                {g.season}
              </span>
              <span className="h-px flex-1 bg-ink/20" />
              <span className="overline text-ink/40">{g.rows[0].team}</span>
            </div>

            <div className="mt-4">
              {g.rows.map((r, i) => (
                <div
                  key={`${r.meet}-${r.distance}-${i}`}
                  className="ledger-row grid grid-cols-12 items-baseline gap-2 border-b border-ink/12 py-3 text-ink"
                >
                  <span className="col-span-12 font-medium md:col-span-5">
                    {r.meet}
                    <span className="ml-2 text-ink/40">{r.location}</span>
                  </span>
                  <span className="overline col-span-3 text-ink/60 md:col-span-2">
                    {r.distance}
                  </span>
                  <span className="tnum col-span-4 font-display text-xl md:col-span-2">
                    {r.time}
                    {r.pb && (
                      <span className="ml-1 align-super text-[0.6rem] font-bold text-garnet">
                        PB
                      </span>
                    )}
                  </span>
                  <span className="col-span-2 text-right text-sm text-ink/50 md:col-span-1">
                    {r.place ?? ""}
                  </span>
                  <span className="col-span-3 text-right text-sm text-ink/40 md:col-span-2">
                    {r.dateLabel.replace(/, \d{4}$/, "")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
