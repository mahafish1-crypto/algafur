"use client";

export const TRACKING_START_DATE = "October 10, 2026";

export type AnalyticsEventType =
  | "HOME_VIEW"
  | "PACKAGE_LIST_VIEW"
  | "PACKAGE_VIEW"
  | "PACKAGE_CARD_CLICK"
  | "WHATSAPP_CTA_CLICK"
  | "CALL_CTA_CLICK"
  | "INQUIRY_START"
  | "INQUIRY_SUBMIT"
  | "SIGNUP_START"
  | "SIGNUP_SUCCESS"
  | "BOOKING_START"
  | "BOOKING_SUCCESS";

export interface TrackEventPayload {
  eventType: AnalyticsEventType;
  packageId?: string;
  packageSlug?: string;
  packageName?: string;
  packageTitle?: string;
  category?: string;
  sourcePage?: string;
  language?: string;
  metadata?: Record<string, any>;
}

const SESSION_KEY_STORAGE = "algafur_anon_session";
const DEDUPE_STORAGE_PREFIX = "algafur_evt_";
const DEDUPE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function getOrCreateAnonymousSessionKey(): string {
  if (typeof window === "undefined") return "server";
  try {
    let key = sessionStorage.getItem(SESSION_KEY_STORAGE);
    if (!key) {
      const randomPart = Math.random().toString(36).substring(2, 10);
      const timePart = Date.now().toString(36);
      key = `anon_${timePart}_${randomPart}`;
      sessionStorage.setItem(SESSION_KEY_STORAGE, key);
    }
    return key;
  } catch {
    return "anon_fallback";
  }
}

export function trackAnalyticsEvent(payload: TrackEventPayload): void {
  if (typeof window === "undefined") return;

  try {
    const sessionKey = getOrCreateAnonymousSessionKey();
    const targetKey = payload.packageId || payload.packageSlug || payload.sourcePage || window.location.pathname;
    const dedupeKey = `${DEDUPE_STORAGE_PREFIX}${payload.eventType}_${targetKey}`;

    // Deduplicate view & start events within 30-minute session window
    const shouldDedupe = [
      "HOME_VIEW",
      "PACKAGE_LIST_VIEW",
      "PACKAGE_VIEW",
      "INQUIRY_START",
      "SIGNUP_START",
      "BOOKING_START",
    ].includes(payload.eventType);

    if (shouldDedupe) {
      const lastRecorded = sessionStorage.getItem(dedupeKey);
      if (lastRecorded && Date.now() - Number(lastRecorded) < DEDUPE_WINDOW_MS) {
        return;
      }
      sessionStorage.setItem(dedupeKey, String(Date.now()));
    }

    const body = JSON.stringify({
      eventType: payload.eventType,
      packageId: payload.packageId || null,
      packageSlug: payload.packageSlug || null,
      packageName: payload.packageName || payload.packageTitle || null,
      packageTitle: payload.packageTitle || payload.packageName || null,
      category: payload.category || null,
      sourcePage: payload.sourcePage || window.location.pathname,
      referrer: document.referrer || null,
      language: payload.language || document.documentElement.lang || "en",
      sessionId: sessionKey,
      sessionKey,
      metadata: payload.metadata || undefined,
    });

    // Non-blocking fire-and-forget request
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Resilient: never break customer experience if analytics is blocked or offline
    });
  } catch {
    // Ignore client storage or network exceptions
  }
}
