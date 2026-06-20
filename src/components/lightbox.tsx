"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SmartImage } from "@/components/smart-image";
import type { Photo } from "@/lib/photos";

type LightboxState = { photos: Photo[]; index: number; caption?: string } | null;

type Ctx = {
  open: (photos: Photo[], index: number, caption?: string) => void;
  close: () => void;
};

const LightboxContext = createContext<Ctx>({ open: () => {}, close: () => {} });

export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LightboxState>(null);

  const open = useCallback(
    (photos: Photo[], index: number, caption?: string) =>
      setState({ photos, index, caption }),
    []
  );
  const close = useCallback(() => setState(null), []);

  const step = useCallback(
    (dir: number) =>
      setState((s) =>
        s
          ? { ...s, index: (s.index + dir + s.photos.length) % s.photos.length }
          : s
      ),
    []
  );

  useEffect(() => {
    if (!state) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [state, close, step]);

  const current = state?.photos[state.index];

  return (
    <LightboxContext.Provider value={{ open, close }}>
      {children}
      {state && current && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/95 backdrop-blur-sm"
          onClick={close}
        >
          <button
            aria-label="Close"
            className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-bone/25 text-bone transition hover:border-gold hover:text-gold"
            onClick={close}
          >
            ✕
          </button>

          <button
            aria-label="Previous"
            className="absolute left-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-bone/20 text-bone transition hover:border-gold hover:text-gold md:left-6"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          >
            ←
          </button>
          <button
            aria-label="Next"
            className="absolute right-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-bone/20 text-bone transition hover:border-gold hover:text-gold md:right-6"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
          >
            →
          </button>

          <figure
            className="relative flex max-h-[88vh] max-w-[92vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex max-h-[80vh] items-center justify-center">
              <SmartImage
                key={current.publicId}
                publicId={current.publicId}
                alt={state.caption || "Beth Barlow"}
                width={current.w}
                height={current.h}
                w={1600}
                crop="limit"
                sizes="92vw"
                priority
                className="max-h-[80vh] w-auto object-contain"
              />
            </div>
            <figcaption className="mt-4 flex items-center gap-4 text-sm text-bone/70">
              {state.caption && <span className="overline">{state.caption}</span>}
              <span className="tnum">
                {state.index + 1} / {state.photos.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </LightboxContext.Provider>
  );
}
