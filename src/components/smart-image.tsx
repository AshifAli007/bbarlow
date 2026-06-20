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
  const ref = useRef<HTMLImageElement>(null);
  const src = imageUrl(publicId, { w, crop, gravity });
  const set = srcSet(publicId, RESPONSIVE, { crop, gravity });

  // images served from cache can complete before React binds onLoad
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

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
      className={`${className} transition-[opacity,filter] duration-700 ${
        loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
      }`}
    />
  );
}
