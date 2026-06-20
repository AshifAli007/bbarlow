"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const dotEl = dot.current!;
    const ringEl = ring.current!;
    const labelEl = label.current!;

    // mark active so CSS hides the native cursor (only now that custom is live)
    document.documentElement.setAttribute("data-cursor-active", "");

    const xDot = gsap.quickTo(dotEl, "x", { duration: 0.12, ease: "power3" });
    const yDot = gsap.quickTo(dotEl, "y", { duration: 0.12, ease: "power3" });
    const xRing = gsap.quickTo(ringEl, "x", { duration: 0.4, ease: "power3" });
    const yRing = gsap.quickTo(ringEl, "y", { duration: 0.4, ease: "power3" });
    const xLabel = gsap.quickTo(labelEl, "x", { duration: 0.4, ease: "power3" });
    const yLabel = gsap.quickTo(labelEl, "y", { duration: 0.4, ease: "power3" });

    const move = (e: MouseEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
      xLabel(e.clientX);
      yLabel(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      // an explicit cursor label (e.g. images that open the lightbox)
      const labelled = t.closest<HTMLElement>("[data-cursor-label]");
      const interactive = t.closest("a, button, [data-cursor='hover']");

      if (labelled) {
        ringEl.classList.add("view");
        ringEl.classList.remove("hover");
        dotEl.style.opacity = "0";
        labelEl.textContent = labelled.dataset.cursorLabel || "View";
        labelEl.classList.add("show");
      } else if (interactive) {
        ringEl.classList.add("hover");
        ringEl.classList.remove("view");
        dotEl.style.opacity = "1";
        labelEl.classList.remove("show");
      } else {
        ringEl.classList.remove("hover", "view");
        dotEl.style.opacity = "1";
        labelEl.classList.remove("show");
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      document.documentElement.removeAttribute("data-cursor-active");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={label} className="cursor-label" aria-hidden />
    </>
  );
}
