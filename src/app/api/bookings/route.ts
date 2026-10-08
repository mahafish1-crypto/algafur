import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
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

    const cleanPhone = customer.phone.trim();

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
          name: customer.name.trim(),
          phone: cleanPhone,
          whatsapp: customer.whatsapp || cleanPhone,
          email: customer.email || null,
          city: customer.city || "Pune",
          address: customer.address || null,
          passportNumber: travellers?.[0]?.passportNumber || null,
        },
      });
    }

    // 2. Generate Booking Number ALG-2026-XXXXX
    const bookingCount = await prisma.booking.count();
    const bookingNumber = `ALG-2026-${String(bookingCount + 1).padStart(5, "0")}`;

    const outstanding = Math.max(0, totalAmount - (paidAmount || 0));
    const paymentStatus =
      outstanding === 0
        ? "PAID"
        : paidAmount > 0
        ? "PARTIALLY_PAID"
        : "PENDING";

    // 3. Create Booking
    const newBooking = await prisma.booking.create({
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

    // 4. Create Travellers
    if (Array.isArray(travellers) && travellers.length > 0) {
      for (const t of travellers) {
        if (t.fullName) {
          await prisma.bookingTraveller.create({
            data: {
              bookingId: newBooking.id,
              fullName: t.fullName,
              passportNumber: t.passportNumber || null,
              gender: t.gender || "MALE",
              roomType: roomType || "QUAD",
              visaStatus: "NOT_STARTED",
            },
          });
        }
      }
    }

    // 5. Increment booked seats on package
    const seatsToBook = (Number(adults) || 1) + (Number(children) || 0);
    await prisma.package.update({
      where: { id: packageId },
      data: {
        bookedSeats: {
          increment: seatsToBook,
        },
      },
    });

    // 6. Generate Invoice ALI-2026-XXXXX
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `ALI-2026-${String(invoiceCount + 1).padStart(5, "0")}`;
    await prisma.invoice.create({
      data: {
        invoiceNumber,
        bookingId: newBooking.id,
        customerId: dbCustomer.id,
        subtotal: Number(totalAmount),
        total: Number(totalAmount),
        paidAmount: Number(paidAmount) || 0,
        balanceDue: outstanding,
        status: outstanding === 0 ? "PAID" : "ISSUED",
      },
    });

    // 7. If payment made, generate Payment & Receipt ALR-2026-XXXXX
    let receiptNumber = null;
    if (paidAmount && paidAmount > 0) {
      const paymentCount = await prisma.payment.count();
      receiptNumber = `ALR-2026-${String(paymentCount + 1).padStart(5, "0")}`;
      await prisma.payment.create({
        data: {
          receiptNumber,
          bookingId: newBooking.id,
          customerId: dbCustomer.id,
          amount: Number(paidAmount),
          paymentMethod: paymentMethod || "BANK_TRANSFER",
          transactionId: transactionId || null,
          status: "PAID",
          notes: `Online reservation payment (${paymentOption})`,
        },
      });
    }

    // 8. Create Notification for Admin
    const adminUser = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });
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

    return NextResponse.json({
      success: true,
      bookingId: newBooking.id,
      bookingNumber,
      receiptNumber,
      customerId: dbCustomer.id,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

