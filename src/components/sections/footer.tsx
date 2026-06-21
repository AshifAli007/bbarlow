"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SmartImage } from "@/components/smart-image";
import { profile } from "@/data/profile";
import { findPhoto } from "@/lib/photos";

const LOCATIONS = [
  "Manchester",
  "Princeton",
  "Tallahassee",
  "Boston",
  "Louisville",
  "Madison",
  "Charlottesville",
];

type LinkPreview = {
  image: string;
  title: string;
  description: string;
  domain: string;
};

type FooterLinkItem = {
  label: string;
  href: string;
  preview?: LinkPreview;
};

function FooterLink({ item }: { item: FooterLinkItem }) {
  return (
    <span className="group relative inline-block">
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        data-cursor="hover"
        className="inline-block rounded-full border border-bone/25 px-5 py-2.5 text-sm text-bone/80 transition hover:border-gold hover:text-gold"
      >
        {item.label} ↗
      </a>

      {item.preview && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-full left-0 z-20 mb-3 hidden w-72 max-w-[calc(100vw-2rem)] translate-y-2 scale-95 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100 md:block"
        >
          <span className="block overflow-hidden rounded-xl border border-gold/30 bg-ink-soft shadow-2xl ring-1 ring-bone/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.preview.image}
              alt=""
              loading="lazy"
              className="block aspect-[16/10] w-full object-cover object-top"
            />
            <span className="block px-4 py-3">
              <span className="block text-sm font-medium text-bone">
                {item.preview.title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-bone/55">
                {item.preview.description}
              </span>
              <span className="overline mt-2 block text-gold">
                {item.preview.domain}
              </span>
            </span>
          </span>
          <span className="absolute left-10 top-full -mt-1.5 h-3 w-3 rotate-45 border-b border-r border-gold/30 bg-ink-soft" />
        </span>
      )}
    </span>
  );
}

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const closing = findPhoto(
    "beth/acc-xc/Elizabeth_Barlow__ACCS_PREEMEET___October_31__2024_DSC01219"
  );

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
    {
      label: "World Athletics",
      href: profile.links.worldAthletics,
      preview: {
        image: "/link-previews/world-athletics.jpeg",
        title: "Elizabeth Barlow, athlete profile",
        description:
          "Official World Athletics profile with personal bests and world rankings.",
        domain: "worldathletics.org",
      },
    },
    {
      label: "TFRRS",
      href: profile.links.tfrrs,
      preview: {
        image: "/link-previews/tfrrs.jpeg",
        title: "Elizabeth Barlow, college results",
        description:
          "Collegiate track and cross country results, bests, and meet history.",
        domain: "tfrrs.org",
      },
    },
    {
      label: "Boston College",
      href: profile.links.bostonCollege,
      preview: {
        image: "/link-previews/boston-college.jpeg",
        title: "Elizabeth Barlow, team roster",
        description:
          "Boston College Eagles women's cross country roster profile.",
        domain: "bceagles.com",
      },
    },
    {
      label: "Florida State",
      href: profile.links.floridaState,
      preview: {
        image: "/link-previews/seminoles.jpeg",
        title: "Elizabeth Barlow, team roster",
        description:
          "Florida State Seminoles women's track and field roster profile.",
        domain: "seminoles.com",
      },
    },
    profile.links.instagram
      ? { label: "Instagram", href: profile.links.instagram }
      : null,
  ].filter(Boolean) as FooterLinkItem[];

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
              <FooterLink key={l.label} item={l} />
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
