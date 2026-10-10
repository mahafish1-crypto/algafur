import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, ["documents:approve", "documents:edit"]);
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const resolvedParams = await params;
    const body = await req.json();

    const updated = await prisma.document.update({
      where: { id: resolvedParams.id },
      data: {
        status: body.status,
        rejectionReason: body.rejectionReason,
        verifiedById: session.id,
        verifiedAt: body.status === "VERIFIED" ? new Date() : null,
      },
    });

    await logAudit({
      userId: session.id,
      action: "VERIFY_DOCUMENT",
      entity: "Document",
      entityId: updated.id,
      details: { status: body.status, reason: body.rejectionReason },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
