# AL-GAFUR — Dynamic Meta Pixel Code Integration & Security Report

**System:** AL-GAFUR Hajj & Umrah Tours & Travels  
**Target Environments:** `https://www.algafur.com` & `https://algafur.vercel.app`  
**Module:** Admin Panel → Site Settings → Tracking & Pixel Settings  
**Date:** October 14, 2026  
**Status:** **COMPLETE, VERIFIED & PASSING (48/48 TESTS)**

---

## 1. Executive Summary

We have engineered an enterprise-grade, secure, dynamic **Meta Pixel Integration** inside the Al-Gafur Hajj & Umrah production architecture. 

Super Admins can now manage Meta Pixel tracking directly from **Admin Panel → Site Settings → "Tracking & Pixel Settings"**. The administrator can paste the complete official snippet from Meta Events Manager (or simply a numeric Pixel ID), toggle tracking **ON** or **OFF**, view real-time verification and allowlist status, inspect the extracted numeric ID, see the exact last-updated timestamp, and save configuration. 

Changes take effect **immediately across the public website without editing source code, restarting servers, or triggering a new Vercel deployment**.

---

## 2. Core Security & Allowlist Architecture

### The Zero-XSS Guarantee
Past tracking code systems often used unsafe raw HTML injection (`dangerouslySetInnerHTML`), creating catastrophic cross-site scripting (XSS) risks. 

Our implementation follows a strict **Secure Allowlist Parser & Controlled Component Architecture**:

```
[ Super Admin Pastes Meta Code ]
                 │
                 ▼
[ Allowlist Security Validator (src/lib/meta-pixel.ts) ]
  ├── 1. Prohibits: <iframe>, <object>, <embed>, <svg>, <form>, <link>
  ├── 2. Prohibits: document.cookie, localStorage, sessionStorage, indexedDB
  ├── 3. Prohibits: eval(), new Function(), window['eval']
  ├── 4. Prohibits: fetch(), XMLHttpRequest, sendBeacon, WebSockets
  ├── 5. Checks External CDNs: ONLY connect.facebook.net permitted
  ├── 6. Checks Noscript Img: ONLY facebook.com/tr permitted
  └── 7. Extracts: Pure Numeric Pixel ID (e.g. 15-digit ID)
                 │
                 ▼
[ Database Persistence (SiteSetting Key-Value Store) ]
  ├── Stores: meta_pixel_code, meta_pixel_id, meta_pixel_enabled, meta_pixel_updated_at
  └── Tags: Invalidate 'site-settings' Next.js cache tag
                 │
                 ▼
[ Controlled Official Script Loader (MetaPixelTracker.tsx) ]
  ├── Programmatic window.fbq bootstrap (NO dangerouslySetInnerHTML)
  ├── Loads official https://connect.facebook.net/en_US/fbevents.js
  ├── Mounts <noscript> <img src="https://www.facebook.com/tr?id={pixelId}&ev=PageView&noscript=1" />
  └── Injects ONLY the validated numeric Pixel ID: fbq('init', cleanPixelId)
```

**Key Security Features:**
1. **Never Renders Raw User Code:** Even if an administrator attempts to paste arbitrary JavaScript or malicious payloads, the loader **never** evaluates or renders raw strings. Only the verified numeric `pixelId` is ever fed into the official script loader.
2. **Dual-Layer Validation:** Code validation runs instantaneously in the browser as the administrator types, and is enforced again on the server (`POST /api/settings`) before any database transaction.
3. **RBAC Guarded:** Settings API is restricted to authenticated `SUPER_ADMIN` and `ADMIN` roles with audit logging via `logAudit`.

---

## 3. Admin Panel UI ("Tracking & Pixel Settings")

A new dedicated tab has been added to `Admin Panel → Site Settings` (`/admin/settings`):

| UI Control | Description |
| :--- | :--- |
| **Section Header** | "Tracking & Pixel Settings" with live status badge (`Meta Pixel Active` / `Enabled (Needs Valid Snippet)` / `Meta Pixel Inactive`). |
| **Security Warning** | Prominently displays: *"Only paste tracking code from a trusted provider. Scripts are security-sensitive."* |
| **Enable Meta Pixel** | Modern emerald ON/OFF toggle switch. |
| **Meta Pixel Code Editor** | Monospace dark-mode code area with syntax styling, line numbers feel, and placeholder showing official Meta syntax. Supports full snippets, noscript tags, or raw numeric IDs. |
| **Real-time Verification Card** | Analyzes code in real time: displays green `Verified & Allowlist Passed` badge or red `Verification Failed` with descriptive error details. |
| **Validated Pixel ID Chip** | Displays the extracted numeric identifier (e.g., `987654321098765`) and detection type (`Standard Meta Snippet` / `Noscript Pixel Tag` / `Raw Numeric ID`). |
| **Test Pixel Code Button** | Triggers instantaneous allowlist verification and UI feedback. |
| **Last Updated Timestamp** | Formatted local timestamp (`October 14, 2026, 01:52 PM IST`) tracking when pixel settings were last changed. |
| **Save Tracking Settings** | Saves settings with live loading state and success confirmation toast. |

