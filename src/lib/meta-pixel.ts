/**
 * AL GAFUR Meta Pixel Security & Allowlist Architecture
 * 
 * Secure parser, allowlist validator, and route exclusion rules for dynamic Meta Pixel tracking.
 * Strictly prevents XSS, arbitrary script injection, unauthorized external CDNs, and data leakage.
 */

export interface MetaPixelValidationResult {
  isValid: boolean;
  pixelId: string | null;
  error: string | null;
  detectionType?: "SNIPPET" | "RAW_ID" | "NOSCRIPT";
  cleanSnippet?: string;
}

/**
 * Route prefixes and sensitive endpoints where tracking scripts MUST NEVER be loaded.
 * Protects admin backends, agent tools, customer private dashboards, authentication, and booking tracking.
 */
export const EXCLUDED_PIXEL_ROUTES = [
  "/admin",
  "/agent",
  "/customer",
  "/login",
  "/signup",
  "/track-booking",
  "/api",
] as const;

/**
 * Checks whether a given pathname is strictly excluded from tracking.
 */
export function isRouteExcludedFromPixel(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const normalized = pathname.trim().toLowerCase();

  return EXCLUDED_PIXEL_ROUTES.some((prefix) => {
    return normalized === prefix || normalized.startsWith(`${prefix}/`);
  });
}

/**
 * Disallowed tokens and malicious injection patterns.
 * Meta Pixel installation snippets only require standard fbq bootstrap and fbevents.js from connect.facebook.net.
 */
