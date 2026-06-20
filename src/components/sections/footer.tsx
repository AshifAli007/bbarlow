"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SmartImage } from "@/components/smart-image";
import { profile } from "@/data/profile";
import { soloPhoto } from "@/lib/photos";

const LOCATIONS = [
  "Manchester",
  "Princeton",
  "Tallahassee",
  "Boston",
  "Louisville",
  "Madison",
  "Charlottesville",
];

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const closing = soloPhoto(8);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to(".marquee-track", {
        xPercent: -50,
        repeat: -1,
        ease: "none",
        duration: 24,
      });
      gsap.from(".ft-name span", {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.06,
        ease: "power4.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    },
    { scope: root }
  );

  const links = [
    { label: "World Athletics", href: profile.links.worldAthletics },
    { label: "TFRRS", href: profile.links.tfrrs },
    { label: "Boston College", href: profile.links.bostonCollege },
    profile.links.instagram
      ? { label: "Instagram", href: profile.links.instagram }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer ref={root} className="relative overflow-hidden bg-ink">
      {/* location marquee */}
      <div className="overflow-hidden border-y border-bone/12 py-5">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex">
              {LOCATIONS.map((loc) => (
                <span
                  key={`${dup}-${loc}`}
                  className="mx-6 font-display text-[clamp(1.5rem,4vw,3rem)] text-bone/30"
                >
                  {loc}
                  <span className="mx-6 text-gold/50">●</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-[clamp(1rem,4vw,3rem)] py-[clamp(4rem,10vw,8rem)] md:grid-cols-12">
        <div className="md:col-span-7">
          <span className="overline text-gold">Still running</span>
          <h2 className="ft-name mt-5 font-display text-bone">
            <span className="block overflow-hidden">
              <span className="block text-[clamp(2.5rem,9vw,7rem)] leading-[0.9]">
                Beth
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block text-[clamp(2.5rem,9vw,7rem)] leading-[0.9] text-garnet-bright">
                Barlow
              </span>
            </span>
          </h2>
          <p className="mt-6 max-w-md font-serif text-lg text-bone/70">
            {profile.hometown} · {profile.discipline} · {profile.currentTeam}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="hover"
                className="rounded-full border border-bone/25 px-5 py-2.5 text-sm text-bone/80 transition hover:border-gold hover:text-gold"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-5">
          {closing && (
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-ink-soft">
              <SmartImage
                publicId={closing.publicId}
                alt="Beth Barlow"
                width={closing.w}
                height={closing.h}
                w={900}
                sizes="(max-width: 768px) 100vw, 40vw"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-bone/12 px-[clamp(1rem,4vw,3rem)] py-7 text-xs text-bone/40 md:flex-row md:items-center">
        <span>© {new Date().getFullYear()} Beth Barlow. All race photography belongs to its respective photographers.</span>
      </div>
    </footer>
  );
}
