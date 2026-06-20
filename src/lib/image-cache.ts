/**
 * Module-level record of image URLs the browser has already decoded (via the
 * lightbox preloader or a prior <img> load). Lets SmartImage start in the
 * "loaded" state for cached images so it shows instantly with no blur-up,
 * while still gracefully blurring images that are genuinely still loading.
 */
const decoded = new Set<string>();

export const markImageLoaded = (url: string) => {
  decoded.add(url);
};

export const isImageLoaded = (url: string) => decoded.has(url);
