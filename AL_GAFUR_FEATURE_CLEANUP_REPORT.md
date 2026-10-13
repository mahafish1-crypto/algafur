# Al-Gafur Hajj & Umrah — Feature Cleanup & YouTube Leads Restoration Report

**Date:** October 13, 2026  
**Repository:** `mahafish1-crypto/algafur`  
**Production URLs:**  
- Primary Custom Domain: [https://www.algafur.com](https://www.algafur.com)  
- Vercel Production Mirror: [https://algafur.vercel.app](https://algafur.vercel.app)

---

## 1. Executive Summary

This report documents the successful cleanup of user interface workflows, restoration of the **YouTube Leads** module in the Admin Panel, and hardening of the customer enquiry model.

The system now delivers:
1. **Clean English Public Interface**: The multi-language switcher, dropdowns, and RTL transitions were removed across desktop and mobile navigation. The site is permanently locked to English (`ltr`), keeping the UI fast, focused, and free of clutter.
2. **Restored YouTube Leads Admin Module**: Connected the YouTube Leads suite to the Admin sidebar with 4 subpages (**Overview**, **Lead Form Builder**, **Lead Responses**, **Form Settings**). Fixed role-based access control (RBAC) so `SUPER_ADMIN`, `ADMIN`, and sales/marketing users with `leads:view` or `youtube_leads:view` have full access.
3. **Pure Lead/Enquiry Customer Journey**: Removed public payment buttons and gateways. The customer journey is strictly:
   $$\text{Package Selection} \longrightarrow \text{Book Now} \longrightarrow \text{Enquiry Form} \longrightarrow \text{Advisor Consultation} \longrightarrow \text{Manual Confirmation}$$
4. **KYC & Passport Data Privacy**: Removed customer-facing passport inputs and KYC upload requirements from public forms, tracking, and dashboard. Internal staff can still securely manage passport records when needed.
5. **100% Historical Data Preservation**: Zero tables or rows were deleted. All historical packages (3), bookings (4), payments (5), leads (5), users (6), and audit logs are intact in the PostgreSQL database.

---

## 2. Detailed Changes

### 2.1 Language-Changing Feature Removal
- **`src/context/LanguageContext.tsx`**:
  - Removed state hooks and language toggle mechanics.
  - Locked `language` and `lang` to `"en"`.
  - Enforced `document.documentElement.dir = "ltr"` and `document.documentElement.lang = "en"`.
  - Cleared legacy `algafur_lang` from `localStorage`.
  - Maintained backward-compatible `t()` and `formatPrice()` helpers to prevent breaks in legacy components.
- **`src/components/layout/Navbar.tsx`**:
  - Removed desktop language dropdown menu, globe icon, and chevron toggle.
  - Removed mobile language switcher pills.
  - Eliminated unused imports (`Globe`, `ChevronDown`, `Check`).

### 2.2 YouTube Leads Admin Restoration & RBAC Hardening
- **`src/app/admin/AdminLayoutClient.tsx`**:
  - Added dedicated **YouTube Leads** section with YouTube icon in both desktop sidebar and mobile navigation drawer:
    - **Overview**: `/admin/youtube-leads`
    - **Lead Form Builder**: `/admin/youtube-leads/forms`
    - **Lead Responses**: `/admin/youtube-leads/responses`
    - **Form Settings**: `/admin/youtube-leads/settings`
  - Fixed route matching in `isRouteAllowed` and permission checks:
    ```typescript
    const canViewYouTubeLeads =
      session.role === "SUPER_ADMIN" ||
      session.role === "ADMIN" ||
      hasUserPermission(session, "youtube_leads:view") ||
      hasUserPermission(session, "leads:view");
    ```
- **`src/lib/rbac.ts`**:
  - Added cross-module inheritance so `leads` permissions automatically grant access to `youtube_leads`.
  - Defensive array parsing in `checkPermissionInList` and role checks in `hasUserPermission`.
- **`src/lib/rbac-server.tsx`**:
  - Server-side guard `verifyModuleAccess("youtube_leads")` configured to allow `SUPER_ADMIN`, `ADMIN`, or users with `leads:view` / `youtube_leads:view`.
- **Subpage Server Protection**:
  - Guarded all 4 subpages with `verifyModuleAccess("youtube_leads")` and `<AccessDeniedView />`:
    - `src/app/admin/youtube-leads/page.tsx`
    - `src/app/admin/youtube-leads/forms/page.tsx`
    - `src/app/admin/youtube-leads/responses/page.tsx`
    - `src/app/admin/youtube-leads/responses/[id]/page.tsx`
    - `src/app/admin/youtube-leads/settings/page.tsx`

### 2.3 Customer-Facing Payment & KYC Removal
- **Customer Journey Stepper**:
  - Updated `src/app/customer/dashboard/CustomerDashboardClient.tsx`:
    - Replaced the 8-stage payment/KYC flow with a clean 6-stage enquiry stepper:
      1. Enquiry Submitted
      2. Advisor Review
      3. Booking Confirmed
      4. Flight Allocated
      5. Hotel Allocated
      6. Ready to Travel
    - Replaced customer visa document upload prompt with a dedicated pilgrimage advisor support card.
- **`src/app/(public)/track-booking/page.tsx`**:
  - Removed "Payment Verified" and "Visa Issued" stages.
  - Replaced payment status badge with booking enquiry status badge.
  - Removed customer passport upload advisory.
- **`src/app/(public)/signup/page.tsx`**:
  - Updated account benefit bullet points to focus on Enquiry Tracking & Tour Vouchers rather than Visa tracking and payment receipts.
- **Admin Navigation Cleanup**:
  - Removed `Document KYC` (`/admin/documents`) and `Visa Processing` (`/admin/visa`) from active navigation items in `src/app/admin/AdminLayoutClient.tsx`.
  - All internal accounting, invoice, quotations, and financial ledger screens remain fully accessible to staff.

---

## 3. Database Safety & Integrity Verification

A non-destructive read-only verification was executed against the production Supabase database:

| Entity | Record Count | Status |
| :--- | :---: | :--- |
| **Users** | 6 | All active staff and admin accounts preserved |
| **Packages** | 3 | All published packages preserved |
| **Bookings** | 4 | All historical bookings preserved |
| **Payments** | 5 | All historical ledger & transaction records preserved |
| **Website Leads** | 5 | All CRM enquiry leads preserved |
| **Lead Forms** | 1 | Default YouTube Lead Form verified and active |

---

## 4. Test & Verification Suite Results

Automated verification script `scripts/verify-feature-cleanup.ts` executed with **26 passed assertions and 0 failures**:

1. [PASS] Navbar does not contain `langDropdownOpen` state
2. [PASS] Navbar does not contain `LANGUAGES` list
3. [PASS] Navbar does not contain `changeLanguage` calls
4. [PASS] LanguageContext is locked to English (`en`)
5. [PASS] LanguageContext is locked to LTR (`document.documentElement.dir = "ltr"`)
6. [PASS] AdminLayoutClient has YouTube Leads overview link (`/admin/youtube-leads`)
7. [PASS] AdminLayoutClient has YouTube Leads forms link (`/admin/youtube-leads/forms`)
8. [PASS] AdminLayoutClient has YouTube Leads responses link (`/admin/youtube-leads/responses`)
9. [PASS] AdminLayoutClient has YouTube Leads settings link (`/admin/youtube-leads/settings`)
10. [PASS] AdminLayoutClient does not have KYC Documents in active sidebar
11. [PASS] AdminLayoutClient does not have Visa Processing in active sidebar
12. [PASS] SUPER_ADMIN has `youtube_leads:view` permission
13. [PASS] ADMIN has `youtube_leads:view` permission
14. [PASS] SALES_EXECUTIVE has `youtube_leads:view` permission
15. [PASS] CUSTOMER does NOT have `youtube_leads:view` permission
16. [PASS] Customer dashboard does not display Payment Verified step
17. [PASS] Customer dashboard does not prompt customer to upload passport
18. [PASS] Customer dashboard displays Enquiry Submitted step
19. [PASS] Track booking page does not display Payment Verified
20. [PASS] Track booking page does not display Visa Issued stage
21. [PASS] Database Users table query succeeded
22. [PASS] Database Packages exist in production database
23. [PASS] Historical Bookings table intact
24. [PASS] Historical Payments table intact
25. [PASS] Leads table intact
26. [PASS] YouTube Lead forms exist

---

## 5. Deployment Instructions

1. **Commit and Push to GitHub**:
   - Branch: `main`
   - Remote: `https://github.com/mahafish1-crypto/algafur`
2. **Automatic Vercel Build**:
   - Vercel automatically deploys commits pushed to `main`.
   - The deployment serves both `www.algafur.com` and `algafur.vercel.app`.

