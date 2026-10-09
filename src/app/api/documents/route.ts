import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body = await req.json();

    if (!body.customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // IDOR Protection: Customers cannot upload documents for other customer IDs
    if (session.role === "CUSTOMER" && session.customerId && session.customerId !== body.customerId) {
      return NextResponse.json({ error: "Access denied. Cannot upload for another account." }, { status: 403 });
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: body.customerId },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

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
      userId: session.id,
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
