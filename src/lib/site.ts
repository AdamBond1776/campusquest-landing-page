/**
 * Absolute origin for canonical URLs and social card images.
 *
 * Set NEXT_PUBLIC_SITE_URL for the production domain. On Vercel preview
 * deploys the platform-provided host is used so cards resolve there too.
 * When neither is present the metadata falls back to relative URLs.
 */
function resolve(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim() ?? process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;

  return undefined;
}

export const siteUrl = resolve();
