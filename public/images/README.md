# Site images

Everything visual on the site ships with a **CSS gradient placeholder** and
layers a real photo over it when one is present. Drop a file in the right place,
point the matching entry at it, and the photo takes over — the gradient stays
behind as a fallback while the image loads or if it's ever missing.

The layering is done by `mediaBg()` in [`lib/media.ts`](../../lib/media.ts).

## Showcase tours (carousel + stacking cards)

Data lives in [`lib/showcase.ts`](../../lib/showcase.ts). All nine tours now
point at a photo in `public/images/tours/<id>.webp`:

```ts
bg: "linear-gradient(150deg,#858d47,#35381d)",
image: "/images/tours/hunter.webp",
```

Tour ids: `hunter`, `beaches`, `foodie`, `jenolan`, `highlands`,
`central-coast`, `blue-mountains-day`, `orange-mudgee`, `kangaroo-valley`.

To swap one out, replace the file and keep the name — no code change needed.
Each `bg` gradient is set to the mean colour of its photo so the fallback
doesn't flash a clashing colour on load; re-derive it if you change the photo.

These photos are used at three sizes (full-bleed background, 150×210 thumbnail,
and the morphing clone), all with `center/cover`. Prefer a landscape image
~1600×1000 or larger whose subject survives a centre crop in both a wide and a
tall frame.

## Jimmy portrait

`public/images/jimmy.webp`, wired up via `JIMMY_IMAGE` in
[`components/JimmyStrip.tsx`](../../components/JimmyStrip.tsx). The `.avatar`
box is landscape (~250×200), so crop replacements to roughly 1.3:1.

## Notes

- Paths are web-absolute from `public/` (start with `/images/...`), **not**
  filesystem paths.
- Any web format works (`.webp`, `.avif`, `.jpg`, `.png`). WebP is used here
  because delivery is a plain CSS `background` — Next does **not** optimise
  these, so the committed file is exactly what ships.
- Source photos live loose in `public/images/`; the files under `tours/` are
  cropped and re-encoded derivatives of them.
- Delivery is plain CSS `background`, so no `next.config.js` changes are needed
  for local files. If you later host images on another domain and switch to
  `next/image`, add that host to `images.remotePatterns` there.
