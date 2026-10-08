import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const application = await prisma.visaApplication.findUnique({
      where: { id: resolvedParams.id },
      include: {
        customer: true,
        booking: {
          include: {
            package: true,
            travellers: true,
          },
        },
        assignedTo: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Visa application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const session = await getSession();

    const data: any = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.applicationNumber !== undefined) data.applicationNumber = body.applicationNumber;
    if (body.visaNumber !== undefined) data.visaNumber = body.visaNumber;
    if (body.passportNumber !== undefined) data.passportNumber = body.passportNumber;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.assignedToId !== undefined) data.assignedToId = body.assignedToId;

    if (body.submissionDate) {
      data.submissionDate = new Date(body.submissionDate);
    }
    if (body.approvalDate) {
      data.approvalDate = new Date(body.approvalDate);
    } else if (body.status === "APPROVED" && !body.approvalDate) {
      data.approvalDate = new Date();
    }
    if (body.expiryDate) {
      data.expiryDate = new Date(body.expiryDate);
    }

    const updated = await prisma.visaApplication.update({
      where: { id: resolvedParams.id },
      data,
      include: {
        customer: true,
        booking: true,
      },
    });

    // If approved and has booking, update traveller visa status
    if (body.status === "APPROVED" && updated.bookingId) {
      await prisma.bookingTraveller.updateMany({
        where: {
          bookingId: updated.bookingId,
          passportNumber: updated.passportNumber,
        },
        data: {
          visaStatus: "APPROVED",
        },
      });
    }

    await logAudit({
      userId: session?.id || null,
      action: "UPDATE_VISA_APPLICATION",
      entity: "VisaApplication",
      entityId: updated.id,
      details: { status: updated.status, visaNumber: updated.visaNumber },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getSession();

    const deleted = await prisma.visaApplication.delete({
      where: { id: resolvedParams.id },
    });

    await logAudit({
      userId: session?.id || null,
      action: "DELETE_VISA_APPLICATION",
      entity: "VisaApplication",
      entityId: deleted.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

