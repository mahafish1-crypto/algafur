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

    // Basic IP rate limiting (max 12 inquiries per 10 minutes per IP)
    const now = Date.now();
    const recentTimestamps = (ipSubmissionMap.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
    if (recentTimestamps.length >= 12) {
      return NextResponse.json(
        { error: "Too many inquiries submitted recently. Please wait a few minutes or contact us on WhatsApp." },
        { status: 429 }
      );
    }
    recentTimestamps.push(now);
    ipSubmissionMap.set(ip, recentTimestamps);

    const body = await req.json();
    const {
      name,
      mobile,
      whatsapp,
      email,
      city,
      journeyType,
      packageInterest,
      packageId,
      travelDate,
      adults,
      children,
      preferredContact,
      budget,
      message,
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

    if (!mobile || typeof mobile !== "string") {
      return NextResponse.json(
        { error: "Mobile Number is required." },
        { status: 400 }
      );
    }

    const digitsOnly = mobile.replace(/\D/g, "");
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

    // If consentAccepted is explicitly false (when sent from browser form), reject
    if (consentAccepted === false) {
      return NextResponse.json(
        { error: "Please accept the Privacy Policy and User Agreement to proceed." },
        { status: 400 }
      );
    }

    const cleanMobile = normalizePhone(mobile);
    const rawMobileTrimmed = mobile.trim();
    const cleanEmail = email && typeof email === "string" && email.trim() ? email.trim().toLowerCase() : null;

    // Find an active staff user for assignment / follow-up FK integrity
    const [salesUser, fallbackStaffUser, existingCustomer, existingLead] = await Promise.all([
      prisma.user.findFirst({
        where: { role: "SALES_EXECUTIVE", status: "ACTIVE" },
        select: { id: true, name: true },
      }),
      prisma.user.findFirst({
        where: {
          role: { in: ["ADMIN", "SUPER_ADMIN", "MANAGER"] },
          status: "ACTIVE",
        },
        select: { id: true, name: true },
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
      prisma.lead.findFirst({
        where: {
          OR: [{ mobile: cleanMobile }, { mobile: rawMobileTrimmed }],
        },
      }),
    ]);

    const assignee = salesUser || fallbackStaffUser;
    const contextNoteParts = [
      message ? String(message).trim() : null,
      preferredContact ? `Preferred Contact: ${preferredContact}` : null,
      sourcePage ? `Source Page: ${sourcePage}` : null,
      language ? `Lang: ${language}` : null,
    ].filter(Boolean);
    const enrichedNotes = contextNoteParts.length > 0 ? contextNoteParts.join(" | ") : null;

    if (existingLead) {
      // Update existing lead with latest package interest & notes
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          packageInterest: packageInterest || existingLead.packageInterest,
          travelDate: travelDate || existingLead.travelDate,
          adults: Number(adults) || existingLead.adults,
          children: Number(children) ?? existingLead.children,
          customerId: existingLead.customerId || existingCustomer?.id || null,
          notes: enrichedNotes
            ? existingLead.notes
              ? `${existingLead.notes}\n[${new Date().toISOString().slice(0, 10)}] ${enrichedNotes}`
              : enrichedNotes
            : existingLead.notes,
        },
      });

      // Append activity to existing lead
      await prisma.leadActivity.create({
        data: {
          leadId: existingLead.id,
          userId: assignee?.id || existingLead.assignedToId || null,
          type: "NOTE",
          description: `Repeat inquiry submitted for ${packageInterest || "Package"}. ${enrichedNotes || ""}`,
        },
      });

      // Create new follow up ONLY when a valid User ID exists (fixes FK constraint crash)
      const validFollowUpUserId = existingLead.assignedToId || assignee?.id || null;
      if (validFollowUpUserId) {
        await prisma.followUp.create({
          data: {
            leadId: existingLead.id,
            userId: validFollowUpUserId,
            date: new Date().toISOString().split("T")[0],
            time: "10:30",
            type: preferredContact === "WHATSAPP" ? "WHATSAPP" : "CALL",
            priority: "HIGH",
            notes: `Follow up with repeat inquiry from ${name.trim()} for ${packageInterest || "Umrah Package"}.`,
            status: "PENDING",
          },
        });
      }

      return NextResponse.json({
        success: true,
        isExisting: true,
        leadNumber: existingLead.leadNumber,
        id: existingLead.id,
      });
    }

    // Generate unique Lead Number ALL-2026-XXXX
    const count = await prisma.lead.count();
    let leadNumber = `ALL-2026-${String(count + 1).padStart(4, "0")}`;
    const collision = await prisma.lead.findUnique({ where: { leadNumber }, select: { id: true } });
    if (collision) {
      leadNumber = `ALL-2026-${String(count + 1).padStart(4, "0")}-${Date.now().toString().slice(-3)}`;
    }

    const newLead = await prisma.lead.create({
      data: {
        leadNumber,
        name: name.trim(),
        mobile: cleanMobile,
        whatsapp: whatsapp && String(whatsapp).trim() ? normalizePhone(String(whatsapp)) : cleanMobile,
        email: cleanEmail,
        city: city ? String(city).trim() : "Pune",
        journeyType: journeyType || "UMRAH",
        packageInterest: packageInterest || "Umrah Platinum Package",
        travelDate: travelDate || null,
        adults: Number(adults) || 1,
        children: Number(children) || 0,
        budget: budget || null,
        notes: enrichedNotes,
        source: utmSource || "Website",
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        assignedToId: assignee?.id || null,
        customerId: existingCustomer?.id || null,
        status: "NEW",
      },
    });

    // Create Initial Activity
    await prisma.leadActivity.create({
      data: {
        leadId: newLead.id,
        userId: assignee?.id || null,
        type: "NOTE",
        description: `Lead created via website (${sourcePage || "/"}). Assigned to ${assignee?.name || "Unassigned"}.`,
      },
    });

    // CRM Automation: Auto create "Contact new lead" task
    if (assignee) {
      await prisma.task.create({
        data: {
          title: `Contact new lead: ${newLead.name} (${newLead.leadNumber})`,
          description: `Inquired about ${newLead.packageInterest}. Phone: ${newLead.mobile}. Preferred: ${preferredContact || "WHATSAPP"}`,
          priority: "HIGH",
          status: "PENDING",
          assignedToId: assignee.id,
          leadId: newLead.id,
        },
      });

      await prisma.notification.create({
        data: {
          userId: assignee.id,
          title: `New Lead: ${newLead.name}`,
          message: `${newLead.name} inquired for ${newLead.packageInterest}. Phone: ${newLead.mobile}`,
          type: "LEAD",
          link: `/admin/crm/leads/${newLead.id}`,
        },
      });
    }

    await logAudit({
      userId: null,
      action: "CREATE_LEAD",
      entity: "Lead",
      entityId: newLead.id,
      details: {
        leadNumber,
        name: newLead.name,
        mobile: cleanMobile,
        packageId: packageId || null,
        packageInterest: newLead.packageInterest,
        source: utmSource || "Website",
        sourcePage: sourcePage || "/",
        consentAccepted: Boolean(consentAccepted),
        agreementVersion: "v1.0",
      },
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      leadNumber,
      id: newLead.id,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
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

    const where: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { mobile: { contains: search } },
        { email: { contains: search } },
        { leadNumber: { contains: search } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        _count: { select: { activities: true, followUps: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

