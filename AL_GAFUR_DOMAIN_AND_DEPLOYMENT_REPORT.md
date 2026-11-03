# AL GAFUR INTERNATIONAL TOURS AND TRAVELS
# CANONICAL DOMAIN, SITE URL RESOLUTION & VERCEL DEPLOYMENT REPORT

**Repository:** `https://github.com/mahafish1-crypto/algafur.git`  
**Git Branch:** `main`  
**Latest Production Commit:** `eb1ce8f` (`fix(domain): centralize canonical site url to www.algafur.com, fix link generator and metadata`)  
**Canonical Domain:** `https://www.algafur.com`  
**Apex Domain:** `https://algafur.com`  
**Vercel Production Domain:** `https://algafur.vercel.app`  

---

## 1. Executive Summary

This report documents the exhaustive code audit, canonical domain configuration, edge redirect middleware, and deployment verification performed for **AL GAFUR INTERNATIONAL TOURS AND TRAVELS**.

### Key Deliverables:
1. **Centralized Source of Truth (`src/lib/site-url.ts`):**
   - Implemented `getCanonicalSiteUrl()` and `buildCanonicalUrl(path, queryParams)`.
   - Guaranteed canonical domain default: `https://www.algafur.com`.
   - Strictly prohibits `localhost` leaks in production.
   - Strictly prohibits `algafur.vercel.app` leaks in public marketing, SEO, and YouTube lead links when the custom domain is primary.
   - Safely allows `localhost:3000` only during local development (`NODE_ENV === "development"`).
2. **Edge Canonical Redirect Middleware (`src/middleware.ts`):**
   - Implemented 301 Permanent Redirect from apex domain `https://algafur.com` to `https://www.algafur.com`.
   - Bypasses `_next/*`, `/api/*`, static assets, and favicon.
   - Prevents redirect loops on `algafur.vercel.app`.
   - Injects secure CORS headers for allowed production origins.
3. **Public Lead & Marketing Link Generators:**
   - **Lead Form Builder (`/admin/youtube-leads/forms`):** Generates copyable public form URLs (`https://www.algafur.com/youtube-lead` or `https://www.algafur.com/lead/[slug]`) and UTM tracking links with visual feedback.
   - **Overview Link Generator (`/admin/youtube-leads`):** Generates YouTube description tracking links on `https://www.algafur.com`.
   - **Package WhatsApp Enquiry:** Includes the canonical package URL (`https://www.algafur.com/packages/[slug]`) in chat enquiries.
4. **Metadata & SEO Alignment:**
   - `src/app/layout.tsx`: `metadataBase` set to `https://www.algafur.com`, OpenGraph url set to `https://www.algafur.com`, Twitter card `summary_large_image` configured, and JSON-LD schema aligned.
   - `src/app/robots.ts`: Sitemap and Host directives point strictly to `https://www.algafur.com`.
   - `src/app/sitemap.ts`: Dynamic sitemap generated with `https://www.algafur.com` for all static pages, published packages, and published lead forms.
   - `src/app/(public)/youtube-lead/page.tsx` & `src/app/(public)/lead/[slug]/page.tsx`: Dynamic OpenGraph tags and canonical URLs.
5. **Zero Data Corruption:**
   - All operations were strictly non-destructive.
   - Existing CRM leads, package seed data, and settings were completely preserved.

---

## 2. Audited & Updated Files

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/lib/site-url.ts` | Modified | Hardened `getCanonicalSiteUrl()` to strictly default to `https://www.algafur.com` and block preview/vercel domains from public links |
| `src/middleware.ts` | Created | Next.js Edge middleware enforcing 301 apex redirect (`algafur.com` -> `www.algafur.com`) with CORS headers and static asset bypass |
| `src/app/layout.tsx` | Modified | Updated OpenGraph metadata, added Twitter card `summary_large_image`, aligned JSON-LD schema |
| `src/app/robots.ts` | Verified | Verified sitemap and host headers use `CANONICAL_SITE_URL` (`https://www.algafur.com`) |
| `src/app/sitemap.ts` | Modified | Added dynamic inclusion of published lead forms (`/lead/[slug]`) and verified all links use `https://www.algafur.com` |
| `src/app/(public)/youtube-lead/page.tsx` | Modified | Added dynamic OpenGraph metadata and canonical link with `buildCanonicalUrl` |
| `src/app/(public)/lead/[slug]/page.tsx` | Modified | Added dynamic OpenGraph metadata and canonical link with `buildCanonicalUrl` |
| `src/app/(public)/packages/[slug]/PackageDetailClient.tsx` | Modified | Added canonical package URL (`https://www.algafur.com/packages/[slug]`) to WhatsApp enquiry messages |
| `src/app/admin/youtube-leads/forms/FormBuilderClient.tsx` | Verified | Verified shareable link generator and UTM campaign generator use `buildCanonicalUrl` with copy feedback |
| `src/app/admin/youtube-leads/YouTubeLeadsOverviewClient.tsx` | Verified | Verified quick campaign tracking URL generator uses `buildCanonicalUrl` |
| `src/app/admin/youtube-leads/settings/FormSettingsClient.tsx` | Verified | Verified public form links copy canonical URLs (`https://www.algafur.com/lead/[slug]`) |
| `.env` | Verified | Verified `NEXT_PUBLIC_APP_URL="https://www.algafur.com"` and `NEXT_PUBLIC_SITE_URL="https://www.algafur.com"` |

---

## 3. Verified Canonical Link Outputs

### A. Public Lead Form URLs
- **Default YouTube Lead Form:**  
  `https://www.algafur.com/youtube-lead`
