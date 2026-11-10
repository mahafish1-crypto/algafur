import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";
import { calculateLeadScore } from "@/lib/lead-scoring";
import {
  checkRateLimit,
  isHoneypotTriggered,
  sanitizeString,
  getClientIp,
} from "@/lib/security";

function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2)}`;
  }
  return trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. Strict IP Rate Limiting (max 5 lead inquiries per 10 minutes per IP)
    const rateCheck = checkRateLimit(`lead_submit_${ip}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many inquiries submitted recently. Please wait a few minutes or contact us directly on WhatsApp.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      name,
      mobile,
      phone,
      whatsapp,
      email,
      city,
      journeyType,
      category,
      packageInterest,
      packageId,
      travelDate,
      travelMonth,
      travelTimeline,
      adults,
      children,
      roomPreference,
      preferredContact,
      preferredContactMethod,
      budget,
      message,
      notes,
      source,
      sourcePage,
      language,
      consentAccepted,
      website_url,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // 2. Honeypot check: silently drop automated spam without polluting CRM
    if (isHoneypotTriggered(body, ["website_url", "honeypot", "hp_field", "hp_check", "company_fax"])) {
      return NextResponse.json({
        success: true,
        leadNumber: "ALL-2026-0000",
      });
    }

    // 3. Text Input Sanitization (strip HTML, control characters, scripts)
    const cleanName = sanitizeString(name, 120);
    const cleanCity = city ? sanitizeString(city, 100) : "Not Specified";
    const cleanMessage = sanitizeString(message || notes || "", 1500);
    const cleanCategory = sanitizeString(category || journeyType || "UMRAH", 50);
    const cleanPackageInterest = sanitizeString(packageInterest, 160);
    const cleanTravelTimeline = sanitizeString(travelTimeline || travelMonth || travelDate, 120);
    const cleanRoomPreference = sanitizeString(roomPreference, 50);
    const cleanPreferredContact = sanitizeString(preferredContactMethod || preferredContact || "WHATSAPP", 30);
    const cleanBudget = sanitizeString(budget, 80);
    const cleanSource = sanitizeString(source || utmSource || "WEBSITE_INQUIRY", 60);
    const cleanSourcePage = sanitizeString(sourcePage || "/", 250);
    const cleanUtmSource = utmSource ? sanitizeString(utmSource, 100) : null;
    const cleanUtmMedium = utmMedium ? sanitizeString(utmMedium, 100) : null;
    const cleanUtmCampaign = utmCampaign ? sanitizeString(utmCampaign, 150) : null;

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { error: "Full Name (at least 2 characters) is required." },
        { status: 400 }
      );
    }

    const rawPhoneInput = mobile || phone;
    if (!rawPhoneInput || typeof rawPhoneInput !== "string") {
      return NextResponse.json(
        { error: "Mobile / WhatsApp Number is required." },
        { status: 400 }
      );
    }

    const digitsOnly = rawPhoneInput.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return NextResponse.json(
        { error: "Please provide a valid 10 to 15 digit mobile number." },
        { status: 400 }
      );
    }

    if (email && typeof email === "string" && email.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return NextResponse.json(
          { error: "Please provide a valid email address." },
          { status: 400 }
        );
      }
    }

    if (consentAccepted === false) {
      return NextResponse.json(
        {
          error:
            "Please accept the Privacy Policy and User Agreement to proceed.",
        },
        { status: 400 }
      );
    }

    const cleanMobile = normalizePhone(rawPhoneInput);
    const rawMobileTrimmed = rawPhoneInput.trim();
    const cleanEmail =
      email && typeof email === "string" && email.trim()
        ? email.trim().toLowerCase()
        : null;

    // Find active staff users for assignment and notifications
    const [staffUsers, existingCustomer, matchedPkg] = await Promise.all([
      prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, name: true, role: true },
      }),
      prisma.customer.findFirst({
        where: {
          OR: [
            { phone: cleanMobile },
            { phone: rawMobileTrimmed },
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        },
        select: { id: true },
      }),
      packageId
        ? prisma.package
            .findUnique({
              where: { id: String(packageId) },
              select: { id: true, name: true, slug: true, type: true },
            })
            .catch(() => null)
        : Promise.resolve(null),
    ]);

    const salesUser = staffUsers.find(
      (u) =>
        u.role === "SALES_EXECUTIVE" ||
        u.role === "SALES" ||
        u.role === "Sales" ||
        u.role?.toLowerCase().includes("sales")
    );
    const adminUser = staffUsers.find(
      (u) =>
        u.role === "SUPER_ADMIN" ||
        u.role === "ADMIN" ||
        u.role === "MANAGER"
    );
    const assignee = salesUser || adminUser || staffUsers[0] || null;

    const resolvedContactMethod =
      preferredContactMethod || preferredContact || "WHATSAPP";
    const resolvedMessage = message || notes || "";
    const resolvedTravelDate = travelDate || travelMonth || null;
    const resolvedPackageInterest =
      packageInterest || matchedPkg?.name || "Umrah / Hajj Package Enquiry";
    const resolvedSourcePage = sourcePage || "/";
    const resolvedSource =
      source ||
      utmSource ||
      (resolvedSourcePage.startsWith("/packages/")
        ? "Package Page"
        : resolvedSourcePage.startsWith("/booking")
        ? "Book Now Flow"
        : resolvedSourcePage.startsWith("/about")
        ? "About Us Page"
        : resolvedSourcePage.startsWith("/contact")
        ? "Contact Page"
        : "Homepage");

    const contextNoteParts = [
      resolvedMessage ? String(resolvedMessage).trim() : null,
      roomPreference ? `Room Preference: ${roomPreference}` : null,
      resolvedContactMethod
        ? `Preferred Contact: ${resolvedContactMethod}`
        : null,
      resolvedSourcePage ? `Source Page: ${resolvedSourcePage}` : null,
      packageId ? `Package ID: ${packageId}` : null,
      language ? `Lang: ${language}` : null,
    ].filter(Boolean);
    const enrichedNotes =
      contextNoteParts.length > 0 ? contextNoteParts.join(" | ") : null;

    // Generate unique Lead Number ALL-2026-XXXX
    const count = await prisma.lead.count();
    let leadNumber = `ALL-2026-${String(count + 1).padStart(4, "0")}`;
    const collision = await prisma.lead.findUnique({
      where: { leadNumber },
      select: { id: true },
    });
    if (collision) {
      leadNumber = `ALL-2026-${String(count + 1).padStart(4, "0")}-${Date.now()
        .toString()
        .slice(-3)}`;
    }

    const adultsCount = Math.max(1, Number(adults) || 1);
    const childrenCount = Math.max(0, Number(children) || 0);

    // Compute deterministic Lead Quality Score (0-100) and Priority Category (HOT/WARM/COLD)
    const scoreResult = calculateLeadScore({
      travelTimeline: travelTimeline || resolvedTravelDate,
      travelMonth: travelMonth || resolvedTravelDate,
      interestedIn: resolvedPackageInterest,
      notes: resolvedMessage,
      phone: cleanMobile,
      whatsapp:
        whatsapp && String(whatsapp).trim()
          ? normalizePhone(String(whatsapp))
          : cleanMobile,
      email: cleanEmail,
      travellersCount: adultsCount + childrenCount,
      city: city ? String(city).trim() : null,
      createdAt: new Date(),
    });

    const newLead = await prisma.lead.create({
      data: {
        leadNumber,
        name: cleanName,
        mobile: cleanMobile,
        whatsapp:
          whatsapp && String(whatsapp).trim()
            ? normalizePhone(String(whatsapp))
            : cleanMobile,
        email: cleanEmail,
        city: cleanCity,
        journeyType: cleanCategory || matchedPkg?.type || "UMRAH",
        packageInterest: cleanPackageInterest || resolvedPackageInterest,
        travelDate: resolvedTravelDate,
        travelTimeline: cleanTravelTimeline || resolvedTravelDate || null,
        leadScore: scoreResult.score,
        priority: scoreResult.priority,
        scoreExplanation: scoreResult.explanation,
        adults: adultsCount,
        children: childrenCount,
        budget: cleanRoomPreference
          ? `${cleanRoomPreference}${cleanBudget ? ` • ${cleanBudget}` : ""}`
          : cleanBudget || null,
        notes: enrichedNotes,
        source: cleanSource,
        utmSource: cleanUtmSource || cleanSourcePage,
        utmMedium: cleanUtmMedium || cleanPreferredContact,
        utmCampaign: cleanUtmCampaign || (packageId ? String(packageId) : null),
        assignedToId: assignee?.id || null,
        customerId: existingCustomer?.id || null,
        status: "NEW",
      },
    });

    // Create Initial Activity with lead quality insights
    try {
      await prisma.leadActivity.create({
        data: {
          leadId: newLead.id,
          userId: assignee?.id || null,
          type: "NOTE",
          description: `New booking enquiry submitted via ${resolvedSource} (${resolvedSourcePage}) for "${resolvedPackageInterest}". Travellers: ${adultsCount} Adult(s), ${childrenCount} Child(ren). Score: ${scoreResult.score}/100 [${scoreResult.priority}].${
            roomPreference ? ` Room: ${roomPreference}.` : ""
          }`,
        },
      });
    } catch (actErr) {
      console.error("Failed to create initial lead activity:", actErr);
    }

    // Create Admin Notification & Follow-up Task (isolated so notification errors never fail lead creation)
    let notificationSaved = false;
    try {
      if (assignee) {
        await prisma.task.create({
          data: {
            title: `Contact new lead: ${newLead.name} (${newLead.leadNumber})`,
            description: `Enquired about ${newLead.packageInterest}. Phone: ${newLead.mobile}. Preferred Contact: ${resolvedContactMethod}`,
            priority: "HIGH",
            status: "PENDING",
            assignedToId: assignee.id,
            leadId: newLead.id,
          },
        });
      }

      // Notify Super Admin / Admin and Assignee (deduplicated by user ID)
      const recipientIds = Array.from(
        new Set(
          staffUsers
            .filter(
              (u) =>
                u.role === "SUPER_ADMIN" ||
                u.role === "ADMIN" ||
                u.id === assignee?.id
            )
            .map((u) => u.id)
        )
      );

      if (recipientIds.length > 0) {
        await prisma.notification.createMany({
          data: recipientIds.map((uid) => ({
            userId: uid,
            title: `New Lead (${newLead.leadNumber}): ${newLead.name}`,
            message: `${newLead.name} (${newLead.mobile}${
              newLead.email ? ` • ${newLead.email}` : ""
            }) enquired for "${newLead.packageInterest}" (${
              adultsCount + childrenCount
            } travellers).`,
            type: "LEAD",
            isRead: false,
            link: `/admin/crm/leads/${newLead.id}`,
          })),
        });
        notificationSaved = true;
      }
    } catch (notifErr) {
      console.error("Failed to create lead notification:", notifErr);
    }

    try {
      await logAudit({
        userId: null,
        action: "CREATE_LEAD",
        entity: "Lead",
        entityId: newLead.id,
        details: {
          leadNumber,
          name: newLead.name,
          mobile: cleanMobile,
          packageId: packageId || matchedPkg?.id || null,
          packageInterest: newLead.packageInterest,
          roomPreference: roomPreference || null,
          preferredContactMethod: resolvedContactMethod,
          source: resolvedSource,
          sourcePage: resolvedSourcePage,
          consentAccepted: Boolean(consentAccepted),
        },
        ipAddress: ip,
      });
    } catch {
      // ignore audit log errors
    }

    return NextResponse.json({
      success: true,
      leadNumber,
      id: newLead.id,
      score: scoreResult.score,
      priority: scoreResult.priority,
      explanation: scoreResult.explanation,
      notificationSaved,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "view:leads");
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const source = searchParams.get("source");
    const packageFilter = searchParams.get("package");
    const assignedToId = searchParams.get("assignedToId");

    const where: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (source && source !== "ALL") {
      where.source = source;
    }
    if (packageFilter && packageFilter !== "ALL") {
      where.packageInterest = { contains: packageFilter };
    }
    if (assignedToId && assignedToId !== "ALL") {
      where.assignedToId = assignedToId === "UNASSIGNED" ? null : assignedToId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
        { leadNumber: { contains: search, mode: "insensitive" } },
        { packageInterest: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        followUps: {
          orderBy: { date: "desc" },
          take: 3,
        },
        _count: { select: { activities: true, followUps: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, leads });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
