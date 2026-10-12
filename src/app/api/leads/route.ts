import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

const ipSubmissionMap = new Map<string, number[]>();

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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Basic IP rate limiting (max 20 inquiries per 10 minutes per IP)
    const now = Date.now();
    const recentTimestamps = (ipSubmissionMap.get(ip) || []).filter(
      (t) => now - t < 10 * 60 * 1000
    );
    if (recentTimestamps.length >= 20) {
      return NextResponse.json(
        {
          error:
            "Too many inquiries submitted recently. Please wait a few minutes or contact us on WhatsApp.",
        },
        { status: 429 }
      );
    }
    recentTimestamps.push(now);
    ipSubmissionMap.set(ip, recentTimestamps);

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

    // Honeypot check: silently succeed without polluting CRM
    if (website_url && String(website_url).trim().length > 0) {
      return NextResponse.json({
        success: true,
        leadNumber: "ALL-2026-0000",
      });
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
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

    const salesUser = staffUsers.find((u) => u.role === "SALES_EXECUTIVE");
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

    const newLead = await prisma.lead.create({
      data: {
        leadNumber,
        name: name.trim(),
        mobile: cleanMobile,
        whatsapp:
          whatsapp && String(whatsapp).trim()
            ? normalizePhone(String(whatsapp))
            : cleanMobile,
        email: cleanEmail,
        city: city ? String(city).trim() : "Pune",
        journeyType: journeyType || category || matchedPkg?.type || "UMRAH",
        packageInterest: resolvedPackageInterest,
        travelDate: resolvedTravelDate,
        adults: adultsCount,
        children: childrenCount,
        budget: roomPreference
          ? `${roomPreference}${budget ? ` • ${budget}` : ""}`
          : budget || null,
        notes: enrichedNotes,
        source: resolvedSource,
        utmSource: utmSource || resolvedSourcePage,
        utmMedium: utmMedium || resolvedContactMethod,
        utmCampaign: utmCampaign || (packageId ? String(packageId) : null),
        assignedToId: assignee?.id || null,
        customerId: existingCustomer?.id || null,
        status: "NEW",
      },
    });

    // Create Initial Activity
    try {
      await prisma.leadActivity.create({
        data: {
          leadId: newLead.id,
          userId: assignee?.id || null,
          type: "NOTE",
          description: `New booking enquiry submitted via ${resolvedSource} (${resolvedSourcePage}) for "${resolvedPackageInterest}". Travellers: ${adultsCount} Adult(s), ${childrenCount} Child(ren).${
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
