import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      mobile,
      whatsapp,
      email,
      city,
      journeyType,
      packageInterest,
      travelDate,
      adults,
      children,
      budget,
      message,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    if (!name || !mobile) {
      return NextResponse.json(
        { error: "Full Name and Mobile Number are required." },
        { status: 400 }
      );
    }

    // Check existing sales user to assign
    const salesUser = await prisma.user.findFirst({
      where: { role: "SALES_EXECUTIVE", status: "ACTIVE" },
    });

    // Check duplicate lead by mobile
    const cleanMobile = mobile.trim();
    let existingLead = await prisma.lead.findFirst({
      where: { mobile: cleanMobile },
    });

    if (existingLead) {
      // Append activity to existing lead
      await prisma.leadActivity.create({
        data: {
          leadId: existingLead.id,
          userId: salesUser?.id || null,
          type: "NOTE",
          description: `Repeat inquiry submitted for ${packageInterest || "Package"}. Notes: ${message || "N/A"}`,
        },
      });

      // Create new follow up
      await prisma.followUp.create({
        data: {
          leadId: existingLead.id,
          userId: salesUser?.id || existingLead.assignedToId || "admin",
          date: new Date().toISOString().split("T")[0],
          time: "10:30",
          type: "CALL",
          priority: "HIGH",
          notes: `Follow up with repeat inquiry from ${name} for ${packageInterest}.`,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        success: true,
        isExisting: true,
        leadNumber: existingLead.leadNumber,
      });
    }

    // Generate unique Lead Number ALL-2026-XXXX
    const count = await prisma.lead.count();
    const leadNumber = `ALL-2026-${String(count + 1).padStart(4, "0")}`;

    const newLead = await prisma.lead.create({
      data: {
        leadNumber,
        name: name.trim(),
        mobile: cleanMobile,
        whatsapp: whatsapp ? whatsapp.trim() : cleanMobile,
        email: email ? email.trim() : null,
        city: city || "Unknown",
        journeyType: journeyType || "UMRAH",
        packageInterest: packageInterest || "Umrah Platinum Package",
        travelDate: travelDate || null,
        adults: Number(adults) || 1,
        children: Number(children) || 0,
        budget: budget || null,
        notes: message || null,
        source: utmSource || "Website",
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        assignedToId: salesUser?.id || null,
        status: "NEW",
      },
    });

    // Create Initial Activity
    await prisma.leadActivity.create({
      data: {
        leadId: newLead.id,
        userId: salesUser?.id || null,
        type: "NOTE",
        description: `Lead created via website form. Assigned to ${salesUser?.name || "Unassigned"}.`,
      },
    });

    // CRM Automation: Auto create "Contact new lead" task
    if (salesUser) {
      await prisma.task.create({
        data: {
          title: `Contact new lead: ${newLead.name} (${newLead.leadNumber})`,
          description: `Inquired about ${newLead.packageInterest}. Phone: ${newLead.mobile}`,
          priority: "HIGH",
          status: "PENDING",
          assignedToId: salesUser.id,
          leadId: newLead.id,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: salesUser.id,
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
      details: { leadNumber, name, mobile: cleanMobile, source: utmSource || "Website" },
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

