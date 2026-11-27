import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "view:invoices");
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        booking: {
          include: { package: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

async function handleUpdate(
  req: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const auth = await requireAuth(req, "manage:invoices");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const body = await req.json();

    const totalBillAmount =
      body.totalBillAmount !== undefined
        ? Math.max(0, Number(body.totalBillAmount))
        : existing.totalBillAmount || existing.total;

    const paidAmount =
      body.paidAmount !== undefined
        ? Math.max(0, Number(body.paidAmount))
        : existing.paidAmount;

    const advanceAmount =
      body.advanceAmount !== undefined
        ? Math.max(0, Number(body.advanceAmount))
        : existing.advanceAmount;

    const remainingAmount = Math.max(0, totalBillAmount - paidAmount);

    const status =
      body.status ||
      (remainingAmount <= 0 && totalBillAmount > 0 ? "PAID" : existing.status);

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        packageName: body.packageName !== undefined ? body.packageName : existing.packageName,
        customerName: body.customerName !== undefined ? body.customerName : existing.customerName,
        customerPhone:
          body.customerPhone !== undefined ? body.customerPhone : existing.customerPhone,
        customerCity: body.customerCity !== undefined ? body.customerCity : existing.customerCity,
        bookingDate: body.bookingDate !== undefined ? body.bookingDate : existing.bookingDate,
        airlines: body.airlines !== undefined ? body.airlines : existing.airlines,
        departure: body.departure !== undefined ? body.departure : existing.departure,
        arrival: body.arrival !== undefined ? body.arrival : existing.arrival,
        days: body.days !== undefined ? Number(body.days) : existing.days,
        roomType: body.roomType !== undefined ? body.roomType : existing.roomType,
        paymentMode: body.paymentMode !== undefined ? body.paymentMode : existing.paymentMode,
        pilgrimsJson: body.pilgrimsJson !== undefined ? body.pilgrimsJson : existing.pilgrimsJson,
        totalBillAmount,
        total: totalBillAmount,
        discountAmount:
          body.discountAmount !== undefined
            ? Number(body.discountAmount)
            : existing.discountAmount,
        discount:
          body.discountAmount !== undefined
            ? Number(body.discountAmount)
            : existing.discount,
        discountReason:
          body.discountReason !== undefined ? body.discountReason : existing.discountReason,
        advanceAmount,
        paidAmount,
        remainingAmount,
        balanceDue: remainingAmount,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        terms: body.terms !== undefined ? body.terms : existing.terms,
        status,
      },
      include: {
        customer: true,
        booking: { include: { package: true } },
      },
    });

    await logAudit({
      userId: session.id,
      action: "UPDATE_INVOICE_RECEIPT",
      entity: "Invoice",
      entityId: id,
      details: {
        invoiceNumber: invoice.invoiceNumber,
        totalBillAmount,
        paidAmount,
        remainingAmount,
      },
    });

    try {
      revalidatePath("/admin/invoices");
      revalidatePath(`/admin/invoices/${id}`);
    } catch {}

    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    console.error("Error updating invoice:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(req, params);
}