---

## 4. Central Tracker Component (`MetaPixelTracker.tsx`)

Mounted globally in `src/app/layout.tsx` within `<Suspense fallback={null}>`:

### Next.js App Router Route Deduplication
When visitors navigate between client-side routes (e.g. from `/` to `/packages` to `/packages/umrah-platinum-package-2026`), `MetaPixelTracker` detects route changes via `usePathname()` and `useSearchParams()`.
- An in-memory ref (`lastTrackedUrlRef`) tracks the current URL string (`pathname + searchParams`).
- Duplicate `PageView` triggers on shallow re-renders or identical URLs are completely deduplicated.
- Standard `PageView` fires accurately on initial load and on every genuine route transition.

### Sensitive Route Exclusions
Tracking scripts, cookies, and network requests are **strictly excluded** from sensitive sections of the application:

```typescript
export const EXCLUDED_PIXEL_ROUTES = [
  "/admin",
  "/agent",
  "/customer",
  "/login",
  "/signup",
  "/track-booking",
  "/api",
];
```

Whenever a user is on an excluded route, `MetaPixelTracker` renders `null` and dispatches zero tracking calls.

---

## 5. Standard Event Specifications & PII Safeguards

Standard Meta events are dispatched via `@/lib/meta-pixel-events.ts`:

### 1. `PageView`
- **Trigger:** Automatic on all non-sensitive public pages upon route entry.
- **Payload:** None (standard Meta URL/referrer).
- **Deduplication:** Enforced via `lastTrackedUrlRef`.

### 2. `ViewContent` (Package Details)
- **Trigger:** When a visitor views any package detail page (`/packages/[slug]`).
- **Payload:**
  ```javascript
  fbq('track', 'ViewContent', {
    content_name: pkg.name,
    content_ids: [pkg.id || pkg.slug],
    content_type: 'product',
    content_category: 'Hajj & Umrah Pilgrimage Packages',
    value: pkg.priceQuad || pkg.startingPrice || 0,
    currency: 'INR'
  });
  ```

### 3. `Lead` (Confirmed Enquiries & YouTube Leads)
- **Trigger:** Fired **ONLY AFTER** confirmed HTTP 200 server-side lead persistence:
  - Homepage Callback Form (`LeadEnquiryForm.tsx`)
  - Contact Page Enquiry (`contact/page.tsx`)
  - Public YouTube Campaign Lead Form (`PublicLeadFormClient.tsx`)
  - Booking Enquiry Flow (`BookingFlowClient.tsx`)
- **Strict Privacy Guardrail (Zero PII):**
  - **NEVER** transmits pilgrim names, phone numbers, email addresses, passport numbers, Aadhaar IDs, visa documents, payment details, or GPS coordinates.
- **Safe Payload:**
  ```javascript
  fbq('track', 'Lead', {
    content_name: packageName || formTitle || 'Sacred Journey Lead',
    content_category: 'Hajj & Umrah Pilgrimage',
    lead_type: 'website_enquiry' | 'youtube_lead' | 'booking_enquiry',
    campaign_name: campaignName,
    status: 'confirmed_server_submission'
  });
  ```

---

## 6. Database Persistence & Zero-Redeployment Dynamic Activation

Settings are persisted in the existing Supabase PostgreSQL `SiteSetting` model:
- `meta_pixel_code`: Full pasted snippet or identifier.
- `meta_pixel_id`: Extracted numeric Pixel ID.
- `meta_pixel_enabled`: `"true"` or `"false"`.
- `meta_pixel_updated_at`: ISO timestamp string.

### Instant Cache Invalidation
When settings are saved via `POST /api/settings`:
1. Prisma upserts all keys in a single atomic transaction.
2. `revalidateTag('site-settings')` purges the Next.js `unstable_cache`.
3. `revalidatePath('/', 'layout')` updates all static and dynamic routes.
4. Visitors on both `www.algafur.com` and `algafur.vercel.app` immediately receive the updated Meta Pixel on their next page load without requiring code redeployment.

---

## 7. Verification & Automated Test Suite Results

An automated test suite (`scripts/verify-meta-pixel.ts`) was executed with the following results:

