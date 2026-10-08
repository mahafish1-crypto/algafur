import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await getSession();

    const document = await prisma.document.create({
      data: {
        customerId: body.customerId,
        bookingId: body.bookingId || null,
        type: body.type || "PASSPORT",
        fileName: body.fileName || "document.pdf",
        fileUrl: body.fileUrl || "/uploads/sample.pdf",
        status: "UPLOADED",
      },
    });

    await logAudit({
      userId: session?.id || null,
      action: "UPLOAD_DOCUMENT",
      entity: "Document",
      entityId: document.id,
      details: { type: document.type, customerId: document.customerId },
    });

    return NextResponse.json({ success: true, document });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

