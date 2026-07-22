/**
 * Compose a CSS `background` value that layers an optional photo over a
 * gradient.
 *
 * The gradient sits *behind* the photo (CSS paints the first background layer
 * on top), so it shows through as a graceful fallback until — or unless — a
 * real image is supplied or while one is still loading / has failed to load.
 * This lets the whole site swap gradient placeholders for real photography one
 * file at a time, with no other code changes.
 *
 * @param gradient A CSS gradient (or any solid colour) used as the fallback.
 * @param image    Optional path/URL to a photo, e.g. "/images/tours/hunter.webp".
 * @param focus    Optional CSS `background-position` naming the part of the
 *                 photo to keep when it gets cropped, e.g. "72% center".
 *                 Only bites where the frame is narrower than the photo (the
 *                 150×210 carousel thumbnails) — a full-bleed slide is wider
 *                 than it is tall, so `cover` already shows the whole width.
 */
export function mediaBg(
  gradient: string,
  image?: string,
  focus = "center",
): string {
  return image
    ? `url("${image}") ${focus}/cover no-repeat, ${gradient}`
    : gradient;
}
