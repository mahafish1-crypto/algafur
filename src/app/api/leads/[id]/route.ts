import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "view:leads");
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        activities: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { createdAt: "desc" },
        },
        followUps: {
          include: { user: { select: { name: true } } },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "manage:leads");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const existing = await prisma.lead.findUnique({
      where: { id },
      include: { assignedTo: { select: { id: true, name: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      status,
      assignedToId,
      notes,
      travelDate,
      packageInterest,
      adults,
      children,
      budget,
      city,
      email,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (assignedToId !== undefined)
      updateData.assignedToId = assignedToId || null;
    if (notes !== undefined) updateData.notes = notes;
    if (travelDate !== undefined) updateData.travelDate = travelDate;
    if (packageInterest !== undefined)
      updateData.packageInterest = packageInterest;
    if (adults !== undefined) updateData.adults = Number(adults);
    if (children !== undefined) updateData.children = Number(children);
    if (budget !== undefined) updateData.budget = budget;
    if (city !== undefined) updateData.city = city;
    if (email !== undefined) updateData.email = email;

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (status && status !== existing.status) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          userId: session.id,
          type: "STATUS_CHANGE",
          description: `Lead status changed from ${existing.status} to ${status} by ${session.name}`,
        },
      });
    }

    if (
      assignedToId !== undefined &&
      assignedToId !== existing.assignedToId
    ) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          userId: session.id,
          type: "NOTE",
          description: `Lead assigned to ${
            lead.assignedTo?.name || "Unassigned"
          } by ${session.name}`,
        },
      });
    }

    await logAudit({
      userId: session.id,
      action: "UPDATE_LEAD",
      entity: "Lead",
      entityId: lead.id,
      details: updateData,
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "manage:leads");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Clean up associated notifications and tasks for this lead
    await Promise.all([
      prisma.notification.deleteMany({
        where: { link: `/admin/crm/leads/${id}` },
      }),
      prisma.task.deleteMany({
        where: { leadId: id },
      }),
    ]);

    await prisma.lead.delete({ where: { id } });

    await logAudit({
      userId: session.id,
      action: "DELETE_LEAD",
      entity: "Lead",
      entityId: id,
      details: { leadNumber: existing.leadNumber, name: existing.name },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
