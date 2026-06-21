"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { videos, frameUrl, thumbUrl, type Video } from "@/data/videos";
import { VideoModal } from "@/components/video-modal";

// Temporary: set false (or delete the switcher below) once frames are locked in.
const FRAME_PICKER = true;

function PlayGlyph({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-16 w-16" : "h-12 w-12";
  return (
    <span
      className={`grid ${dim} place-items-center rounded-full border border-bone/50 bg-ink/40 text-bone backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-gold group-hover:text-gold`}
    >
      <svg viewBox="0 0 24 24" className="ml-0.5 h-1/2 w-1/2" fill="currentColor" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

/**
 * YouTube poster with a graceful maxres -> hq fallback. Some videos have no
 * maxresdefault; YouTube then returns a 120x90 gray placeholder with a 200
 * status (so onError never fires), which we detect by the tiny dimensions.
 */
function Poster({ video, className }: { video: Video; className?: string }) {
  const [hq, setHq] = useState(false);
  const fallback = () => setHq(true);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={thumbUrl(video.id, hq ? "hq" : "maxres")}
      alt={video.event}
      loading="lazy"
      onError={() => !hq && fallback()}
      onLoad={(e) => {
        if (!hq && e.currentTarget.naturalWidth < 320) fallback();
      }}
      className={className}
    />
  );
}

export function InMotion() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Video | null>(null);

  useGSAP(
    () => {
      ScrollTrigger.batch(".film-reveal", {
        start: "top 85%",
        once: true,
        onEnter: (els) =>
          gsap.from(els, {
            y: 40,
            autoAlpha: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            overwrite: true,
          }),
      });
      gsap.set(".film-reveal", { autoAlpha: 1 });
    },
    { scope: root }
  );

  // drag-to-scroll for the filmstrip (mirrors the archive filter rail)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const onDown = (e: React.MouseEvent) => {
    const el = rail.current!;
    drag.current = { down: true, x: e.pageX, left: el.scrollLeft, moved: false };
  };
  const onMove = (e: React.MouseEvent) => {
    if (!drag.current.down) return;
    const el = rail.current!;
    const dx = e.pageX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.left - dx;
  };
  const endDrag = () => (drag.current.down = false);

  return (
    <section ref={root} className="relative bg-ink py-[clamp(3rem,8vw,7rem)]">
      <div className="mx-auto max-w-[110rem] px-[clamp(1rem,4vw,3rem)]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-bone/15 pb-6">
          <div>
            <span className="overline text-gold">Race film</span>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,7vw,5.5rem)] text-bone">
              In motion
            </h2>
          </div>
          <span className="overline">{videos.length} films · full replays</span>
        </div>

        {/* filmstrip (drag to scroll) */}
        <div
          ref={rail}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          className="no-scrollbar -mx-[clamp(1rem,4vw,3rem)] mt-[clamp(2rem,5vw,3.5rem)] flex cursor-grab gap-4 overflow-x-auto px-[clamp(1rem,4vw,3rem)] pb-2 active:cursor-grabbing"
          style={{ scrollbarWidth: "none" }}
        >
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                if (!drag.current.moved) setActive(v);
              }}
              data-cursor-label="Play"
              aria-label={`Play ${v.event}`}
              className="film-reveal group w-[78vw] shrink-0 text-left sm:w-[22rem]"
            >
              <span className="relative block aspect-video overflow-hidden rounded-sm bg-ink-soft">
                <Poster
                  video={v}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-ink/10 transition-colors duration-300 group-hover:bg-ink/30" />
                <span className="absolute inset-0 grid place-items-center">
                  <PlayGlyph size="sm" />
                </span>
                {v.note && (
                  <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-bone/80 backdrop-blur-sm">
                    {v.note}
                  </span>
                )}
              </span>
              <span className="mt-3 flex items-baseline justify-between gap-3">
                <span className="font-display text-lg leading-tight text-bone">
                  {v.title}
                </span>
                <span className="overline shrink-0 text-bone/45">{v.year}</span>
              </span>
              <span className="tnum mt-1 block text-sm text-bone/55">
                {[v.distance, v.result].filter(Boolean).join(" · ")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}
