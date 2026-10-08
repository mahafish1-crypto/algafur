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

    const updated = await prisma.package.update({
      where: { id: resolvedParams.id },
      data: body,
    });

    await logAudit({
      userId: session?.id || null,
      action: "UPDATE_PACKAGE",
      entity: "Package",
      entityId: updated.id,
      details: body,
    });

    return NextResponse.json({ success: true, package: updated });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

