"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SmartImage } from "@/components/smart-image";
import { useLightbox } from "@/components/lightbox";
import { meets, type Meet, type Photo } from "@/lib/photos";
import { allResultsForMeet } from "@/data/races";

const TYPE_LABEL: Record<Meet["type"], string> = {
  xc: "Cross Country",
  indoor: "Indoor Track",
  outdoor: "Outdoor Track",
  team: "Off the Track",
};

function ResultBadge({ meetId }: { meetId: string }) {
  const results = allResultsForMeet(meetId);
  if (!results.length) return null;
  return (
    <div className="mt-6 space-y-2 border-t border-bone/15 pt-5">
      {results.map((r, i) => (
        <div key={i} className="flex items-baseline gap-4">
          <span className="overline w-20 shrink-0 text-gold">{r.distance}</span>
          <span className="tnum font-display text-2xl text-bone md:text-3xl">
            {r.time}
          </span>
          {r.place && <span className="text-sm text-bone/55">{r.place}</span>}
          {r.pb && (
            <span className="rounded-full border border-gold/60 px-2 py-0.5 text-[0.65rem] font-semibold tracking-widest text-gold">
              PB
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Chapter({ meet, index }: { meet: Meet; index: number }) {
  const { open } = useLightbox();
  const flip = index % 2 === 1;
  const cover = meet.photos.find((p) => p.publicId === meet.cover) || meet.photos[0];
  const strip = meet.photos.filter((p) => p !== cover).slice(0, 4);
  const caption = `${meet.displayName} · ${meet.dateLabel}`;

  const openAt = (p: Photo) => open(meet.photos, meet.photos.indexOf(p), caption);

  return (
    <article className="chapter grid grid-cols-1 items-center gap-8 py-[clamp(2.5rem,7vw,6rem)] md:grid-cols-2 md:gap-14">
      {/* text */}
      <div className={flip ? "md:order-2" : ""}>
        <div className="flex items-center gap-4">
          <span className="tnum font-display text-5xl text-bone/15">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="overline">{TYPE_LABEL[meet.type]}</span>
        </div>
        <h3 className="mt-4 font-display text-[clamp(2rem,5vw,3.8rem)] leading-[0.92] text-bone">
          {meet.displayName}
        </h3>
        <p className="mt-3 text-bone/60">
          {meet.dateLabel}
          {meet.location ? ` · ${meet.location}` : ""}
          {meet.venue ? ` · ${meet.venue}` : ""}
        </p>
        <ResultBadge meetId={meet.id} />
        <button
          onClick={() => openAt(cover)}
          data-cursor="hover"
          className="mt-7 inline-flex items-center gap-2 text-sm text-bone/70 transition hover:text-gold"
        >
          View {meet.photoCount} photos
          <span aria-hidden>→</span>
        </button>
      </div>

      {/* images */}
      <div className={flip ? "md:order-1" : ""}>
        <button
          onClick={() => openAt(cover)}
          data-cursor-label="View"
          className="group relative block aspect-[4/3] w-full overflow-hidden rounded-sm bg-ink-soft"
        >
          <SmartImage
            publicId={cover.publicId}
            alt={caption}
            width={cover.w}
            height={cover.h}
            w={1080}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </button>
        {strip.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {strip.map((p) => (
              <button
                key={p.publicId}
                onClick={() => openAt(p)}
                data-cursor-label="View"
                className="group relative aspect-square overflow-hidden rounded-sm bg-ink-soft"
              >
                <SmartImage
                  publicId={p.publicId}
                  alt={caption}
                  width={p.w}
                  height={p.h}
                  w={320}
                  sizes="20vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function Chapters() {
  const root = useRef<HTMLElement>(null);

  // group meets by season, excluding the undated "Off the Clock" bucket
  const seasonsInOrder = [
    "Cross Country 2024",
    "Indoor 2025",
    "Outdoor 2025",
  ];
  const grouped = seasonsInOrder
    .map((season) => ({
      season,
      meets: meets.filter((m) => m.season === season),
    }))
    .filter((g) => g.meets.length);

  useGSAP(
    () => {
      ScrollTrigger.batch(".chapter", {
        start: "top 82%",
        onEnter: (els) =>
          gsap.from(els, {
            y: 40,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.12,
            ease: "power3.out",
            overwrite: true,
          }),
      });
      gsap.set(".chapter", { autoAlpha: 1 });
    },
    { scope: root }
  );

  let counter = 0;

  return (
    <section ref={root} className="relative bg-ink py-[clamp(3rem,8vw,7rem)]">
      <div className="mx-auto max-w-7xl px-[clamp(1rem,4vw,3rem)]">
        <div className="border-b border-bone/15 pb-6">
          <span className="overline text-gold">The seasons</span>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,7vw,5.5rem)] text-bone">
            Race by race
          </h2>
        </div>

        {grouped.map((g) => (
          <div key={g.season} className="mt-[clamp(2rem,5vw,4rem)]">
            <div className="sticky top-0 z-10 -mx-[clamp(1rem,4vw,3rem)] bg-ink/85 px-[clamp(1rem,4vw,3rem)] py-4 backdrop-blur">
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-xl italic text-garnet-bright md:text-2xl">
                  {g.season}
                </h3>
                <span className="overline">{g.meets.length} meets</span>
              </div>
            </div>
            <div className="divide-y divide-bone/10">
              {g.meets.map((m) => (
                <Chapter key={m.id} meet={m} index={counter++} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
