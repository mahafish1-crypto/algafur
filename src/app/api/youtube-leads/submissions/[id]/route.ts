import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { parseSubmittedAnswers, sanitizeTextValue } from "@/lib/youtube-leads";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "youtube_leads:view");
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;
    const [submission, auditLogs, staffUsers] = await Promise.all([
      prisma.leadFormSubmission.findFirst({
        where: {
          OR: [{ id }, { submissionCode: id }],
        },
        include: {
          form: true,
          assignedTo: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.findMany({
        where: {
          entity: "LeadFormSubmission",
          entityId: id,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.user.findMany({
        where: {
          status: "ACTIVE",
          role: { notIn: ["CUSTOMER", "AGENT"] },
        },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: "asc" },
      }),
    ]);

    if (!submission) {
      return NextResponse.json(
        { error: "Lead response not found" },
        { status: 404 }
      );
    }

    const history = auditLogs.map((log) => {
      let parsed: Record<string, any> = {};
      if (log.details) {
        try {
          parsed = JSON.parse(log.details);
        } catch {
          parsed = { note: log.details };
        }
      }
      return {
        id: log.id,
        action: log.action,
        note: parsed.note || parsed.description || log.action,
        oldStatus: parsed.oldStatus || null,
        newStatus: parsed.newStatus || null,
        followUpDate: parsed.followUpDate || null,
        performedBy: log.user?.name || parsed.performedBy || "System",
        createdAt: log.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      submission: {
        ...submission,
        answers: parseSubmittedAnswers(submission.answersJson),
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
      },
      history,
      staffUsers,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch lead response";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "youtube_leads:edit");
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;
    const existing = await prisma.leadFormSubmission.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Lead response not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    const activityNotes: string[] = [];

    if (body.status !== undefined && body.status !== existing.status) {
      const cleanStatus = sanitizeTextValue(body.status, 50).toUpperCase();
      updateData.status = cleanStatus;
      activityNotes.push(
        `Status updated from ${existing.status} to ${cleanStatus}`
      );
    }

    if (body.assignedToId !== undefined) {
      const newAssigneeId = body.assignedToId ? String(body.assignedToId) : null;
      if (newAssigneeId !== existing.assignedToId) {
        updateData.assignedToId = newAssigneeId;
        if (newAssigneeId) {
          const user = await prisma.user.findUnique({
            where: { id: newAssigneeId },
            select: { name: true },
          });
          activityNotes.push(`Assigned to ${user?.name || "Staff Member"}`);
        } else {
          activityNotes.push("Unassigned from staff");
        }
      }
    }

    if (body.followUpDate !== undefined) {
      const cleanDate = body.followUpDate
        ? sanitizeTextValue(body.followUpDate, 30)
        : null;
      if (cleanDate !== existing.followUpDate) {
        updateData.followUpDate = cleanDate;
        activityNotes.push(
          cleanDate
            ? `Scheduled follow-up for ${cleanDate}`
            : "Cleared follow-up date"
        );
      }
    }

    if (body.followUpNotes !== undefined) {
      const cleanFollowUpNotes =
        sanitizeTextValue(body.followUpNotes, 1000) || null;
      updateData.followUpNotes = cleanFollowUpNotes;
    }

    if (body.internalNotes !== undefined) {
      const cleanInternalNotes =
        sanitizeTextValue(body.internalNotes, 2000) || null;
      if (cleanInternalNotes !== existing.internalNotes) {
        updateData.internalNotes = cleanInternalNotes;
        activityNotes.push("Updated internal staff notes");
      }
    }

    if (body.activityNote) {
      const customNote = sanitizeTextValue(body.activityNote, 1000);
      if (customNote) {
        activityNotes.push(customNote);
        // Append to internalNotes if requested
        if (body.appendToInternalNotes) {
          const timestamp = new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });
          const line = `[${timestamp} - ${auth.session.name}]: ${customNote}`;
          updateData.internalNotes = existing.internalNotes
            ? `${line}\n${existing.internalNotes}`
            : line;
        }
      }
    }

    const updated = await prisma.leadFormSubmission.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (activityNotes.length > 0 || body.activityAction) {
      await logAudit({
        userId: auth.session.id,
        action: body.activityAction || "YOUTUBE_LEAD_UPDATE",
        entity: "LeadFormSubmission",
        entityId: existing.id,
        details: {
          oldStatus: existing.status,
          newStatus: updated.status,
          followUpDate: updated.followUpDate,
          performedBy: auth.session.name,
          note: activityNotes.join(" • ") || "Updated lead details",
        },
      });
    }

    return NextResponse.json({
      success: true,
      submission: {
        ...updated,
        answers: parseSubmittedAnswers(updated.answersJson),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to update lead response";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "youtube_leads:delete");
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;
    const existing = await prisma.leadFormSubmission.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Lead response not found" },
        { status: 404 }
      );
    }

    await prisma.leadFormSubmission.delete({
      where: { id: existing.id },
    });

    await logAudit({
      userId: auth.session.id,
      action: "DELETE_YOUTUBE_LEAD",
      entity: "LeadFormSubmission",
      entityId: existing.id,
      details: {
        submissionCode: existing.submissionCode,
        name: existing.name,
        phone: existing.phone,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to delete lead response";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

