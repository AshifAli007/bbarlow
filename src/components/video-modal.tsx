"use client";

import { useEffect } from "react";
import { embedUrl, type Video } from "@/data/videos";

export function VideoModal({
  video,
  onClose,
}: {
  video: Video | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!video) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/95 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        aria-label="Close"
        className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-bone/25 text-bone transition hover:border-gold hover:text-gold"
        onClick={onClose}
      >
        ✕
      </button>

      <figure
        className="flex w-full max-w-[88rem] flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video w-full overflow-hidden rounded-sm bg-black shadow-2xl">
          <iframe
            key={video.id}
            src={embedUrl(video.id)}
            title={video.event}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
        <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm text-bone/70">
          <span className="overline text-gold">
            {video.title} · {video.year}
          </span>
          {video.result && <span className="tnum text-bone/85">{video.result}</span>}
          {video.note && <span className="text-bone/55">{video.note}</span>}
          <a
            href={video.youtube}
            target="_blank"
            rel="noreferrer"
            data-cursor="hover"
            className="ml-auto inline-flex items-center gap-1 text-bone/70 underline-offset-4 transition hover:text-gold hover:underline"
          >
            Watch on YouTube
            <span aria-hidden>↗</span>
          </a>
        </figcaption>
      </figure>
    </div>
  );
}
