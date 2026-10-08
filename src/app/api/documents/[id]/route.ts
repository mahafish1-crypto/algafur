import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const session = await getSession();

    const updated = await prisma.document.update({
      where: { id: resolvedParams.id },
      data: {
        status: body.status,
        rejectionReason: body.rejectionReason,
        verifiedById: session?.id || null,
        verifiedAt: body.status === "VERIFIED" ? new Date() : null,
      },
    });

    await logAudit({
      userId: session?.id || null,
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

