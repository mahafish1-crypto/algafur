import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "manage:leads");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const resolvedParams = await params;
    const body = await req.json();

    const lead = await prisma.lead.update({
      where: { id: resolvedParams.id },
      data: body,
    });

    if (body.status) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          userId: session.id,
          type: "STATUS_CHANGE",
          description: `Stage updated to ${body.status}`,
        },
      });
    }

    await logAudit({
      userId: session.id,
      action: "UPDATE_LEAD",
      entity: "Lead",
      entityId: lead.id,
      details: body,
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
