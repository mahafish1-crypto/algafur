import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "view:payments");
    if (!auth.authorized) return auth.response;

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");
    const method = searchParams.get("method");

    const where: Record<string, unknown> = {};
    if (method && method !== "ALL") {
      where.paymentMethod = method;
    }
    if (search) {
      where.OR = [
        { receiptNumber: { contains: search } },
        { transactionId: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { booking: { bookingNumber: { contains: search } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            totalAmount: true,
            paidAmount: true,
            outstandingAmount: true,
            package: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json({ success: true, payments });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:payments");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body = await req.json();
    const { bookingId, amount, paymentMethod, transactionId, notes } = body;

    if (!bookingId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Booking ID and valid amount are required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Generate Receipt Number
    const count = await prisma.payment.count();
    const receiptNumber = `ALR-2026-${String(count + 101).padStart(5, "0")}`;

    const numAmount = parseFloat(amount);
    const newPaidAmount = booking.paidAmount + numAmount;
    const newOutstanding = Math.max(0, booking.totalAmount - newPaidAmount);
    const newPaymentStatus =
      newOutstanding <= 0
        ? "PAID"
        : newPaidAmount > 0
        ? "PARTIALLY_PAID"
        : "PENDING";

    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          receiptNumber,
          bookingId: booking.id,
          customerId: booking.customerId,
          amount: numAmount,
          paymentMethod: paymentMethod || "BANK_TRANSFER",
          transactionId: transactionId || null,
          status: "PAID",
          notes: notes || null,
          createdById: session.id,
        },
        include: {
          customer: true,
          booking: true,
        },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: newOutstanding,
          paymentStatus: newPaymentStatus,
        },
      }),
    ]);

    await logAudit({
      userId: session.id,
      action: "RECORD_PAYMENT",
      entity: "Payment",
      entityId: payment.id,
      details: {
        receiptNumber,
        amount: numAmount,
        bookingNumber: booking.bookingNumber,
        method: paymentMethod,
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
