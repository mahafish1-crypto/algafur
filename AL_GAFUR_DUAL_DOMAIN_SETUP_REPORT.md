# AL-GAFUR — Dual-Domain Configuration & Verification Report

**Project:** Al-Gafur Hajj & Umrah Tours & Travels  
**Primary Canonical Domain:** `https://www.algafur.com`  
**Root Domain (Apex):** `https://algafur.com` (`308 Permanent Redirect` → `https://www.algafur.com/`)  
**Secondary Vercel Domain:** `https://algafur.vercel.app`  
**Stack:** Next.js App Router, React, TypeScript, Prisma ORM, Supabase PostgreSQL, Vercel  

---

## 1. Domain & DNS Verification Status

All three domain entry points were inspected via DNS resolution (`Resolve-DnsName`) and live HTTPS header/route probing (`curl.exe`):

| Domain | DNS Records | Nameservers | HTTPS / SSL | Live HTTP Status | Role |
|---|---|---|---|---|---|
| `https://www.algafur.com` | `A 64.29.17.1`, `A 216.198.79.65` (Vercel Anycast) | `ns1.vercel-dns.com`, `ns2.vercel-dns.com` | Valid TLS + HSTS (`max-age=63072000`) | `200 OK` | **Primary Canonical & Marketing Domain** |
| `https://algafur.com` | `A 64.29.17.1`, `A 64.29.17.65` (Vercel Anycast) | `ns1.vercel-dns.com`, `ns2.vercel-dns.com` | Valid TLS + HSTS (`max-age=63072000`) | `308 Permanent Redirect` → `https://www.algafur.com/` | **Root Apex Redirect** |
| `https://algafur.vercel.app` | `A 64.29.17.3`, `A 216.198.79.3` (Vercel Anycast) | Vercel Managed | Valid TLS + HSTS (`max-age=63072000; includeSubDomains; preload`) | `200 OK` | **Secondary Production Domain** |

**Key Findings:**
- Both `https://www.algafur.com` and `https://algafur.vercel.app` are assigned to the **same Vercel project** and serve the exact same codebase, Supabase PostgreSQL database, and media storage.
- No DNS modifications were needed because `algafur.com` and `www.algafur.com` are already delegated to Vercel DNS (`ns1.vercel-dns.com` / `ns2.vercel-dns.com`) with active Anycast `A` records and valid SSL certificates.

---

## 2. Root Causes Identified During Codebase Audit

1. **`NEXT_PUBLIC_APP_URL` Set to `http://localhost:3000`:**
   - `.env` and `.env.local` previously had `NEXT_PUBLIC_APP_URL="http://localhost:3000"`, which could cause any helper relying on `NEXT_PUBLIC_APP_URL` without validation to emit `localhost` URLs.
2. **Legacy Domain Hardcoded in Root Layout & Settings (`algafurtours.com`):**
   - `src/app/layout.tsx` had `openGraph.url: "https://algafurtours.com"` and JSON-LD `image: "https://algafurtours.com/brand/poster.jpg"`, and lacked `metadataBase` and `alternates.canonical`.
   - `src/app/admin/settings/AdminSettingsClient.tsx` displayed `https://algafurtours.com/api/webhooks/whatsapp` instead of `https://www.algafur.com/api/webhooks/whatsapp`.
3. **YouTube Lead Link Generators Depended on `window.location.origin`:**
   - In `YouTubeLeadsOverviewClient.tsx`, `FormBuilderClient.tsx`, and `FormSettingsClient.tsx`, clicking **Copy Campaign Link** or **Copy Public Link** while logged into `https://algafur.vercel.app` (or `localhost`) generated links with `algafur.vercel.app` instead of the preferred canonical domain `https://www.algafur.com`.
4. **Missing `sitemap.ts` and `robots.ts`:**
   - No `sitemap.xml` or `robots.txt` route handlers were present to declare `https://www.algafur.com` as the canonical host for search engines.
