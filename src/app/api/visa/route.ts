import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { passportNumber: { contains: search } },
        { visaNumber: { contains: search } },
        { applicationNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const applications = await prisma.visaApplication.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsapp: true,
            passportNumber: true,
            passportExpiry: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            journeyType: true,
            package: {
              select: {
                id: true,
                name: true,
                departureDate: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    const { customerId, bookingId, passportNumber, applicationNumber, notes, assignedToId } = body;

    if (!customerId || !passportNumber) {
      return NextResponse.json(
        { error: "Customer and Passport Number are required" },
        { status: 400 }
      );
    }

    const application = await prisma.visaApplication.create({
      data: {
        customerId,
        bookingId: bookingId || null,
        passportNumber,
        applicationNumber: applicationNumber || null,
        status: "DOCUMENTS_PENDING",
        notes: notes || null,
        assignedToId: assignedToId || session?.id || null,
      },
      include: {
        customer: true,
      },
    });

    await logAudit({
      userId: session?.id || null,
      action: "CREATE_VISA_APPLICATION",
      entity: "VisaApplication",
      entityId: application.id,
      details: { passportNumber, customerId },
    });

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

