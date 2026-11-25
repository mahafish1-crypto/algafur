import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "manage:quotations");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        lead: true,
        package: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    let targetCustomerId = quotation.customerId;
    if (!targetCustomerId) {
      const fallbackPhone =
        quotation.customerPhone || quotation.lead?.mobile || `99999${Date.now().toString().slice(-5)}`;
      const fallbackName =
        quotation.customerName || quotation.lead?.name || "Confirmed Pilgrim";

      let existingCustomer = await prisma.customer.findFirst({
        where: { phone: fallbackPhone },
      });

      if (!existingCustomer) {
        const custCount = await prisma.customer.count();
        existingCustomer = await prisma.customer.create({
          data: {
            customerCode: `ALC-2026-${String(custCount + 1).padStart(4, "0")}`,
            name: fallbackName,
            phone: fallbackPhone,
            whatsapp: quotation.customerWhatsapp || fallbackPhone,
            email: quotation.customerEmail || quotation.lead?.email || null,
            city: quotation.customerCity || quotation.lead?.city || null,
          },
        });
      }
      targetCustomerId = existingCustomer.id;
    }

    const [bookingCount, invoiceCount] = await Promise.all([
      prisma.booking.count(),
      prisma.invoice.count(),
    ]);

    let bookingNumber = `ALG-2026-${String(bookingCount + 1).padStart(5, "0")}`;
    let invoiceNumber = `ALI-2026-${String(invoiceCount + 1).padStart(5, "0")}`;

    const [existingB, existingInv] = await Promise.all([
      prisma.booking.findUnique({ where: { bookingNumber }, select: { id: true } }),
      prisma.invoice.findUnique({ where: { invoiceNumber }, select: { id: true } }),
    ]);

    if (existingB) {
      bookingNumber = `${bookingNumber}-${Date.now().toString().slice(-4)}`;
    }
    if (existingInv) {
      invoiceNumber = `${invoiceNumber}-${Date.now().toString().slice(-4)}`;
    }

    const adultsCount = Math.max(1, quotation.adultCount || quotation.travellersCount || 1);
    const childrenCount =
      (quotation.childWithBedCount || 0) +
      (quotation.childNoBedCount || 0) +
      (quotation.infantCount || 0);

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: targetCustomerId!,
          packageId: quotation.packageId,
          journeyType: quotation.package?.type || "UMRAH",
          adults: adultsCount,
          children: childrenCount,
          roomType: quotation.roomType || "QUAD",
          totalAmount: quotation.total,
          advanceAmount: quotation.advanceRequired,
          paidAmount: 0,
          outstandingAmount: quotation.total,
          paymentStatus: "PENDING",
          bookingStatus: "CONFIRMED",
          specialRequests: quotation.specialNotes || null,
          notes: `Converted from Quotation ${quotation.quotationNumber}${
            quotation.discountReason ? ` (Discount: ${quotation.discountReason})` : ""
          }`,
          bookedById: session.id,
        },
      });

      await tx.invoice.create({
        data: {
          invoiceNumber,
          bookingId: booking.id,
          customerId: targetCustomerId!,
          subtotal: quotation.subtotal,
          discount: quotation.discountAmount || quotation.discount || 0,
          tax: quotation.gstAmount || quotation.tax || 0,
          total: quotation.total,
          paidAmount: 0,
          balanceDue: quotation.total,
          status: "ISSUED",
          notes: `Generated from Quotation ${quotation.quotationNumber}`,
          terms: quotation.terms || null,
        },
      });

      await tx.quotation.update({
        where: { id },
        data: {
          status: "ACCEPTED",
          customerId: targetCustomerId,
        },
      });

      return booking;
    });

    await logAudit({
      userId: session.id,
      action: "CONVERT_QUOTATION_TO_BOOKING",
      entity: "Quotation",
      entityId: id,
      details: {
        quotationNumber: quotation.quotationNumber,
        bookingId: result.id,
        bookingNumber: result.bookingNumber,
        total: quotation.total,
      },
    });

    try {
      revalidatePath("/admin/quotations");
      revalidatePath(`/admin/quotations/${id}`);
      revalidatePath("/admin/bookings");
      revalidatePath("/admin/invoices");
    } catch {}

    return NextResponse.json({ success: true, booking: result });
  } catch (error: unknown) {
    console.error("Error converting quotation:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
