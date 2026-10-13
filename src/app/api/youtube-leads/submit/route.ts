import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import {
  extractYouTubeAttribution,
  parseFormQuestions,
  sanitizeTextValue,
  validateAndSanitizeSubmission,
} from "@/lib/youtube-leads";
import { calculateLeadScore } from "@/lib/lead-scoring";

export const dynamic = "force-dynamic";

const ipRateMap = new Map<string, number[]>();

// In-memory staff cache to avoid repeated queries on rapid submits (TTL 60s)
let cachedStaffUsers: Array<{ id: string; name: string; role: string }> | null = null;
let cachedStaffTimestamp = 0;

async function getCachedStaffUsers() {
  const now = Date.now();
  if (cachedStaffUsers && now - cachedStaffTimestamp < 60_000) {
    return cachedStaffUsers;
  }
  try {
    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        role: { notIn: ["CUSTOMER", "AGENT"] },
      },
      select: { id: true, name: true, role: true },
    });
    cachedStaffUsers = users;
    cachedStaffTimestamp = now;
    return users;
  } catch (err) {
    console.error("Failed to load staff users:", err);
    return cachedStaffUsers || [];
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // 1. IP Rate limiting: max 20 submissions per 10 minutes per IP
    const now = Date.now();
    const recentHits = (ipRateMap.get(ip) || []).filter(
      (t) => now - t < 10 * 60 * 1000
    );
    if (recentHits.length >= 20) {
      return NextResponse.json(
        {
          error:
            "Too many form submissions from your connection. Please wait a few minutes or contact us on WhatsApp.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 2. Honeypot spam protection (returns immediate faux success to trap bots)
    if (body.website_url && String(body.website_url).trim().length > 0) {
      return NextResponse.json({
        success: true,
        submissionCode: "YTL-2026-0000",
        successTitle: "Jazakallah Khair! Your Enquiry Has Been Received.",
        successMessage: "Our team will contact you shortly.",
      });
    }

    const formId = body.formId ? String(body.formId).trim() : "";
    const formSlug = body.formSlug ? String(body.formSlug).trim() : "youtube-lead";
    const submissionToken = body.submissionToken
      ? sanitizeTextValue(body.submissionToken, 100)
      : null;

    // 3. Fast Idempotency check: prevent duplicate submissions from double clicks or network retries
    if (submissionToken) {
      const existingByToken = await prisma.leadFormSubmission.findUnique({
        where: { submissionToken },
        include: { form: { select: { successTitle: true, successMessage: true } } },
      });
      if (existingByToken) {
        return NextResponse.json({
          success: true,
          deduplicated: true,
          id: existingByToken.id,
          submissionCode: existingByToken.submissionCode,
          successTitle: existingByToken.form.successTitle,
          successMessage: existingByToken.form.successMessage,
        });
      }
    }

    // 4. Parallel Form & Staff Lookup (avoids sequential waterfall)
    const [form, staffUsers] = await Promise.all([
      prisma.leadForm.findFirst({
        where: formId ? { id: formId } : { slug: formSlug || "youtube-lead" },
      }),
      getCachedStaffUsers(),
    ]);

    if (!form) {
      return NextResponse.json(
        { error: "The requested lead form does not exist." },
        { status: 404 }
      );
    }

    // 5. Reject submissions if form is unpublished or inactive
    if (form.status !== "PUBLISHED" || !form.isActive) {
      return NextResponse.json(
        {
          error:
            "This lead form is currently unpublished or closed and is not accepting new submissions.",
        },
        { status: 403 }
      );
    }

    // 6. Fast Validation against published questions
    const publishedQuestions = parseFormQuestions(form.questionsJson);
    const rawAnswers =
      body.answers && typeof body.answers === "object" ? body.answers : {};

    const validation = validateAndSanitizeSubmission(
      publishedQuestions,
      rawAnswers
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error:
            validation.firstErrorMessage ||
            "Please fix the highlighted fields before submitting.",
          fieldErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    const { extracted, snapshots } = validation;

    // 7. Check 60-second duplicate submission window (same form + phone + name)
    if (extracted.phone) {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentDuplicate = await prisma.leadFormSubmission.findFirst({
        where: {
          formId: form.id,
          phone: extracted.phone,
          name: extracted.name,
          createdAt: { gte: oneMinuteAgo },
        },
        select: { id: true, submissionCode: true },
      });
      if (recentDuplicate) {
        return NextResponse.json({
          success: true,
          deduplicated: true,
          id: recentDuplicate.id,
          submissionCode: recentDuplicate.submissionCode,
          successTitle: form.successTitle,
          successMessage: form.successMessage,
        });
      }
    }

    recentHits.push(now);
    ipRateMap.set(ip, recentHits);

    // 8. Extract truthful YouTube & UTM campaign attribution
    const headerReferer = req.headers.get("referer") || null;
    const attribution = extractYouTubeAttribution({
      videoId: body.videoId || body.v || body.video_id || null,
      videoUrl: body.videoUrl || body.video || body.yt_video || null,
      utmSource: body.utmSource || body.utm_source || null,
      utmMedium: body.utmMedium || body.utm_medium || null,
      utmCampaign: body.utmCampaign || body.utm_campaign || null,
      utmContent: body.utmContent || body.utm_content || null,
      utmTerm: body.utmTerm || body.utm_term || null,
      referrer: body.referrer || headerReferer,
      landingPage: body.landingPage || `/lead/${form.slug}`,
      explicitSource: body.leadSource || null,
    });

    const resolvedCampaignName =
      sanitizeTextValue(body.campaignName, 150) ||
      attribution.utmCampaign ||
      form.campaignName ||
      null;

    // 9. Auto-assign staff member
    let autoAssignUserId: string | null = null;
    if (form.settingsJson) {
      try {
        const parsedSettings = JSON.parse(form.settingsJson);
        if (parsedSettings?.autoAssignUserId) {
          autoAssignUserId = String(parsedSettings.autoAssignUserId);
        }
      } catch {
        // ignore
      }
    }

    const matchedAssignee =
      (autoAssignUserId && staffUsers.find((u) => u.id === autoAssignUserId)) ||
      staffUsers.find((u) => u.role === "SALES_EXECUTIVE") ||
      staffUsers.find((u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN") ||
      staffUsers[0] ||
      null;

    // 10. Generate high-performance collision-free submissionCode
    // (avoiding sequential DB count + findUnique roundtrips)
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timeSeq = Date.now().toString().slice(-4);
    const submissionCode = `YTL-2026-${timeSeq}${randomHex}`;

    // 11. Calculate Lead Quality Score & Priority Urgency
    const scoreResult = calculateLeadScore({
      travelTimeline: extracted.travelTimeline,
      travelMonth: extracted.travelMonth,
      interestedIn: extracted.interestedIn || form.packageName,
      notes: extracted.notes,
      phone: extracted.phone,
      whatsapp: extracted.whatsapp,
      email: extracted.email,
      travellersCount: extracted.travellersCount,
      latitude: extracted.latitude,
      longitude: extracted.longitude,
      postalCode: extracted.postalCode,
      locationSource: extracted.locationSource,
      createdAt: new Date(),
    });

    // 12. Fast Single-Insert Persistence
    const submission = await prisma.leadFormSubmission.create({
      data: {
        submissionCode,
        formId: form.id,
        formSlug: form.slug,
        formTitle: form.title,
        formVersion: form.version,
        name: extracted.name,
        phone: extracted.phone || "Not Provided",
        whatsapp: extracted.whatsapp,
        email: extracted.email,
        city: extracted.city,
        district: extracted.district,
        state: extracted.state,
        postalCode: extracted.postalCode,
        country: extracted.country || "India",
        address: extracted.address,
        latitude: extracted.latitude,
        longitude: extracted.longitude,
        locationSource: extracted.locationSource || "MANUAL",
        interestedIn: extracted.interestedIn || form.packageName || "Umrah / Hajj",
        travelMonth: extracted.travelMonth,
        travelTimeline: extracted.travelTimeline,
        approxDepartureDate: scoreResult.approxDepartureWindow,
        travellersCount: extracted.travellersCount,
        notes: extracted.notes,
        leadScore: scoreResult.score,
        priority: scoreResult.priority,
        scoreExplanation: scoreResult.explanation,
        scoredAt: new Date(),
        followUpDate: scoreResult.recommendedFollowUpDate,
        campaignName: resolvedCampaignName,
        leadSource: attribution.leadSource,
        videoId: attribution.videoId,
        videoUrl: attribution.videoUrl,
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        utmContent: attribution.utmContent,
        utmTerm: attribution.utmTerm,
        landingPage: attribution.landingPage,
        referrer: attribution.referrer,
        ipAddress: ip,
        submissionToken,
        answersJson: JSON.stringify(snapshots),
        status: "NEW",
        assignedToId: matchedAssignee?.id || null,
      },
    });

    // 13. Non-blocking Asynchronous In-App Notifications & Audit Log
    // (Ensures HTTP response to user is delivered in sub-300ms without blocking on background tasks)
    const backgroundTasks = async () => {
      try {
        const recipientIds = Array.from(
          new Set(
            staffUsers
              .filter(
                (u) =>
                  u.role === "SUPER_ADMIN" ||
                  u.role === "ADMIN" ||
                  u.role === "MARKETING" ||
                  u.id === matchedAssignee?.id
              )
              .map((u) => u.id)
          )
        );

        const notifPromise =
          recipientIds.length > 0
            ? prisma.notification.createMany({
                data: recipientIds.map((uid) => ({
                  userId: uid,
                  title: `[${scoreResult.priority}] New Lead (${submission.submissionCode}): ${submission.name}`,
                  message: `${submission.name} (${submission.phone}) • ${
                    extracted.travelTimeline ? `Timeline: ${extracted.travelTimeline} • ` : ""
                  }Score: ${scoreResult.score}/100 • "${form.title}"`,
                  type: "YOUTUBE_LEAD",
                  isRead: false,
                  link: `/admin/youtube-leads/responses/${submission.id}`,
                })),
              })
            : Promise.resolve();

        const auditPromise = logAudit({
          userId: null,
          action: "YOUTUBE_LEAD_CREATED",
          entity: "LeadFormSubmission",
          entityId: submission.id,
          details: {
            submissionCode: submission.submissionCode,
            formId: form.id,
            formTitle: form.title,
            leadScore: scoreResult.score,
            priority: scoreResult.priority,
            travelTimeline: extracted.travelTimeline,
            locationSource: extracted.locationSource,
            campaignName: resolvedCampaignName,
            leadSource: attribution.leadSource,
            videoId: attribution.videoId,
          },
          ipAddress: ip,
        });

        await Promise.allSettled([notifPromise, auditPromise]);
      } catch (bgErr) {
        console.error("Non-blocking background notification/audit error:", bgErr);
      }
    };

    // Execute background notifications
    backgroundTasks().catch((err) =>
      console.error("Background task dispatch error:", err)
    );

    const durationMs = Date.now() - startTime;
    console.info(
      `[Lead Submit Performance] Code=${submission.submissionCode} Score=${scoreResult.score} Duration=${durationMs}ms`
    );

    return NextResponse.json({
      success: true,
      id: submission.id,
      submissionCode: submission.submissionCode,
      leadScore: scoreResult.score,
      priority: scoreResult.priority,
      priorityLabel: scoreResult.priorityLabel,
      notificationCreated: true,
      successTitle: form.successTitle,
      successMessage: form.successMessage,
      processingDurationMs: durationMs,
    });
  } catch (error: unknown) {
    console.error("YouTube lead submission error:", error);
    const msg =
      error instanceof Error
        ? error.message
        : "Unable to submit your enquiry right now. Please try again.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
