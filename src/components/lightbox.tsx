"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SmartImage } from "@/components/smart-image";
import { imageUrl, lightboxWidth } from "@/lib/cloudinary";
import { isImageLoaded, markImageLoaded } from "@/lib/image-cache";
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

  // Size the full image to the viewport (bucketed) so first-generation is fast
  // and we reuse a small set of Cloudinary transforms.
  const [targetW, setTargetW] = useState(1600);
  useEffect(() => {
    const compute = () =>
      setTargetW(
        lightboxWidth(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1)
      );
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Browser-cache warmer: requesting the exact same URL the <img> will use means
  // navigation becomes an instant cache hit instead of a fresh on-the-fly fetch.
  const warmed = useRef<Set<string>>(new Set());
  const warm = useCallback((publicId: string) => {
    const url = imageUrl(publicId, { w: targetW, crop: "limit" });
    if (warmed.current.has(url) || isImageLoaded(url)) return;
    warmed.current.add(url);
    const img = new Image();
    img.decoding = "async";
    // record once decoded so SmartImage can mount it instantly (no blur-up)
    img.onload = () => markImageLoaded(url);
    img.src = url;
  }, [targetW]);

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

  // Warm the immediate neighbors (±1, ±2) the instant the index changes so the
  // next/prev step is a cache hit.
  const photos = state?.photos;
  const index = state?.index;
  useEffect(() => {
    if (!photos || index == null) return;
    const n = photos.length;
    [1, -1, 2, -2].forEach((d) => {
      const p = photos[((index + d) % n + n) % n];
      if (p) warm(p.publicId);
    });
  }, [photos, index, warm]);

  // Background-prefetch a bounded window around the current photo at display size,
  // a few at a time, after neighbors are handled. The window recenters as you
  // navigate, so a full meet (<= ~30) warms entirely while the 288-photo "All"
  // set never balloons. Cancels when the lightbox closes / set changes.
  useEffect(() => {
    if (!photos || index == null) return;
    const WINDOW = 14; // each direction
    const n = photos.length;
    const order: number[] = [];
    for (let d = 3; d <= WINDOW; d++) {
      order.push(((index + d) % n + n) % n);
      order.push(((index - d) % n + n) % n);
    }
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      for (let k = 0; k < 3 && i < order.length; k++, i++) warm(photos[order[i]].publicId);
      if (i < order.length) timer = window.setTimeout(tick, 220);
    };
    let timer = window.setTimeout(tick, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [photos, index, warm]);

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
                w={targetW}
                crop="limit"
                fixed
                lqip
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
