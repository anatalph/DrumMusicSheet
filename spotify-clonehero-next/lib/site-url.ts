/**
 * Resolved canonical URL for the deployed site.
 *
 * Used by Next's `metadataBase` so relative `og:image` / `twitter:image`
 * paths get upgraded to absolute URLs. Without this, link-unfurl
 * services (Discord, Slack, Bluesky) refuse to load the preview image
 * and the card shows text only.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_SITE_URL` — explicit canonical, set in production.
 *   2. `VERCEL_URL` — auto-set on every Vercel deployment (preview +
 *      production), so PR previews unfurl correctly without manual
 *      configuration.
 *   3. localhost:3000 — dev fallback. Discord doesn't unfurl localhost
 *      anyway; this exists so `metadataBase` is always a valid URL.
 */
export function getSiteUrl(): URL {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL('http://localhost:3000');
}