const MALICIOUS_PATTERNS: Array<{ regex: RegExp; reason: string }> = [
  {
    regex: /<iframe[\s>]/i,
    reason: "Embedded iframes (<iframe) are strictly prohibited for security.",
  },
  {
    regex: /<object[\s>]/i,
    reason: "Embedded objects (<object) are strictly prohibited.",
  },
  {
    regex: /<embed[\s>]/i,
    reason: "Embedded plugins (<embed) are strictly prohibited.",
  },
  {
    regex: /<svg[\s>]/i,
    reason: "Inline SVG tags (<svg) are not permitted in tracking snippets.",
  },
  {
    regex: /<link[\s>]/i,
    reason: "External stylesheet or prefetch links (<link) are prohibited.",
  },
  {
    regex: /<form[\s>]/i,
    reason: "Form elements are strictly prohibited inside tracking snippets.",
  },
  {
    regex: /javascript:/i,
    reason: "JavaScript URI schemes (javascript:) are prohibited.",
  },
  {
    regex: /data:(?!image\/(?:png|gif|jpeg|svg\+xml))/i,
    reason: "Arbitrary data URI schemes are prohibited.",
  },
  {
    regex: /\bdocument\.cookie\b/i,
    reason: "Accessing browser cookies (document.cookie) is prohibited.",
  },
  {
    regex: /\b(?:localStorage|sessionStorage|indexedDB)\b/i,
    reason: "Direct web storage manipulation is prohibited.",
  },
  {
    regex: /\b(?:eval\s*\(|new\s+Function\s*\(|window\[['"]eval['"]\])/i,
    reason: "Dynamic code evaluation (eval / Function constructor) is strictly prohibited.",
  },
  {
    regex: /\bwindow\.location\s*=/i,
    reason: "Redirecting the user or modifying window.location is prohibited.",
  },
  {
    regex: /\b(?:fetch|XMLHttpRequest|navigator\.sendBeacon)\s*\(/i,
    reason: "Custom network requests outside official Meta fbq calls are prohibited.",
  },
  {
    regex: /\bWebSocket\b/i,
    reason: "WebSocket connections are prohibited in tracking snippets.",
  },
];

/**
 * Validates external script sources: only connect.facebook.net is allowed.
 */
function hasUnauthorizedExternalScript(snippet: string): { unauthorized: boolean; src?: string } {
  const scriptSrcRegex = /<script[^>]*src\s*=\s*['"]([^'"]+)['"][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptSrcRegex.exec(snippet)) !== null) {
    const src = match[1]?.trim() || "";
    // Allow official Meta Pixel bootstrap script
    const isMetaDomain =
      src.startsWith("https://connect.facebook.net/") ||
      src.startsWith("//connect.facebook.net/") ||
      src.startsWith("http://connect.facebook.net/");

    if (!isMetaDomain) {
      return { unauthorized: true, src };
    }
  }

  return { unauthorized: false };
}

/**
 * Validates external img sources in noscript tags: only facebook.com/tr is allowed.
 */
function hasUnauthorizedImgTag(snippet: string): { unauthorized: boolean; src?: string } {
  const imgSrcRegex = /<img[^>]*src\s*=\s*['"]([^'"]+)['"][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = imgSrcRegex.exec(snippet)) !== null) {
    const src = match[1]?.trim() || "";
    const isMetaTr =
      src.includes("facebook.com/tr") ||
      src.includes("connect.facebook.net");

    if (!isMetaTr) {
      return { unauthorized: true, src };
    }
  }

  return { unauthorized: false };
}

/**
 * Generates official clean Meta Pixel snippet template for a validated numeric Pixel ID.
 */
export function getMetaPixelSnippetTemplate(pixelId: string): string {
  const cleanId = pixelId.replace(/\D/g, "");
  return `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${cleanId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${cleanId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;
}

/**
 * Validates the raw input from the admin and extracts the numeric Meta Pixel ID.
 * Supports:
 *  1. Full official Meta Pixel installation snippet (including fbq init and noscript)
 *  2. Inline script tag variant
 *  3. Noscript-only tracking pixel tag
 *  4. Raw numeric Pixel ID (10 to 20 digits)
 * 
 * Rejects:
 *  - Malicious injections, iframes, cookies, unauthorized domains, arbitrary JS.
 */
export function validateAndExtractMetaPixel(rawInput: string | null | undefined): MetaPixelValidationResult {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      isValid: false,
      pixelId: null,
      error: "Meta Pixel code is empty. Please paste your Meta Pixel installation snippet.",
    };
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      isValid: false,
      pixelId: null,
      error: "Meta Pixel code is empty. Please paste your Meta Pixel installation snippet.",
    };
  }

  // 1. Direct Numeric Pixel ID Check (e.g. 123456789012345)
  if (/^\d{10,20}$/.test(trimmed)) {
    return {
      isValid: true,
      pixelId: trimmed,
      error: null,
      detectionType: "RAW_ID",
      cleanSnippet: getMetaPixelSnippetTemplate(trimmed),
    };
  }

  // 2. Security Allowlist Inspection: check for prohibited patterns
  for (const { regex, reason } of MALICIOUS_PATTERNS) {
    if (regex.test(trimmed)) {
      return {
        isValid: false,
        pixelId: null,
        error: `Security Verification Failed: ${reason}`,
      };
    }
  }

  // 3. Check for external scripts from unapproved domains
  const extScriptCheck = hasUnauthorizedExternalScript(trimmed);
  if (extScriptCheck.unauthorized) {
    return {
      isValid: false,
      pixelId: null,
      error: `Security Verification Failed: Unauthorized script source "${extScriptCheck.src}". Only official "connect.facebook.net" is permitted.`,
    };
  }

  // 4. Check for unauthorized img sources
  const extImgCheck = hasUnauthorizedImgTag(trimmed);
  if (extImgCheck.unauthorized) {
    return {
      isValid: false,
      pixelId: null,
      error: `Security Verification Failed: Unauthorized image tracking source "${extImgCheck.src}". Only official "facebook.com/tr" is permitted.`,
    };
  }

  // 5. Extract Numeric Meta Pixel ID
  // Strategy A: fbq('init', '123456789012345') or fbq("init", "123456789012345") or fbq('init', 123456789012345)
  const fbqInitRegex = /fbq\s*\(\s*['"]init['"]\s*,\s*['"]?(\d{10,20})['"]?\s*(?:,\s*\{[^}]*\})?\s*\)/i;
  const initMatch = fbqInitRegex.exec(trimmed);

  if (initMatch && initMatch[1]) {
    const pixelId = initMatch[1];
    return {
      isValid: true,
      pixelId,
      error: null,
      detectionType: "SNIPPET",
      cleanSnippet: getMetaPixelSnippetTemplate(pixelId),
    };
  }

  // Strategy B: noscript img tag: tr?id=123456789012345
  const noscriptRegex = /[?&]id=(\d{10,20})(?:&|['"]|\s|$)/i;
  const noscriptMatch = noscriptRegex.exec(trimmed);

  if (noscriptMatch && noscriptMatch[1]) {
    const pixelId = noscriptMatch[1];
    return {
      isValid: true,
      pixelId,
      error: null,
      detectionType: "NOSCRIPT",
      cleanSnippet: getMetaPixelSnippetTemplate(pixelId),
    };
  }

  // Strategy C: Contextual Meta check: if snippet references fbevents or facebook.com and contains a 14-17 digit number
  const isMetaContext =
    trimmed.includes("fbevents.js") ||
    trimmed.includes("connect.facebook.net") ||
    trimmed.includes("facebook.com/tr") ||
    trimmed.includes("fbq");

  if (isMetaContext) {
    const genericIdMatch = /\b(\d{14,17})\b/.exec(trimmed);
    if (genericIdMatch && genericIdMatch[1]) {
      const pixelId = genericIdMatch[1];
      return {
        isValid: true,
        pixelId,
        error: null,
        detectionType: "SNIPPET",
        cleanSnippet: getMetaPixelSnippetTemplate(pixelId),
      };
    }
  }

  // If no valid Meta Pixel structure or ID was found
  return {
    isValid: false,
    pixelId: null,
    error: "No valid Meta Pixel ID (10 to 20 digits) found. Please ensure you paste the complete standard Meta Pixel installation snippet containing fbq('init', '<ID>') or your numeric Pixel ID.",
  };
}