5. **Server Actions `allowedOrigins` & Media Redirect Origin Validation:**
   - `next.config.mjs` did not explicitly list `www.algafur.com`, `algafur.com`, and `algafur.vercel.app` in `experimental.serverActions.allowedOrigins`.
   - `src/app/api/media/[id]/file/route.ts` constructed fallback redirect URLs from raw `req.url` rather than a validated origin allowlist.

---

## 3. Codebase, URL Generation, Cookie & SEO Changes Implemented

### A. Centralized Domain & URL Safety Utility (`src/lib/site-url.ts`)
Created `src/lib/site-url.ts` providing:
- `CANONICAL_SITE_URL = "https://www.algafur.com"` and `VERCEL_SITE_URL = "https://algafur.vercel.app"`.
- `ALLOWED_PRODUCTION_HOSTS` (`www.algafur.com`, `algafur.com`, `algafur.vercel.app`).
- `getCanonicalSiteUrl()`: Returns `https://www.algafur.com` and strictly rejects `localhost` or unverified domains even if misconfigured in environment variables.
- `buildCanonicalUrl(path, queryParams)`: Generates shareable marketing and YouTube campaign URLs on `https://www.algafur.com` while preserving all UTM (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) and `video` tracking parameters.
- `getValidatedRequestOrigin(headers)`: Validates `Origin` / `Host` / `X-Forwarded-Host` headers against the allowlist so untrusted `Host` headers can never poison redirects.
- `sanitizeInternalRedirectPath(path, fallback)`: Ensures login, signup, and admin redirects remain relative internal paths (`/...`) so users stay on whichever domain (`www.algafur.com` or `algafur.vercel.app`) they are currently browsing.

### B. Authentication & Session Cookie Configuration (`src/lib/auth.ts`)
- Reviewed `setSessionCookie()` and `clearSessionCookie()` in `src/lib/auth.ts`.
- Because `algafur.com` and `vercel.app` are separate registrable domains (eTLD+1), browsers prohibit sharing a single cookie across both.
- `algafur_session` is configured as a **host-only cookie** (no `domain` attribute) with `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/"`, and 7-day `maxAge`.
- Updated `clearSessionCookie()` to explicitly overwrite the cookie with `maxAge: 0` and identical `path: "/"`, `httpOnly: true`, `secure`, and `sameSite: "lax"` attributes so logout reliably clears sessions on both `www.algafur.com` and `algafur.vercel.app`.
- All internal login/signup/logout API calls (`/api/auth/login`, `/api/auth/signup`, `/api/auth/logout`, `/api/auth/me`) and redirects (`/admin`, `/customer/dashboard`, `/agent/dashboard`, `/login`) use relative paths so authentication works independently on either domain without cross-domain redirect loops.

### C. Next.js Configuration (`next.config.mjs`)
- Added `experimental.serverActions.allowedOrigins: ['www.algafur.com', 'algafur.com', 'algafur.vercel.app', 'localhost:3000']`.
- Added security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`) applied consistently across both domains.

### D. Canonical Metadata, Sitemap & Robots (`src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`)
- Updated `src/app/layout.tsx` to set `metadataBase: new URL("https://www.algafur.com")`, `alternates: { canonical: "/" }`, `openGraph.url: "https://www.algafur.com"`, and updated JSON-LD `TravelAgency` schema `url` and `image` to `https://www.algafur.com`.
- Updated `src/app/(public)/packages/[slug]/page.tsx`, `src/app/(public)/youtube-lead/page.tsx`, and `src/app/(public)/lead/[slug]/page.tsx` to emit canonical URLs on `https://www.algafur.com`.
- Created `src/app/sitemap.ts` to dynamically generate canonical `https://www.algafur.com` URLs for all public pages and all published database packages.
- Created `src/app/robots.ts` pointing to `https://www.algafur.com/sitemap.xml` and disallowing `/admin/`, `/api/`, `/customer/`, and `/agent/`.

