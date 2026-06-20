"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SmartImage } from "@/components/smart-image";
import { profile, featured } from "@/data/profile";
import { findPhoto } from "@/lib/photos";

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const photo = findPhoto(featured.hero);
  const dims = photo ? { w: photo.w, h: photo.h } : { w: 5751, h: 3834 };

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set([".hero-line span", ".hero-meta", ".hero-scroll"], { opacity: 1, yPercent: 0 });
        return;
      }
      if (!ready) {
        gsap.set([".hero-line span", ".hero-meta", ".hero-scroll"], { autoAlpha: 0 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".hero-img", { scale: 1, duration: 1.6, ease: "power3.out" }, 0)
        .fromTo(
          ".hero-line span",
          { yPercent: 115 },
          { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08 },
          0.1
        )
        .fromTo(".hero-meta", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, 0.5)
        .fromTo(".hero-scroll", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.9);

      // parallax drift on scroll
      gsap.to(".hero-img", {
        yPercent: 18,
        scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section
      ref={root}
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
    >
      <div className="hero-img absolute inset-0 scale-110 will-change-transform">
        {photo ? (
          <SmartImage
            key={photo.publicId}
            publicId={photo.publicId}
            alt="Beth Barlow racing"
            width={dims.w}
            height={dims.h}
            w={1920}
            sizes="100vw"
            priority
            gravity="auto"
            lqip
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-ink-soft" />
        )}
      </div>

      {/* legibility scrims */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-[clamp(1rem,4vw,3rem)] py-6">
        <span className="overline text-bone">{profile.discipline}</span>
        <span className="overline text-bone">{profile.hometown}</span>
      </div>

      {/* name */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-[clamp(1rem,4vw,3rem)] pb-[clamp(2rem,7vw,5rem)]">
        <h1 className="font-display text-bone">
          <span className="hero-line block overflow-hidden">
            <span className="block text-[clamp(3.2rem,15vw,13rem)]">Beth</span>
          </span>
          <span className="hero-line block overflow-hidden">
            <span className="block text-[clamp(3.2rem,15vw,13rem)] text-garnet-bright">
              Barlow
            </span>
          </span>
        </h1>

        <div className="hero-meta mt-6 flex flex-wrap items-end justify-end gap-6 border-t border-bone/15 pt-5">
          <div className="flex items-end gap-3">
            <span className="overline mb-1">3000m</span>
            <span className="tnum font-display text-[clamp(2rem,5vw,3.5rem)] leading-none text-gold">
              9:12.29
            </span>
          </div>
        </div>
      </div>

      {/* scroll hint */}
      <div className="hero-scroll absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="overline text-bone/70">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-bone/50" />
      </div>
    </section>
  );
}
