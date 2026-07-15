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
 * @param image    Optional path/URL to a photo, e.g. "/images/tours/hunter.jpg".
 */
export function mediaBg(gradient: string, image?: string): string {
  return image
    ? `url("${image}") center/cover no-repeat, ${gradient}`
    : gradient;
}
