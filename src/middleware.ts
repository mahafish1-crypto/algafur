import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * AL GAFUR INTERNATIONAL TOURS AND TRAVELS - Edge Canonical & Security Middleware
 *
 * Responsibilities:
 * 1. 301 Permanent Redirect from apex domain (algafur.com) to canonical custom domain (www.algafur.com)
 *    preserving path, query string, and search params.
 * 2. Allows algafur.vercel.app to operate as a live fallback without redirect loops.
 * 3. Injects CORS headers for allowed production origins (www.algafur.com and algafur.vercel.app).
 * 4. Injects strict HTTP security headers across all edge responses.
 */

const ALLOWED_ORIGINS = new Set([
  "https://www.algafur.com",
  "https://algafur.com",
  "https://algafur.vercel.app",
]);

export function middleware(request: NextRequest) {
  const host = (
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host")?.trim() ||
    ""
  )
    .toLowerCase()
    .replace(/:\d+$/, "");

  // 1. Apex to Canonical Subdomain 301 Redirect (algafur.com -> www.algafur.com)
  if (host === "algafur.com") {
    const url = request.nextUrl.clone();
    url.hostname = "www.algafur.com";
    url.port = "";
    url.protocol = "https:";
    return NextResponse.redirect(url, { status: 301 });
  }

  // 2. Handle CORS preflight & cross-origin requests
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS" && origin && ALLOWED_ORIGINS.has(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-requested-with",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = NextResponse.next();

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-requested-with"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // 3. Security Headers Defense-in-Depth
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public assets with extensions (.png, .jpg, .svg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
