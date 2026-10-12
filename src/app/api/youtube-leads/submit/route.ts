import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import {
  ensureDefaultYouTubeForm,
  extractYouTubeAttribution,
  parseFormQuestions,
  sanitizeTextValue,
  validateAndSanitizeSubmission,
} from "@/lib/youtube-leads";

const ipRateMap = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // IP Rate limiting: max 15 submissions per 10 minutes per IP
    const now = Date.now();
    const recentHits = (ipRateMap.get(ip) || []).filter(
      (t) => now - t < 10 * 60 * 1000
    );
    if (recentHits.length >= 15) {
      return NextResponse.json(
        {
          error:
            "Too many form submissions from your connection. Please wait a few minutes or contact us on WhatsApp.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot spam protection
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

    // 1. Idempotency check: prevent duplicate submissions from double clicks or network retries
    if (submissionToken) {
      const existingByToken = await prisma.leadFormSubmission.findUnique({
        where: { submissionToken },
        include: { form: true },
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

    // 2. Load the target form
    await ensureDefaultYouTubeForm();
    const form = await prisma.leadForm.findFirst({
      where: formId
        ? { id: formId }
        : { slug: formSlug || "youtube-lead" },
    });

    if (!form) {
      return NextResponse.json(
        { error: "The requested lead form does not exist." },
        { status: 404 }
      );
    }

    // 3. Reject submissions if form is unpublished or inactive
    if (form.status !== "PUBLISHED" || !form.isActive) {
      return NextResponse.json(
        {
          error:
            "This lead form is currently unpublished or closed and is not accepting new submissions.",
        },
        { status: 403 }
      );
    }

    // 4. Validate every submitted answer against the currently published form schema
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

    // 5. Check 60-second duplicate submission window (same form + phone + name)
    if (extracted.phone) {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentDuplicate = await prisma.leadFormSubmission.findFirst({
        where: {
          formId: form.id,
          phone: extracted.phone,
          name: extracted.name,
          createdAt: { gte: oneMinuteAgo },
        },
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

    // 6. Extract truthful YouTube & UTM campaign attribution
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

    // 7. Determine auto-assigned staff member
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

    const staffUsers = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        role: { notIn: ["CUSTOMER", "AGENT"] },
      },
      select: { id: true, name: true, role: true },
    });

    const matchedAssignee =
      (autoAssignUserId && staffUsers.find((u) => u.id === autoAssignUserId)) ||
      staffUsers.find((u) => u.role === "SALES_EXECUTIVE") ||
      staffUsers.find((u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN") ||
      staffUsers[0] ||
      null;

    // 8. Generate unique submissionCode YTL-2026-XXXX
    const currentCount = await prisma.leadFormSubmission.count();
    let submissionCode = `YTL-2026-${String(currentCount + 1).padStart(4, "0")}`;
    const codeExists = await prisma.leadFormSubmission.findUnique({
      where: { submissionCode },
      select: { id: true },
    });
    if (codeExists) {
      submissionCode = `YTL-2026-${String(currentCount + 1).padStart(4, "0")}-${Date.now()
        .toString()
        .slice(-3)}`;
    }

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
        interestedIn: extracted.interestedIn || form.packageName || "Umrah / Hajj",
        travelMonth: extracted.travelMonth,
        travellersCount: extracted.travellersCount,
        notes: extracted.notes,
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

    // 9. Create a single deduplicated in-app Notification per Admin/Assignee
    let notificationCreated = false;
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

      if (recipientIds.length > 0) {
        await prisma.notification.createMany({
          data: recipientIds.map((uid) => ({
            userId: uid,
            title: `New YouTube Lead (${submission.submissionCode}): ${submission.name}`,
            message: `${submission.name} (${submission.phone}) submitted "${form.title}"${
              resolvedCampaignName ? ` • Campaign: ${resolvedCampaignName}` : ""
            }${submission.interestedIn ? ` • Interested in: ${submission.interestedIn}` : ""}.`,
            type: "YOUTUBE_LEAD",
            isRead: false,
            link: `/admin/youtube-leads/responses/${submission.id}`,
          })),
        });
        notificationCreated = true;
      }
    } catch (notifErr) {
      console.error("Failed to create YouTube lead notification:", notifErr);
    }

    // 10. Record initial submission activity in AuditLog
    try {
      await logAudit({
        userId: null,
        action: "YOUTUBE_LEAD_CREATED",
        entity: "LeadFormSubmission",
        entityId: submission.id,
        details: {
          submissionCode: submission.submissionCode,
          formId: form.id,
          formTitle: form.title,
          formVersion: form.version,
          campaignName: resolvedCampaignName,
          leadSource: attribution.leadSource,
          videoId: attribution.videoId,
          note: `Submitted via "${form.title}" (${attribution.leadSource})`,
        },
        ipAddress: ip,
      });
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      id: submission.id,
      submissionCode: submission.submissionCode,
      notificationCreated,
      successTitle: form.successTitle,
      successMessage: form.successMessage,
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

