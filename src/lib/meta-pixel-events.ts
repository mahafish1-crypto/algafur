"use client";

import { isRouteExcludedFromPixel } from "./meta-pixel";

declare global {
  interface Window {
    fbq?: ((...args: any[]) => void) & {
      callMethod?: (...args: any[]) => void;
      queue?: any[];
      loaded?: boolean;
      version?: string;
    };
    _fbq?: any;
  }
}

/**
 * Checks if window.fbq is available and route is eligible for tracking.
 */
function canTrackEvent(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.fbq || typeof window.fbq !== "function") return false;

  const currentPath = window.location.pathname;
  if (isRouteExcludedFromPixel(currentPath)) {
    return false;
  }

  return true;
}

/**
 * Triggers standard PageView event.
 */
export function trackMetaPageView(): void {
  if (!canTrackEvent()) return;
  try {
    window.fbq!("track", "PageView");
  } catch (err) {
    console.debug("[MetaPixel] PageView dispatch skipped:", err);
  }
}

export interface MetaViewContentParams {
  id?: string;
  name: string;
  slug?: string;
  price?: number;
  currency?: string;
  category?: string;
}

/**
 * Triggers standard ViewContent event on Package detail pages.
 * Includes only public package catalogue info: name, id, category, starting price.
 */
export function trackMetaViewContent(params: MetaViewContentParams): void {
  if (!canTrackEvent()) return;
  try {
    window.fbq!("track", "ViewContent", {
      content_name: params.name,
      content_ids: [params.id || params.slug || "package"],
      content_type: "product",
      content_category: params.category || "Hajj & Umrah Pilgrimage Packages",
      value: typeof params.price === "number" && params.price > 0 ? params.price : 0,
      currency: params.currency || "INR",
    });
  } catch (err) {
    console.debug("[MetaPixel] ViewContent dispatch skipped:", err);
  }
}

export interface MetaLeadParams {
  leadType: "website_enquiry" | "youtube_lead" | "booking_enquiry" | "contact_enquiry";
  packageName?: string;
  formTitle?: string;
  campaignName?: string;
}

/**
 * Triggers standard Lead event ONLY AFTER confirmed server-side persistence.
 * PRIVACY GUARD: Strictly NEVER transmits personal identifiable information (PII),
 * passport details, visa info, payment credentials, or GPS coordinates to Meta.
 */
export function trackMetaLead(params: MetaLeadParams): void {
  if (!canTrackEvent()) return;
  try {
    window.fbq!("track", "Lead", {
      content_name: params.packageName || params.formTitle || "Sacred Journey Lead",
      content_category: "Hajj & Umrah Pilgrimage",
      lead_type: params.leadType,
      campaign_name: params.campaignName || undefined,
      status: "confirmed_server_submission",
    });
  } catch (err) {
    console.debug("[MetaPixel] Lead dispatch skipped:", err);
  }
}