```
=======================================================
 AL-GAFUR META PIXEL INTEGRATION & SECURITY TEST SUITE 
=======================================================

[Suite 1] Valid Meta Pixel Snippet Extraction
  ✓ PASS: Standard Meta Pixel snippet parsed as valid
  ✓ PASS: Extracted numeric Pixel ID matches exactly (987654321098765)
  ✓ PASS: Detection type identified as SNIPPET
  ✓ PASS: Double quoted fbq('init', ...) parsed as valid
  ✓ PASS: Extracted numeric Pixel ID matches double quoted value
  ✓ PASS: Pure numeric Pixel ID parsed as valid
  ✓ PASS: Extracted pure numeric Pixel ID correctly
  ✓ PASS: Detection type identified as RAW_ID
  ✓ PASS: Noscript-only tag parsed as valid
  ✓ PASS: Extracted numeric Pixel ID from noscript img tag
  ✓ PASS: Detection type identified as NOSCRIPT

[Suite 2] Security Allowlist & Injection Rejection
  ✓ PASS: Rejected snippet containing embedded iframe tag
  ✓ PASS: Error mentions prohibited iframe
  ✓ PASS: Rejected unauthorized third-party external script src
  ✓ PASS: Error cites the unauthorized script domain
  ✓ PASS: Rejected snippet attempting document.cookie access
  ✓ PASS: Rejected snippet attempting eval() dynamic execution
  ✓ PASS: Rejected snippet attempting custom fetch() network request
  ✓ PASS: Rejected empty / whitespace snippet gracefully

[Suite 3] Sensitive Route Exclusion Enforcement
  ✓ PASS: Route correctly excluded: /admin
  ✓ PASS: Route correctly excluded: /admin/settings
  ✓ PASS: Route correctly excluded: /admin/crm/leads
  ✓ PASS: Route correctly excluded: /admin/youtube-leads
  ✓ PASS: Route correctly excluded: /agent
  ✓ PASS: Route correctly excluded: /agent/dashboard
  ✓ PASS: Route correctly excluded: /customer
  ✓ PASS: Route correctly excluded: /customer/dashboard
  ✓ PASS: Route correctly excluded: /customer/bookings
  ✓ PASS: Route correctly excluded: /login
  ✓ PASS: Route correctly excluded: /signup
  ✓ PASS: Route correctly excluded: /track-booking
  ✓ PASS: Route correctly excluded: /api/settings
  ✓ PASS: Route correctly excluded: /api/leads
  ✓ PASS: Public route allowed for tracking: /
  ✓ PASS: Public route allowed for tracking: /about
  ✓ PASS: Public route allowed for tracking: /packages
  ✓ PASS: Public route allowed for tracking: /packages/umrah-platinum-package-2026
  ✓ PASS: Public route allowed for tracking: /ramadan-umrah
  ✓ PASS: Public route allowed for tracking: /hajj
  ✓ PASS: Public route allowed for tracking: /umrah
  ✓ PASS: Public route allowed for tracking: /contact
  ✓ PASS: Public route allowed for tracking: /faq
  ✓ PASS: Public route allowed for tracking: /lead/youtube-lead
  ✓ PASS: Public route allowed for tracking: /lead/umrah-direct-inquiry
  ✓ PASS: Public route allowed for tracking: /booking

[Suite 4] Safe Clean Template Generation
  ✓ PASS: Clean template contains sanitized fbq('init', ...)
  ✓ PASS: Clean template connects to official Meta endpoint
  ✓ PASS: Noscript tag contains sanitized pixel id

=======================================================
 TEST SUMMARY: Total: 48 | Passed: 48 | Failed: 0
=======================================================
✔ All Meta Pixel security, allowlist, and route exclusion tests PASSED!
```

---

## 8. Modified & Created Files Summary

| File Path | Purpose |
| :--- | :--- |
| `src/lib/meta-pixel.ts` | **NEW:** Security allowlist parser, regex extractor, route exclusion rules, and clean template generator. |
| `src/lib/meta-pixel-events.ts` | **NEW:** Client-side event dispatchers (`trackMetaPageView`, `trackMetaViewContent`, `trackMetaLead`) with strict PII removal. |
| `src/components/analytics/MetaPixelTracker.tsx` | **NEW:** Global client tracker component with programmatic script loading, noscript fallback, route deduplication, and exclusion filters. |
| `src/lib/settings.ts` | Added `meta_pixel_code`, `meta_pixel_id`, `meta_pixel_enabled`, and `meta_pixel_updated_at` to `DEFAULT_SITE_SETTINGS`. |
| `src/app/layout.tsx` | Mounted `MetaPixelTracker` in the root layout with settings injection. |
| `src/app/api/settings/route.ts` | Added server-side validation, numeric ID extraction, category classification, timestamp generation, and cache purging. |
| `src/app/admin/settings/AdminSettingsClient.tsx` | Added "Tracking & Pixel Settings" tab, security alert, code editor, toggle, live verification card, and test button. |
| `src/app/(public)/packages/[slug]/PackageDetailClient.tsx` | Connected standard `ViewContent` event on package catalog view. |
| `src/components/home/LeadEnquiryForm.tsx` | Connected standard `Lead` event upon confirmed server lead creation. |
| `src/components/lead/PublicLeadFormClient.tsx` | Connected standard `Lead` event upon confirmed YouTube lead creation. |
| `src/app/(public)/booking/BookingFlowClient.tsx` | Connected standard `Lead` event upon confirmed booking lead creation. |
| `scripts/verify-meta-pixel.ts` | **NEW:** Automated verification and security test suite. |

---

## 9. Non-Negotiable Constraint Compliance

- **Zero Database Resets / Drops:** Existing database tables, users, leads, packages, and bookings were untouched.
- **Zero DNS / Domain Changes:** Configuration intact for `https://www.algafur.com` and `https://algafur.vercel.app`.
- **Zero Premature Push / Deploy:** No Git push or production deployment was triggered, awaiting explicit instruction.