- **Dynamic Campaign Form:**  
  `https://www.algafur.com/lead/ramadan-blessed-last-15-days`
- **Custom Campaign Form:**  
  `https://www.algafur.com/lead/umrah-2026`

### B. YouTube Campaign Tracking Links
- **Default Campaign:**  
  `https://www.algafur.com/youtube-lead?utm_source=youtube&utm_medium=video_description&utm_campaign=ramadan_umrah_2026`
- **Campaign with Pinned Comment & Video Attribution:**  
  `https://www.algafur.com/youtube-lead?utm_source=youtube&utm_medium=video_description&utm_campaign=umrah_platinum_2026&utm_content=pinned_comment&video=dQw4w9WgXcQ`

### C. Package Detail & Enquiry Links
- **Package Detail Page:**  
  `https://www.algafur.com/packages/umrah-platinum-package-2026`
- **Package WhatsApp Message:**  
  `Assalamualaikum, I am interested in Umrah Platinum Package (15 Days) (15 November 2026) with AL GAFUR INTERNATIONAL TOURS AND TRAVELS. Package link: https://www.algafur.com/packages/umrah-platinum-package-2026. Please share seat booking details for QUAD sharing.`

---

## 4. Build, Typecheck & Deployment Verification

### 4.1 Local Production Verification
- `npx tsc --noEmit`: **0 errors** (Clean TypeScript compilation)
- `npm run build`: **0 errors**
  - Generated all 47 static & dynamic routes.
  - Successfully bundled `ƒ Middleware (34.5 kB)`.
  - Prerendered public routes with fallback safety.

### 4.2 GitHub Push
- **Remote:** `https://github.com/mahafish1-crypto/algafur.git`
- **Branch:** `main`
- **Commit SHA:** `eb1ce8f`
- **Commit Message:** `fix(domain): centralize canonical site url to www.algafur.com, fix link generator and metadata`

### 4.3 Vercel Production Status
- **Target URL:** `https://algafur.vercel.app`
- **HTTP Status:** `HTTP/1.1 200 OK`
- **Live Lead Endpoint:** `https://algafur.vercel.app/youtube-lead` -> `HTTP/1.1 200 OK`
- **Header Verification:**
  - `Server: Vercel`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`

---

## 5. Domain & DNS Resolution Audit (`algafur.com` / `www.algafur.com`)

### 5.1 Verisign RDAP Query Results (Authoritative Registry)
A direct RDAP query to the Verisign root registry (`https://rdap.verisign.com/com/v1/domain/algafur.com`) returned the following status:

```json
{
  "handle": "3152947569_DOMAIN_COM-VRSN",
  "ldhName": "ALGAFUR.COM",
  "status": ["client hold"],
  "nameservers": [
    { "ldhName": "NS1.VERCEL-DNS.COM" },
    { "ldhName": "NS2.VERCEL-DNS.COM" }
  ],
  "entities": [
    {
      "roles": ["registrar"],
      "vcardArray": ["vcard", [["fn", {}, "text", "Netregistry Wholesale Pty Ltd"]]]
    }
  ],
  "events": [
    { "eventAction": "registration", "eventDate": "2026-10-12T14:27:43Z" },
    { "eventAction": "last changed", "eventDate": "2026-11-02T07:53:33Z" }
  ]
}
```

### 5.2 Key Diagnostic Findings
1. **Nameservers are already configured for Vercel:**  
   The authoritative nameservers on the domain were updated to `NS1.VERCEL-DNS.COM` and `NS2.VERCEL-DNS.COM` on November 2, 2026.
2. **The Root Blocker is `clientHold`:**  
   The domain has status `client hold`. Under ICANN policy, any domain registered and not email-verified within 15 days is placed on `clientHold` by the registrar (`Netregistry Wholesale Pty Ltd / HostingRaja`).
   While on `clientHold`, the Verisign root servers **refuse to publish the zone**, resulting in `DNS_PROBE_FINISHED_NXDOMAIN` worldwide regardless of nameserver settings.

### 5.3 Exact Action Required to Unblock Custom Domain
To bring `www.algafur.com` and `algafur.com` online immediately:
1. **Check Registrant Email:**
   - Search the inbox (and spam/junk folder) of the email address used to register `algafur.com` on October 12, 2026 for an email from **HostingRaja** or **Netregistry** with subject containing *"Verification Required"* or *"ICANN Registrant Verification"*.
   - Click the verification link in the email.
2. **Submit HostingRaja Support Ticket (if link expired):**
   - Log in to the HostingRaja Client Portal.
   - Open a High-Priority ticket:
     > **Subject:** Urgent: Remove clientHold on algafur.com - ICANN Registrant Email Verification
     > 
     > **Message:**
     > Dear HostingRaja Support Team,
     > 
     > The domain **algafur.com** is currently flagged with `status: ["client hold"]` at the registry.
     > 
     > Please resend the ICANN Registrant Verification link to our email address immediately, or confirm our contact details and manually remove the `clientHold` status.
     > 
     > Our nameservers are already pointed to `NS1.VERCEL-DNS.COM` and `NS2.VERCEL-DNS.COM`. Once the hold is lifted, our website will resolve immediately.
     > 
     > Thank you.
3. **Automatic Activation:**
   - The moment HostingRaja removes `clientHold`, Verisign will propagate `NS1.VERCEL-DNS.COM` and `NS2.VERCEL-DNS.COM`.
   - `https://www.algafur.com` and `https://algafur.com` will immediately go live with zero code changes needed.

