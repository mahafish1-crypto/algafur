/**
 * Centralized, validated domain & URL configuration for Al-Gafur Hajj & Umrah.
 *
 * Ensures both production domains work seamlessly:
 *  1. https://www.algafur.com (Preferred Canonical & Marketing/Share Domain)
 *  2. https://algafur.vercel.app (Secondary Production Vercel Domain)
 *
 * Security & Reliability Rules:
 *  - Never generates production share/canonical links using `localhost`.
 *  - Never trusts arbitrary unvalidated `Host` / `Origin` headers.
 *  - Uses relative URLs for internal navigation & API calls so sessions work independently on either domain.
 */

export const CANONICAL_DOMAIN = "www.algafur.com";
export const CANONICAL_SITE_URL = "https://www.algafur.com";
export const VERCEL_SITE_URL = "https://algafur.vercel.app";

export const ALLOWED_PRODUCTION_HOSTS = new Set<string>([
  "www.algafur.com",
  "algafur.com",
  "algafur.vercel.app",
]);

export const ALLOWED_PRODUCTION_ORIGINS = new Set<string>([
  "https://www.algafur.com",
  "https://algafur.com",
  "https://algafur.vercel.app",
]);

/**
 * Returns the canonical public base URL (`https://www.algafur.com`).
 * Used for SEO metadata (`metadataBase`, canonical tags, OpenGraph, JSON-LD,
 * sitemap.xml, robots.txt) and for generating shareable marketing & YouTube lead links.
 *
 * Never returns `localhost` even if `NEXT_PUBLIC_APP_URL` is set to localhost in `.env`.
 */
export function getCanonicalSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "";

  if (configured) {
    try {
      const parsed = new URL(configured);
      const host = parsed.hostname.toLowerCase();
      // Only accept explicitly allowed production hosts; ignore localhost or old domains
      if (ALLOWED_PRODUCTION_HOSTS.has(host)) {
        if (host === "algafur.com") {
          return CANONICAL_SITE_URL;
        }
        return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, "");
      }
    } catch {
      // Fallback to canonical URL below
    }
  }

  return CANONICAL_SITE_URL;
}

/**
 * Builds a full canonical URL on `https://www.algafur.com` for a given path and optional query parameters,
 * preserving UTM and campaign tracking parameters.
 */
export function buildCanonicalUrl(
  path = "/",
  queryParams?: Record<string, string | undefined | null> | URLSearchParams
): string {
  const base = getCanonicalSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, base);

  if (queryParams) {
    if (queryParams instanceof URLSearchParams) {
      queryParams.forEach((value, key) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, value);
        }
      });
    } else {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }
  }

  return url.toString();
}

/**
 * Validates an incoming `Host` or `Origin` header against the allowlist of domains.
 * Prevents Host-header injection when constructing origin-aware responses.
 */
export function getValidatedRequestOrigin(headersInput?: {
  get(name: string): string | null;
}): string {
  if (!headersInput) return CANONICAL_SITE_URL;

  const rawOrigin = headersInput.get("origin");
  if (rawOrigin) {
    try {
      const parsed = new URL(rawOrigin);
      const normalized = `${parsed.protocol}//${parsed.host}`.toLowerCase();
      if (ALLOWED_PRODUCTION_ORIGINS.has(normalized)) {
        return normalized === "https://algafur.com"
          ? CANONICAL_SITE_URL
          : normalized;
      }
      if (
        process.env.NODE_ENV !== "production" &&
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
      ) {
        return `${parsed.protocol}//${parsed.host}`;
      }
    } catch {
      // Ignore malformed origin
    }
  }

  const rawHost =
    headersInput.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headersInput.get("host")?.trim() ||
    "";

  if (rawHost) {
    const cleanHost = rawHost.toLowerCase().replace(/:\d+$/, "");
    if (ALLOWED_PRODUCTION_HOSTS.has(cleanHost)) {
      return cleanHost === "algafur.com"
        ? CANONICAL_SITE_URL
        : `https://${cleanHost}`;
    }
    if (
      process.env.NODE_ENV !== "production" &&
      (cleanHost === "localhost" || cleanHost === "127.0.0.1")
    ) {
      return `http://${rawHost}`;
    }
  }

  return CANONICAL_SITE_URL;
}

/**
 * Ensures an internal redirect path is strictly a safe relative path (e.g. `/admin`, `/customer/dashboard`)
 * so login/signup/form redirects never send a user to an unexpected external domain or cross-domain mismatch.
 */
export function sanitizeInternalRedirectPath(
  candidate: string | null | undefined,
  fallback = "/"
): string {
  if (!candidate || typeof candidate !== "string") return fallback;
  const trimmed = candidate.trim();
  // Must start with a single slash and not `//` or `/\`
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }
  return trimmed;
}

