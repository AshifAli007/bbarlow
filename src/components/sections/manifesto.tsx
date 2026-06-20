"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SmartImage } from "@/components/smart-image";
import { profile, featured } from "@/data/profile";
import { findPhoto, soloPhoto } from "@/lib/photos";

const ACCENTS = new Set(["Manchester", "3000m", "9:12.29"]);

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const portrait = findPhoto(featured.portrait) ?? soloPhoto(3);

  useGSAP(
    () => {
      gsap.from(".mf-reveal", {
        y: 28,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
      gsap.from(".mf-portrait img", {
        scale: 1.2,
        duration: 1.6,
        ease: "power3.out",
        scrollTrigger: { trigger: ".mf-portrait", start: "top 85%" },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="paper relative py-[clamp(4rem,12vw,9rem)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-[clamp(1rem,4vw,3rem)] md:grid-cols-12">
        <div className="md:col-span-7">
          <span className="mf-reveal overline text-ink/60">The long way round</span>
          <p className="mf-reveal mt-6 font-serif text-[clamp(1.5rem,3.2vw,2.6rem)] leading-[1.18] text-ink">
            {profile.intro.split(/(Manchester|3000m|9:12\.29)/g).map((part, i) =>
              ACCENTS.has(part) ? (
                <span key={i} className="text-garnet">
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
          <div className="mf-reveal mt-8 max-w-xl space-y-5 text-ink/70">
            {profile.manifesto.map((p) => (
              <p key={p} className="text-[1.05rem] leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="mf-portrait relative aspect-[3/4] overflow-hidden rounded-sm bg-ink/10">
            {portrait && (
              <SmartImage
                key={portrait.publicId}
                publicId={portrait.publicId}
                alt="Beth Barlow"
                width={portrait.w}
                height={portrait.h}
                w={900}
                sizes="(max-width: 768px) 100vw, 40vw"
                lqip
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* pull quote */}
      <div className="mx-auto mt-[clamp(3rem,8vw,6rem)] max-w-5xl px-[clamp(1rem,4vw,3rem)]">
        <blockquote className="mf-reveal border-t border-ink/15 pt-8">
          <p className="font-serif text-[clamp(1.6rem,4vw,3.2rem)] italic leading-[1.15] text-garnet">
            “{profile.pullQuote}”
          </p>
        </blockquote>
      </div>
    </section>
  );
}
