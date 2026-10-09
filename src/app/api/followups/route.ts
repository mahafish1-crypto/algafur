import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:leads");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body = await req.json();

    const followUp = await prisma.followUp.create({
      data: {
        leadId: body.leadId || null,
        customerId: body.customerId || null,
        userId: body.userId || session.id,
        date: body.date,
        time: body.time || "11:00",
        type: body.type || "CALL",
        priority: body.priority || "MEDIUM",
        notes: body.notes || "",
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, followUp });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:leads");
    if (!auth.authorized) return auth.response;

    const { id, status } = await req.json();
    const updated = await prisma.followUp.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, followUp: updated });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
