/**
 * Application Security Hardening Utilities
 * AL GAFUR INTERNATIONAL TOURS AND TRAVELS
 *
 * Implements:
 * 1. Safe string and object sanitization against XSS (stored & reflected)
 * 2. Sliding-window in-memory IP rate limiter with automated memory cleanup
 * 3. Bot trap / Honeypot detection
 */

const HONEYPOT_DEFAULT_FIELDS = [
  "website_url",
  "honeypot",
  "hp_field",
  "hp_check",
  "company_fax",
  "work_phone_ext",
];

// In-memory rate limiting store: key -> array of timestamp (ms)
const rateLimitStore = new Map<string, number[]>();

// Maximum stored keys before forced cleanup to prevent memory leaks in serverless / long-running Node
const MAX_STORE_SIZE = 10000;

/**
 * Strips HTML tags, script elements, control characters, and limits string length.
 * Prevents stored XSS and injection attacks.
 */
export function sanitizeString(raw: unknown, maxLength = 1000): string {
  if (raw === null || raw === undefined) return "";
  let val = String(raw);

  // Strip ASCII control characters and null bytes except common whitespace
  val = val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

  // Strip script, iframe, object, embed, style tags and dangerous pseudo-protocols
  val = val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:text\/html/gi, "");

  // Strip all general HTML tags
  val = val.replace(/<[^>]*>/g, "");

  // Collapse multiple whitespaces and trim
  val = val.replace(/[ \t]+/g, " ").trim();

  return val.slice(0, maxLength);
}

/**
 * HTML entities escape helper for rendering text safely in HTML contexts
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Recursively sanitizes all string values within an object or array.
 */
export function sanitizeObject<T>(input: T, maxLength = 1000): T {
  if (!input || typeof input !== "object") {
    if (typeof input === "string") {
      return sanitizeString(input, maxLength) as unknown as T;
    }
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item, maxLength)) as unknown as T;
  }

  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(input)) {
    if (typeof val === "string") {
      result[key] = sanitizeString(val, maxLength);
    } else if (typeof val === "object" && val !== null) {
      result[key] = sanitizeObject(val, maxLength);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

/**
 * Detects whether any honeypot trap field contains data (indicating automated bot spam).
 */
export function isHoneypotTriggered(
  body: Record<string, any>,
  customFields?: string[]
): boolean {
  if (!body || typeof body !== "object") return false;
  const fields = customFields || HONEYPOT_DEFAULT_FIELDS;
  for (const field of fields) {
    const val = body[field];
    if (typeof val === "string" && val.trim().length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * In-memory sliding-window rate limiter per identifier (e.g. IP address or user ID).
 * Automatically purges expired timestamps.
 *
 * @param key Identifier (e.g., `lead_${clientIp}`)
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();

  // Garbage collection if map grows too large
  if (rateLimitStore.size > MAX_STORE_SIZE) {
    for (const [storedKey, timestamps] of rateLimitStore.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        rateLimitStore.delete(storedKey);
      } else {
        rateLimitStore.set(storedKey, valid);
      }
    }
  }

  const existing = rateLimitStore.get(key) || [];
  const validTimestamps = existing.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    const oldestTimestamp = validTimestamps[0];
    const resetMs = Math.max(0, oldestTimestamp + windowMs - now);
    rateLimitStore.set(key, validTimestamps);
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  validTimestamps.push(now);
  rateLimitStore.set(key, validTimestamps);

  return {
    allowed: true,
    remaining: maxRequests - validTimestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Extracts client IP address safely from standard proxy headers.
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "unknown-ip";
}