### E. YouTube Lead Share & Campaign Tracking Links
- Updated `src/app/admin/youtube-leads/YouTubeLeadsOverviewClient.tsx`, `src/app/admin/youtube-leads/forms/FormBuilderClient.tsx`, and `src/app/admin/youtube-leads/settings/FormSettingsClient.tsx` to use `buildCanonicalUrl()` so all generated public form links (`https://www.algafur.com/youtube-lead` and `https://www.algafur.com/lead/[slug]`) and YouTube UTM campaign links use `https://www.algafur.com` regardless of which domain the Admin Panel is accessed from.

### F. Environment Variables Updated
- Updated `NEXT_PUBLIC_APP_URL` and added `NEXT_PUBLIC_SITE_URL` set to `"https://www.algafur.com"` in `.env` and `.env.local` (no secret values were modified or exposed).

---

## 4. End-to-End Verification Results

### Live Production Domain Route Checks (Read-Only HTTP Probes)

| Route / Check | `https://www.algafur.com` | `https://algafur.vercel.app` |
|---|---|---|
| `/` (Homepage) | `200 OK` | `200 OK` |
| `/packages` (Packages Listing) | `200 OK` | `200 OK` |
| `/packages/umrah-platinum-package-2026` | `200 OK` | `200 OK` |
| `/hotels` (Hotels Showcase) | `200 OK` | `200 OK` |
| `/about` (About Us) | `200 OK` | `200 OK` |
| `/contact` (Contact Us) | `200 OK` | `200 OK` |
| `/login` & `/signup` | `200 OK` | `200 OK` |
| `/booking` (Booking Enquiry) | `200 OK` | `200 OK` |
| `/admin` (Unauthenticated Redirect) | `307` → `https://www.algafur.com/login` | `307` → `https://algafur.vercel.app/login` |
| `/api/packages` & `/api/hotels` | `200 OK` | `200 OK` |
| `/api/auth/me` (Unauthenticated) | `401 Unauthorized` | `401 Unauthorized` |
| `/brand/poster.jpg` (Media Asset) | `200 OK` | `200 OK` |

### Automated Dual-Domain & Build Verification Suite

1. **`verify_dual_domain.ts`:**
   - `[PASS]` `getCanonicalSiteUrl()` rejects `localhost` and returns `https://www.algafur.com`.
   - `[PASS]` `buildCanonicalUrl()` generates `https://www.algafur.com/youtube-lead?...` links with preserved UTM and `video` parameters.
   - `[PASS]` `getValidatedRequestOrigin()` supports `www.algafur.com`, normalizes `algafur.com`, supports `algafur.vercel.app`, and blocks spoofed `Host` / `Origin` headers.
   - `[PASS]` `sanitizeInternalRedirectPath()` prevents cross-domain open redirects.
   - `[PASS]` `robots.ts` and `sitemap.ts` verified with canonical `https://www.algafur.com` URLs for all static pages and published packages.
2. **TypeScript & Production Next.js Build (`tsc --noEmit` & `npm run build`):**
   - Zero TypeScript errors; all routes (`/`, `/packages/[slug]`, `/youtube-lead`, `/lead/[slug]`, `/sitemap.xml`, `/robots.txt`, `/admin/youtube-leads/*`) compiled cleanly.

---

## 5. Remaining Manual / Deployment Steps

1. **Vercel Environment Variables (Dashboard Check):**
   - In the Vercel Project Dashboard (`Settings` → `Environment Variables`), set:
     - `NEXT_PUBLIC_SITE_URL` = `https://www.algafur.com`
     - `NEXT_PUBLIC_APP_URL` = `https://www.algafur.com`
   - Note: Even before setting this in the Vercel UI, `getCanonicalSiteUrl()` in `src/lib/site-url.ts` already defaults to `https://www.algafur.com` and ignores `localhost`.
2. **Commit, Push & Deploy (Awaiting Approval):**
   - Per your safety instructions, no `git commit`, `git push`, or production `vercel --prod` deployment has been executed yet. Once you approve, pushing and deploying will activate the new canonical metadata, `sitemap.xml`, `robots.txt`, and the YouTube Lead Management module on both `https://www.algafur.com` and `https://algafur.vercel.app`.

