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

    // Check if an invoice already exists for this quotation
    const existingInvoice = await prisma.invoice.findFirst({
      where: { quotationId: quotation.id },
    });

    if (existingInvoice) {
      return NextResponse.json({
        success: true,
        invoice: existingInvoice,
        alreadyExists: true,
      });
    }

    const clientName =
      quotation.customerName ||
      quotation.customer?.name ||
      quotation.lead?.name ||
      "Haji Pilgrim";
    const clientPhone =
      quotation.customerPhone ||
      quotation.customer?.phone ||
      quotation.lead?.mobile ||
      "";
    const clientCity =
      quotation.customerCity ||
      quotation.customer?.city ||
      quotation.lead?.city ||
      "";

    const totalPax = Math.max(1, quotation.travellersCount || 1);
    const perPaxApprox = Math.round(quotation.total / totalPax);

    const pilgrimsJson = Array.from({ length: totalPax }, (_, idx) => ({
      srNo: idx + 1,
      name: idx === 0 ? clientName : "",
      passportNo: "",
      contactNo: idx === 0 ? clientPhone : "",
      amount: idx === 0 ? quotation.total : 0,
    }));

    // Ensure first row doesn't overstate if user splits manually; keep clean default
    if (totalPax > 1) {
      pilgrimsJson.forEach((row, idx) => {
        row.amount = idx === totalPax - 1
          ? Math.max(0, quotation.total - perPaxApprox * (totalPax - 1))
          : perPaxApprox;
      });
    }

    const count = await prisma.invoice.count();
    let invoiceNumber = `ALI-2026-${String(count + 101).padStart(5, "0")}`;
    const numTaken = await prisma.invoice.findUnique({
      where: { invoiceNumber },
      select: { id: true },
    });
    if (numTaken) {
      invoiceNumber = `${invoiceNumber}-${Date.now().toString().slice(-4)}`;
    }

    const discountAmt = quotation.discountAmount || quotation.discount || 0;
    const totalBill = quotation.total;
    const advanceAmt = quotation.advanceRequired || 0;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: quotation.customerId || null,
        quotationId: quotation.id,
        packageName: quotation.package?.name || "Umrah Package",
        customerName: clientName,
        customerPhone: clientPhone,
        customerCity: clientCity,
        bookingDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        airlines: quotation.package?.airline || "Saudi / Air India",
        departure:
          quotation.departureCity ||
          quotation.package?.departureCity ||
          "Mumbai (BOM)",
        arrival: quotation.package?.arrivalAirport || "Jeddah (JED) / Madinah",
        days: quotation.package?.durationDays || 15,
        roomType: quotation.roomType || "QUAD",
        paymentMode: "BANK_TRANSFER",
        pilgrimsJson: pilgrimsJson as any,
        subtotal: quotation.subtotal,
        discount: discountAmt,
        discountAmount: discountAmt,
        discountReason: quotation.discountReason || null,
        tax: quotation.gstAmount || quotation.tax || 0,
        total: totalBill,
        totalBillAmount: totalBill,
        advanceAmount: advanceAmt,
        paidAmount: 0,
        balanceDue: totalBill,
        remainingAmount: totalBill,
        dueDate: quotation.balanceDueDate || new Date(Date.now() + 14 * 86400000),
        status: "ISSUED",
        notes: quotation.specialNotes || `Generated from Quotation ${quotation.quotationNumber}`,
        terms: quotation.terms || null,
      },
    });

    await logAudit({
      userId: session.id,
      action: "CONVERT_QUOTATION_TO_INVOICE",
      entity: "Invoice",
      entityId: invoice.id,
      details: {
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
        invoiceNumber: invoice.invoiceNumber,
        totalBillAmount: totalBill,
      },
    });

    try {
      revalidatePath("/admin/invoices");
      revalidatePath("/admin/quotations");
      revalidatePath(`/admin/quotations/${quotation.id}`);
    } catch {}

    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    console.error("Error converting quotation to invoice:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
