"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

function fmt(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
}

export function Preloader({ onDone }: { onDone?: () => void }) {
  const [hidden, setHidden] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      const html = document.documentElement;
      html.style.overflow = "hidden";

      const finish = () => {
        html.style.overflow = "";
        setHidden(true);
        onDone?.();
      };

      if (prefersReducedMotion()) {
        const t = setTimeout(finish, 300);
        return () => clearTimeout(t);
      }

      const target = 552.29; // 9:12.29 in seconds
      const counter = { t: 0 };

      const tl = gsap.timeline({ onComplete: finish });
      tl.fromTo(
        ".pl-word",
        { yPercent: 120 },
        { yPercent: 0, duration: 0.9, stagger: 0.12, ease: "power4.out" }
      )
        .to(
          counter,
          {
            t: target,
            duration: 1.8,
            ease: "power2.inOut",
            onUpdate: () => {
              if (clock.current) clock.current.textContent = fmt(counter.t);
            },
          },
          0.2
        )
        .to(".pl-line", { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0.2)
        .to(".pl-meta", { opacity: 1, duration: 0.4 }, "-=0.6")
        .to({}, { duration: 0.35 })
        .to(root.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut" });
    },
    { scope: root }
  );

  if (hidden) return null;

  return (
    <div
      ref={root}
      className="grain fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink"
    >
      <div className="overflow-hidden">
        <div className="pl-word font-display text-[clamp(2.5rem,9vw,7rem)] leading-none text-bone">
          Beth
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="pl-word font-display text-[clamp(2.5rem,9vw,7rem)] leading-none text-garnet">
          Barlow
        </div>
      </div>

      <div className="pl-line mt-8 h-px w-[min(420px,70vw)] origin-left scale-x-0 bg-bone-dim/40" />

      <div className="pl-meta mt-5 flex items-center gap-4 opacity-0">
        <span className="overline">3000m PB</span>
        <span ref={clock} className="tnum font-display text-2xl text-gold">
          0:00.00
        </span>
      </div>
    </div>
  );
}
