"use client";

import { useEffect, useRef, useState } from "react";
import { imageUrl, srcSet, type ImgOpts } from "@/lib/cloudinary";

type Props = {
  publicId: string;
  alt: string;
  /** intrinsic dimensions for aspect-ratio (prevents layout shift) */
  width: number;
  height: number;
  /** rendered transform width to request */
  w?: number;
  sizes?: string;
  className?: string;
  crop?: ImgOpts["crop"];
  gravity?: ImgOpts["gravity"];
  priority?: boolean;
};

const RESPONSIVE = [400, 640, 800, 1080, 1400, 1920];
const MAX_RETRY = 3;

export function SmartImage({
  publicId,
  alt,
  width,
  height,
  w = 1080,
  sizes = "100vw",
  className = "",
  crop = "fill",
  gravity = "auto",
  priority = false,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  // Cloudinary generates derived transforms on first request; that first hit can
  // transiently 404 while it processes, which would otherwise leave the tile
  // stuck black forever. Re-request the same URL a few times before giving up.
  const [retry, setRetry] = useState(0);
  const ref = useRef<HTMLImageElement>(null);

  const base = imageUrl(publicId, { w, crop, gravity });
  const src = retry > 0 ? `${base}${base.includes("?") ? "&" : "?"}_r=${retry}` : base;
  const set = retry > 0 ? undefined : srcSet(publicId, RESPONSIVE, { crop, gravity });

  // images served from cache can complete before React binds onLoad
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [src]);

  const onError = () => {
    if (retry < MAX_RETRY) {
      setTimeout(() => setRetry((r) => r + 1), 500 * (retry + 1));
    } else {
      setLoaded(true); // give up hiding so the tile never stays permanently black
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      srcSet={set}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={onError}
      className={`${className} transition-[opacity,filter] duration-700 ${
        loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
      }`}
    />
  );
}
