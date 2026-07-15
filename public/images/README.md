# Site images

Everything visual on the site ships with a **CSS gradient placeholder** and
layers a real photo over it when one is present. Drop a file in the right place,
point the matching entry at it, and the photo takes over — the gradient stays
behind as a fallback while the image loads or if it's ever missing.

The layering is done by `mediaBg()` in [`lib/media.ts`](../../lib/media.ts).

## Showcase tours (carousel + stacking cards)

Data lives in [`lib/showcase.ts`](../../lib/showcase.ts). For each tour, drop a
photo at `public/images/tours/<id>.jpg` and set its `image` field:

```ts
image: "/images/tours/hunter.jpg",
```

Tour ids: `hunter`, `beaches`, `foodie`, `jenolan`, `highlands`,
`central-coast`, `blue-mountains-day`, `orange-mudgee`, `kangaroo-valley`.

These photos are used at three sizes (full-bleed background, thumbnail, and the
morphing clone), so use a landscape image ~1600×1000 or larger.

## Hero (three stacked images)

Data lives in [`components/Hero.tsx`](../../components/Hero.tsx). Drop files in
`public/images/hero/` and uncomment the matching `image` line:

- `hero/hunter-valley.jpg` — large top-right panel
- `hero/chef-on-the-road.jpg` — left panel
- `hero/blue-mountains.jpg` — small bottom panel

## Jimmy portrait

In [`components/JimmyStrip.tsx`](../../components/JimmyStrip.tsx), drop a portrait
at `public/images/jimmy.jpg` and set `JIMMY_IMAGE = "/images/jimmy.jpg"`.

## Notes

- Paths are web-absolute from `public/` (start with `/images/...`), **not**
  filesystem paths.
- `.jpg` is just a convention — any web format works (`.webp`, `.avif`, `.png`).
- Delivery is plain CSS `background`, so no `next.config.js` changes are needed
  for local files. If you later host images on another domain and switch to
  `next/image`, add that host to `images.remotePatterns` there.
