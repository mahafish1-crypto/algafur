import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "view:invoices");
    if (!auth.authorized) return auth.response;

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { booking: { bookingNumber: { contains: search } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            totalAmount: true,
            paidAmount: true,
            outstandingAmount: true,
            paymentStatus: true,
            adults: true,
            roomType: true,
            package: {
              select: {
                id: true,
                name: true,
                durationDays: true,
                departureDate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, invoices });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:invoices");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body = await req.json();
    const { bookingId, dueDate, notes, terms } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if an invoice already exists for this booking to prevent duplicates
    const existingInvoice = await prisma.invoice.findFirst({
      where: { bookingId: booking.id },
    });
    if (existingInvoice) {
      return NextResponse.json(
        { error: `An invoice (${existingInvoice.invoiceNumber}) already exists for this booking.` },
        { status: 409 }
      );
    }

    const count = await prisma.invoice.count();
    const invoiceNumber = `ALI-2026-${String(count + 101).padStart(5, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        bookingId: booking.id,
        customerId: booking.customerId,
        subtotal: booking.totalAmount,
        discount: 0,
        tax: 0,
        total: booking.totalAmount,
        paidAmount: booking.paidAmount,
        balanceDue: booking.outstandingAmount,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 86400000),
        status: booking.outstandingAmount <= 0 ? "PAID" : "ISSUED",
        notes: notes || "Thank you for choosing Al-Gafur International.",
        terms: terms || "Standard Hajj & Umrah package terms apply.",
      },
      include: {
        customer: true,
        booking: {
          include: {
            package: true,
          },
        },
      },
    });

    await logAudit({
      userId: session.id,
      action: "CREATE_INVOICE",
      entity: "Invoice",
      entityId: invoice.id,
      details: { invoiceNumber, bookingNumber: booking.bookingNumber, total: booking.totalAmount },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
