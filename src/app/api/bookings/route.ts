import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { PACKAGES_CACHE_TAG } from "@/lib/packages-data";
import { checkRateLimit, getClientIp, sanitizeString } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Rate limit: Max 5 booking creation requests per 10 minutes per IP
    const rateCheck = checkRateLimit(`booking_submit_${ip}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many reservation attempts. Please wait a few minutes or contact us directly on WhatsApp.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      packageId,
      customer,
      travellers,
      adults,
      children,
      roomType,
      totalAmount,
      advanceAmount,
      paidAmount,
      paymentOption,
      paymentMethod,
      transactionId,
    } = body;

    if (!packageId || !customer?.name || !customer?.phone) {
      return NextResponse.json(
        { error: "Package and customer details are required." },
        { status: 400 }
      );
    }

    const cleanCustomerName = sanitizeString(customer.name, 120);
    const cleanCustomerCity = sanitizeString(customer.city || "Pune", 80);
    const cleanCustomerAddress = sanitizeString(customer.address || "", 300);
    const cleanCustomerEmail = customer.email
      ? sanitizeString(customer.email, 120).toLowerCase()
      : null;
    const cleanPhone = String(customer.phone).trim();

    // 1. Find or create Customer
    let dbCustomer = await prisma.customer.findFirst({
      where: { phone: cleanPhone },
    });

    if (!dbCustomer) {
      const custCount = await prisma.customer.count();
      const customerCode = `ALC-2026-${String(custCount + 1).padStart(4, "0")}`;
      dbCustomer = await prisma.customer.create({
        data: {
          customerCode,
          name: cleanCustomerName,
          phone: cleanPhone,
          whatsapp: customer.whatsapp ? String(customer.whatsapp).trim() : cleanPhone,
          email: cleanCustomerEmail,
          city: cleanCustomerCity,
          address: cleanCustomerAddress || null,
          passportNumber: travellers?.[0]?.passportNumber
            ? sanitizeString(travellers[0].passportNumber, 30)
            : null,
        },
      });
    }

    // 2. Pre-compute Counts in Parallel to Preserve Exact Identifier Formats
    const [bookingCount, invoiceCount, paymentCount, adminUser] = await Promise.all([
      prisma.booking.count(),
      prisma.invoice.count(),
      paidAmount && paidAmount > 0 ? prisma.payment.count() : Promise.resolve(0),
      prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      }),
    ]);

    let bookingNumber = `ALG-2026-${String(bookingCount + 1).padStart(5, "0")}`;
    let invoiceNumber = `ALI-2026-${String(invoiceCount + 1).padStart(5, "0")}`;
    let candidateReceipt =
      paidAmount && paidAmount > 0
        ? `ALR-2026-${String(paymentCount + 1).padStart(5, "0")}`
        : null;

    const [existingB, existingInv, existingPay] = await Promise.all([
      prisma.booking.findUnique({ where: { bookingNumber }, select: { id: true } }),
      prisma.invoice.findUnique({ where: { invoiceNumber }, select: { id: true } }),
      candidateReceipt
        ? prisma.payment.findUnique({
            where: { receiptNumber: candidateReceipt },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (existingB) {
      bookingNumber = `ALG-2026-${String(bookingCount + 1).padStart(5, "0")}-${Date.now().toString().slice(-4)}`;
    }
    if (existingInv) {
      invoiceNumber = `ALI-2026-${String(invoiceCount + 1).padStart(5, "0")}-${Date.now().toString().slice(-4)}`;
    }
    if (candidateReceipt && existingPay) {
      candidateReceipt = `ALR-2026-${String(paymentCount + 1).padStart(5, "0")}-${Date.now().toString().slice(-4)}`;
    }

    const outstanding = Math.max(0, totalAmount - (paidAmount || 0));
    const paymentStatus =
      outstanding === 0
        ? "PAID"
        : paidAmount > 0
        ? "PARTIALLY_PAID"
        : "PENDING";

    const seatsToBook = (Number(adults) || 1) + (Number(children) || 0);
    const validTravellers = Array.isArray(travellers)
      ? travellers.filter((t: any) => Boolean(t?.fullName))
      : [];

    // 3. Execute Booking + Travellers + Seat Increment + Invoice + Payment Atomically
    const newBooking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: dbCustomer.id,
          packageId,
          adults: Number(adults) || 1,
          children: Number(children) || 0,
          roomType: roomType || "QUAD",
          totalAmount: Number(totalAmount),
          advanceAmount: Number(advanceAmount) || 0,
          paidAmount: Number(paidAmount) || 0,
          outstandingAmount: outstanding,
          paymentStatus,
          bookingStatus: "CONFIRMED",
        },
      });

      if (validTravellers.length > 0) {
        await tx.bookingTraveller.createMany({
          data: validTravellers.map((t: any) => ({
            bookingId: createdBooking.id,
            fullName: sanitizeString(t.fullName, 120),
            passportNumber: t.passportNumber
              ? sanitizeString(t.passportNumber, 30)
              : null,
            gender: t.gender || "MALE",
            roomType: roomType || "QUAD",
            visaStatus: "NOT_STARTED",
          })),
        });
      }

      await tx.package.update({
        where: { id: packageId },
        data: {
          bookedSeats: {
            increment: seatsToBook,
          },
        },
      });

      await tx.invoice.create({
        data: {
          invoiceNumber,
          bookingId: createdBooking.id,
          customerId: dbCustomer.id,
          subtotal: Number(totalAmount),
          total: Number(totalAmount),
          paidAmount: Number(paidAmount) || 0,
          balanceDue: outstanding,
          status: outstanding === 0 ? "PAID" : "ISSUED",
        },
      });

      if (candidateReceipt && paidAmount && paidAmount > 0) {
        await tx.payment.create({
          data: {
            receiptNumber: candidateReceipt,
            bookingId: createdBooking.id,
            customerId: dbCustomer.id,
            amount: Number(paidAmount),
            paymentMethod: paymentMethod || "BANK_TRANSFER",
            transactionId: transactionId ? sanitizeString(transactionId, 100) : null,
            status: "PAID",
            notes: `Online reservation payment (${sanitizeString(paymentOption || "", 50)})`,
          },
        });
      }

      return createdBooking;
    });

    // 4. Create Notification & Audit Log
    if (adminUser) {
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          title: `New Booking: ${bookingNumber}`,
          message: `${dbCustomer.name} booked ${seatsToBook} seat(s). Amount: ₹${paidAmount}`,
          type: "BOOKING",
          link: `/admin/bookings`,
        },
      });
    }

    await logAudit({
      userId: null,
      action: "CREATE_BOOKING",
      entity: "Booking",
      entityId: newBooking.id,
      details: { bookingNumber, customer: dbCustomer.name, totalAmount, paidAmount },
    });

    if (body.acceptedTerms) {
      await logAudit({
        userId: null,
        action: "ACCEPT_BOOKING_AGREEMENT",
        entity: "UserAgreement",
        entityId: newBooking.id,
        details: {
          bookingNumber,
          customerId: dbCustomer.id,
          customerName: dbCustomer.name,
          agreementVersion: body.agreementVersion || "v1.0",
          acceptedAt: new Date().toISOString(),
        },
      });
    }

    try {
      revalidateTag(PACKAGES_CACHE_TAG);
      revalidatePath("/");
      revalidatePath("/packages");
      revalidatePath("/booking");
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json({
      success: true,
      bookingId: newBooking.id,
      bookingNumber,
      receiptNumber: candidateReceipt,
      customerId: dbCustomer.id,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
