import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getPublishedPackagesCatalog } from "@/lib/packages-data";

const TRACKING_START_DATE = "2026-10-10";

const ALLOWED_EVENTS = new Set([
  "HOME_VIEW",
  "PACKAGE_LIST_VIEW",
  "PACKAGE_VIEW",
  "PACKAGE_CARD_CLICK",
  "WHATSAPP_CTA_CLICK",
  "CALL_CTA_CLICK",
  "INQUIRY_START",
  "INQUIRY_SUBMIT",
  "SIGNUP_START",
  "SIGNUP_SUCCESS",
  "BOOKING_START",
  "BOOKING_SUCCESS",
]);

const DEDUPED_VIEW_EVENTS = new Set([
  "HOME_VIEW",
  "PACKAGE_LIST_VIEW",
  "PACKAGE_VIEW",
  "INQUIRY_START",
  "SIGNUP_START",
  "BOOKING_START",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventType,
      packageId,
      packageSlug,
      packageName,
      packageTitle,
      category,
      sourcePage,
      referrer,
      language,
      sessionKey,
      sessionId,
    } = body || {};

    if (!eventType || typeof eventType !== "string" || !ALLOWED_EVENTS.has(eventType)) {
      return NextResponse.json({ error: "Invalid event type." }, { status: 400 });
    }

    const rawSession = sessionKey || sessionId;
    const safeSessionKey =
      typeof rawSession === "string" && rawSession.length <= 80
        ? rawSession.replace(/[^a-zA-Z0-9_-]/g, "")
        : "anon";

    // Server-side validation of packageId / packageSlug against published catalog
    let validatedPackageId: string | null = null;
    let validatedPackageSlug: string | null = null;
    let validatedPackageName: string | null = null;
    const candidateName = packageName || packageTitle;

    if (packageId || packageSlug || candidateName) {
      const catalog = await getPublishedPackagesCatalog();
      const matched = catalog.find(
        (p) =>
          (packageId && p.id === packageId) ||
          (packageSlug && p.slug === packageSlug) ||
          (candidateName && p.name.toLowerCase() === String(candidateName).toLowerCase())
      );

      if (matched) {
        validatedPackageId = matched.id;
        validatedPackageSlug = matched.slug;
        validatedPackageName = matched.name;
      } else if (eventType === "PACKAGE_VIEW") {
        // Reject untrusted package IDs for PACKAGE_VIEW
        return NextResponse.json({ error: "Unknown or unpublished package." }, { status: 400 });
      }
    }

    const entityId = validatedPackageId || "SITE";

    // Server-side 30-minute deduplication window for view/start events
    if (DEDUPED_VIEW_EVENTS.has(eventType) && safeSessionKey !== "anon") {
      const windowStart = new Date(Date.now() - 30 * 60 * 1000);
      const recentDuplicate = await prisma.auditLog.findFirst({
        where: {
          entity: "AnalyticsEvent",
          action: eventType,
          entityId,
          createdAt: { gte: windowStart },
          details: { contains: `"sessionKey":"${safeSessionKey}"` },
        },
        select: { id: true },
      });

      if (recentDuplicate) {
        return NextResponse.json({ success: true, status: "deduplicated", deduplicated: true });
      }
    }

    const detailsPayload = JSON.stringify({
      sessionKey: safeSessionKey,
      sessionId: safeSessionKey,
      packageId: validatedPackageId,
      packageSlug: validatedPackageSlug,
      packageName: validatedPackageName,
      packageTitle: validatedPackageName,
      category: typeof category === "string" ? category.slice(0, 40) : null,
      sourcePage: typeof sourcePage === "string" ? sourcePage.slice(0, 160) : "/",
      referrer: typeof referrer === "string" ? referrer.slice(0, 200) : null,
      language: typeof language === "string" ? language.slice(0, 10) : "en",
    });

    await prisma.auditLog.create({
      data: {
        userId: null,
        action: eventType,
        entity: "AnalyticsEvent",
        entityId,
        details: detailsPayload,
        ipAddress: null, // Privacy-conscious: do not store raw visitor IPs in analytics events
      },
    });

    return NextResponse.json({ success: true, status: "recorded", deduplicated: false });
  } catch {
    // Fail gracefully without exposing internal stack traces
    return NextResponse.json({ success: false }, { status: 202 });
  }
}
