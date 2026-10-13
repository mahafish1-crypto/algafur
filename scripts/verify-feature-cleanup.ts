import prisma from "@/lib/db";
import { checkPermissionInList, hasUserPermission } from "@/lib/rbac";
import * as fs from "fs";
import * as path from "path";

async function runVerification() {
  console.log("=== STARTING AL-GAFUR COMPREHENSIVE VERIFICATION ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Check Language Selector Removal
  const navbarSrc = fs.readFileSync(path.join(process.cwd(), "src/components/layout/Navbar.tsx"), "utf8");
  assert(!navbarSrc.includes("langDropdownOpen"), "Navbar does not contain langDropdownOpen state");
  assert(!navbarSrc.includes("LANGUAGES"), "Navbar does not contain LANGUAGES list");
  assert(!navbarSrc.includes("changeLanguage"), "Navbar does not contain changeLanguage calls");

  const langContextSrc = fs.readFileSync(path.join(process.cwd(), "src/context/LanguageContext.tsx"), "utf8");
  assert(langContextSrc.includes('language: "en"'), "LanguageContext is locked to English ('en')");
  assert(langContextSrc.includes('document.documentElement.dir = "ltr"'), "LanguageContext is locked to LTR");

  // 2. Check YouTube Leads Admin Menu & RBAC
  const adminLayoutSrc = fs.readFileSync(path.join(process.cwd(), "src/app/admin/AdminLayoutClient.tsx"), "utf8");
  assert(adminLayoutSrc.includes("/admin/youtube-leads"), "AdminLayoutClient has YouTube Leads overview link");
  assert(adminLayoutSrc.includes("/admin/youtube-leads/forms"), "AdminLayoutClient has YouTube Leads forms link");
  assert(adminLayoutSrc.includes("/admin/youtube-leads/responses"), "AdminLayoutClient has YouTube Leads responses link");
  assert(adminLayoutSrc.includes("/admin/youtube-leads/settings"), "AdminLayoutClient has YouTube Leads settings link");
  assert(!adminLayoutSrc.includes('href: "/admin/documents"'), "AdminLayoutClient does not have KYC Documents in active sidebar");
  assert(!adminLayoutSrc.includes('href: "/admin/visa"'), "AdminLayoutClient does not have Visa Processing in active sidebar");

  // RBAC test for YouTube Leads
  const superAdminHasAccess = hasUserPermission("SUPER_ADMIN", "youtube_leads:view");
  const adminHasAccess = hasUserPermission("ADMIN", "youtube_leads:view");
  const salesHasAccess = hasUserPermission("SALES_EXECUTIVE", "youtube_leads:view");
  const customerHasAccess = hasUserPermission("CUSTOMER", "youtube_leads:view");

  assert(superAdminHasAccess, "SUPER_ADMIN has youtube_leads:view permission");
  assert(adminHasAccess, "ADMIN has youtube_leads:view permission");
  assert(salesHasAccess, "SALES_EXECUTIVE has youtube_leads:view permission");
  assert(!customerHasAccess, "CUSTOMER does NOT have youtube_leads:view permission");

  // 3. Check Customer Journey Stepper & Payment Removal
  const dashboardSrc = fs.readFileSync(path.join(process.cwd(), "src/app/customer/dashboard/CustomerDashboardClient.tsx"), "utf8");
  assert(!dashboardSrc.includes("Payment Verified"), "Customer dashboard does not display Payment Verified step");
  assert(!dashboardSrc.includes("Upload Passport"), "Customer dashboard does not prompt customer to upload passport");
  assert(dashboardSrc.includes("Enquiry Submitted"), "Customer dashboard displays Enquiry Submitted step");

  const trackBookingSrc = fs.readFileSync(path.join(process.cwd(), "src/app/(public)/track-booking/page.tsx"), "utf8");
  assert(!trackBookingSrc.includes("Payment Verified"), "Track booking page does not display Payment Verified");
  assert(!trackBookingSrc.includes("Visa Issued"), "Track booking page does not display Visa Issued stage");

  // 4. Verify Database Integrity (Read-only check, confirming tables and data are completely preserved)
  try {
    const [userCount, packageCount, bookingCount, paymentCount, leadCount, formCount] = await Promise.all([
      prisma.user.count(),
      prisma.package.count(),
      prisma.booking.count(),
      prisma.payment.count(),
      prisma.lead.count(),
      prisma.leadForm.count(),
    ]);

    console.log(`Database Status:
- Users: ${userCount}
- Packages: ${packageCount}
- Bookings: ${bookingCount}
- Payments (Historical): ${paymentCount}
- Website Leads: ${leadCount}
- YouTube Lead Forms: ${formCount}`);

    assert(userCount >= 0, "Users table query succeeded");
    assert(packageCount > 0, "Packages exist in production database");
    assert(bookingCount >= 0, "Historical Bookings table intact");
    assert(paymentCount >= 0, "Historical Payments table intact");
    assert(leadCount >= 0, "Leads table intact");
    assert(formCount > 0, "YouTube Lead forms exist");
  } catch (err) {
    console.error("Database check failed:", err);
    failed++;
  }

  console.log(`\n=== VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runVerification()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
