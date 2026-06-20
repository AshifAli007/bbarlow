"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SmartImage } from "@/components/smart-image";
import { useLightbox } from "@/components/lightbox";
import { meets, allPhotos, totals, type Photo } from "@/lib/photos";

type Filter = { id: string; label: string; count: number };

const ROWS_PER_STEP = 2;

/** Columns must mirror the Tailwind grid breakpoints below (md=768, lg=1024). */
function columnsForWidth(w: number) {
  if (w < 768) return 2;
  if (w < 1024) return 3;
  return 4;
}

export function Gallery() {
  const { open } = useLightbox();
  const [active, setActive] = useState("all");
  const [rows, setRows] = useState(ROWS_PER_STEP);
  const [columns, setColumns] = useState(4);
  const rail = useRef<HTMLDivElement>(null);

  // track column count so we can paginate by whole rows
  useEffect(() => {
    const compute = () => setColumns(columnsForWidth(window.innerWidth));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const filters: Filter[] = useMemo(
    () => [
      { id: "all", label: "All", count: totals.photos },
      ...meets.map((m) => ({ id: m.id, label: m.displayName, count: m.photoCount })),
    ],
    []
  );

  const photos: Photo[] = useMemo(() => {
    if (active === "all") return allPhotos;
    return meets.find((m) => m.id === active)?.photos ?? [];
  }, [active]);

  const activeMeet = meets.find((m) => m.id === active);
  const caption =
    active === "all"
      ? "Beth Barlow"
      : `${activeMeet?.displayName} · ${activeMeet?.dateLabel}`;

  const selectFilter = (id: string) => {
    setActive(id);
    setRows(ROWS_PER_STEP);
  };

  const perPage = columns * rows;
  const showAll = photos.length <= perPage;
  const visibleCount = showAll ? photos.length : perPage;
  const visible = photos.slice(0, visibleCount);
  const hiddenCount = photos.length - visibleCount;
  // when there are more photos, the final visible tile becomes the "show more" gate
  const gateIndex = showAll ? -1 : visibleCount - 1;

  // drag-to-scroll for the filter rail
  const drag = useRef({ down: false, x: 0, left: 0 });
  const onDown = (e: React.MouseEvent) => {
    const el = rail.current!;
    drag.current = { down: true, x: e.pageX, left: el.scrollLeft };
  };
  const onMove = (e: React.MouseEvent) => {
    if (!drag.current.down) return;
    const el = rail.current!;
    el.scrollLeft = drag.current.left - (e.pageX - drag.current.x);
  };
  const endDrag = () => (drag.current.down = false);

  return (
    <section className="relative bg-ink-soft py-[clamp(3rem,8vw,7rem)]">
      <div className="mx-auto max-w-[110rem] px-[clamp(1rem,4vw,3rem)]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-bone/15 pb-6">
          <h2 className="font-display text-[clamp(2.2rem,7vw,5.5rem)] text-bone">
            The archive
          </h2>
          <span className="overline">{totals.photos} frames · {totals.meets} meets</span>
        </div>

        {/* filter rail (drag to scroll) */}
        <div
          ref={rail}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          className="no-scrollbar mt-6 flex cursor-grab gap-2 overflow-x-auto pb-2 active:cursor-grabbing"
          style={{ scrollbarWidth: "none" }}
        >
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => selectFilter(f.id)}
              data-cursor="hover"
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                active === f.id
                  ? "border-gold bg-gold text-ink"
                  : "border-bone/20 text-bone/70 hover:border-bone/50 hover:text-bone"
              }`}
            >
              {f.label}
              <span className="ml-2 opacity-50">{f.count}</span>
            </button>
          ))}
        </div>

        {/* uniform grid, paginated by whole rows */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p, i) => {
            const isGate = i === gateIndex;
            return (
              <button
                key={p.publicId}
                onClick={() => (isGate ? setRows((r) => r + ROWS_PER_STEP) : open(photos, i, caption))}
                data-cursor-label={isGate ? undefined : "View"}
                data-cursor={isGate ? "hover" : undefined}
                aria-label={isGate ? `Show ${hiddenCount} more photos` : "View photo"}
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-sm bg-ink"
              >
                <div
                  className={`h-full w-full transition duration-500 ${
                    isGate ? "scale-110 blur-md brightness-50" : ""
                  }`}
                >
                  <SmartImage
                    publicId={p.publicId}
                    alt={caption}
                    width={p.w}
                    height={p.h}
                    w={p.orientation === "portrait" ? 600 : 700}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {isGate ? (
                  <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-bone">
                    <span className="overline transition-colors group-hover:text-gold">
                      Show more
                    </span>
                    <span className="font-display text-[clamp(1.6rem,4vw,2.6rem)] leading-none text-gold">
                      +{hiddenCount}
                    </span>
                  </span>
                ) : (
                  <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/15" />
                )}
              </button>
            );
          })}
        </div>

        {/* collapse */}
        {rows > ROWS_PER_STEP && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setRows(ROWS_PER_STEP)}
              data-cursor="hover"
              className="rounded-full border border-bone/25 px-6 py-2.5 text-sm text-bone/80 transition hover:border-gold hover:text-gold"
            >
              Show less
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
