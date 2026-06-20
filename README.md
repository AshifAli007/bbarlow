# Elizabeth "Beth" Barlow — Distance Runner

A cinematic, editorial personal-brand site for distance runner Elizabeth Barlow:
her Manchester-to-the-NCAA journey, headline personal bests, a meet-by-meet
photo story, and the full competition record.

Built with **Next.js + TypeScript + Tailwind v4 + GSAP/ScrollTrigger + Lenis +
Motion**. Race photos are hosted and transformed on **Cloudinary**.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

The site renders immediately using local image previews in `public/photos`
(generated from the originals). To serve images from the CDN in production,
follow the Cloudinary steps below.

## Photos pipeline

The originals (288 photos) live on disk and are pushed to Cloudinary; only the
generated manifest (`src/data/photos.json`) is committed.

```bash
# 1. Parse filenames -> grouped meets + manifest (already run; re-run if photos change)
npm run photos:parse

# 2. (optional, dev only) make local web-sized previews so the site renders offline
node scripts/local-preview.mjs

# 3. Upload originals to Cloudinary (needs credentials, see below)
npm run photos:upload
```

`parse-photos.mjs` groups photos by date into meets (curated lookup in the
script), reads real pixel dimensions via macOS `sips`, and assigns each photo a
deterministic `publicId` (`beth/<meet>/<file>`). The upload script ships the
bytes to those exact ids, so the site needs no manifest changes after upload.

## Cloudinary setup

1. Create a free account at <https://cloudinary.com>.
2. Copy `.env.example` to `.env` and fill in:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   PHOTOS_DIR=/absolute/path/to/originals
   ```
3. `npm run photos:upload` (idempotent — safe to re-run / resume).

When `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set, the site automatically builds
Cloudinary URLs (`f_auto,q_auto`, responsive widths, `dpr_auto`). When it is
not set, it falls back to `public/photos` previews.

## Data

- `src/data/profile.ts` — bio, personal bests, the four-stop journey, links.
- `src/data/races.ts` — cleaned competition record (verified vs TFRRS / World
  Athletics), grouped by season, linked to photo meets.
- `src/data/photos.json` — generated photo manifest (do not edit by hand).

## Deploy (Vercel)

```bash
npm i -g vercel   # if needed
vercel            # link & deploy
```

Add the four env vars in the Vercel project settings (the
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` must be present at build time).

## Notes

- Every scroll/WebGL effect has a `prefers-reduced-motion` fallback.
- Photos belong to their respective race photographers; this is a personal,
  non-commercial tribute site.
