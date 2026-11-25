import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";
import { computeQuotationTotals } from "@/lib/quotation-math";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "view:quotations");
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        lead: true,
        package: {
          include: {
            inclusions: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, quotation });
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
    const auth = await requireAuth(req, "manage:quotations");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const body = await req.json();

    const calc = computeQuotationTotals({
      roomType: body.roomType ?? existing.roomType,
      adultCount: body.adultCount !== undefined ? Number(body.adultCount) : existing.adultCount,
      adultUnitPrice:
        body.adultUnitPrice !== undefined ? Number(body.adultUnitPrice) : existing.adultUnitPrice,
      childWithBedCount:
        body.childWithBedCount !== undefined
          ? Number(body.childWithBedCount)
          : existing.childWithBedCount,
      childWithBedPrice:
        body.childWithBedPrice !== undefined
          ? Number(body.childWithBedPrice)
          : existing.childWithBedPrice,
      childNoBedCount:
        body.childNoBedCount !== undefined
          ? Number(body.childNoBedCount)
          : existing.childNoBedCount,
      childNoBedPrice:
        body.childNoBedPrice !== undefined
          ? Number(body.childNoBedPrice)
          : existing.childNoBedPrice,
      infantCount:
        body.infantCount !== undefined ? Number(body.infantCount) : existing.infantCount,
      infantPrice:
        body.infantPrice !== undefined ? Number(body.infantPrice) : existing.infantPrice,
      discountType: body.discountType ?? existing.discountType,
      discountValue:
        body.discountValue !== undefined ? Number(body.discountValue) : existing.discountValue,
      discountReason:
        body.discountReason !== undefined ? body.discountReason : existing.discountReason,
      taxPercent: body.taxPercent !== undefined ? Number(body.taxPercent) : existing.taxPercent,
      additionalCharges:
        body.additionalCharges !== undefined
          ? Number(body.additionalCharges)
          : existing.additionalCharges,
      additionalChargesNote:
        body.additionalChargesNote !== undefined
          ? body.additionalChargesNote
          : existing.additionalChargesNote,
      advanceRequired:
        body.advanceRequired !== undefined
          ? Number(body.advanceRequired)
          : existing.advanceRequired,
    });

    const quotation = await prisma.quotation.update({
      where: { id },
      data: {
        customerId: body.customerId !== undefined ? body.customerId || null : existing.customerId,
        leadId: body.leadId !== undefined ? body.leadId || null : existing.leadId,
        packageId: body.packageId || existing.packageId,
        customerName:
          body.customerName !== undefined
            ? body.customerName
              ? String(body.customerName).trim()
              : null
            : existing.customerName,
        customerPhone:
          body.customerPhone !== undefined
            ? body.customerPhone
              ? String(body.customerPhone).trim()
              : null
            : existing.customerPhone,
        customerWhatsapp:
          body.customerWhatsapp !== undefined
            ? body.customerWhatsapp
              ? String(body.customerWhatsapp).trim()
              : null
            : existing.customerWhatsapp,
        customerEmail:
          body.customerEmail !== undefined
            ? body.customerEmail
              ? String(body.customerEmail).trim()
              : null
            : existing.customerEmail,
        customerCity:
          body.customerCity !== undefined
            ? body.customerCity
              ? String(body.customerCity).trim()
              : null
            : existing.customerCity,
        travellersCount: calc.travellersCount,
        roomType: calc.roomType,
        adultCount: calc.adultCount,
        adultUnitPrice: calc.adultUnitPrice,
        childWithBedCount: calc.childWithBedCount,
        childWithBedPrice: calc.childWithBedPrice,
        childNoBedCount: calc.childNoBedCount,
        childNoBedPrice: calc.childNoBedPrice,
        infantCount: calc.infantCount,
        infantPrice: calc.infantPrice,
        subtotal: calc.subtotal,
        discount: calc.discountAmount,
        discountType: calc.discountType,
        discountValue: calc.discountValue,
        discountAmount: calc.discountAmount,
        discountReason:
          body.discountReason !== undefined
            ? body.discountReason
              ? String(body.discountReason).trim()
              : null
            : existing.discountReason,
        tax: calc.gstAmount,
        taxPercent: calc.taxPercent,
        gstAmount: calc.gstAmount,
        additionalCharges: calc.additionalCharges,
        additionalChargesNote:
          body.additionalChargesNote !== undefined
            ? body.additionalChargesNote
              ? String(body.additionalChargesNote).trim()
              : null
            : existing.additionalChargesNote,
        total: calc.total,
        advanceRequired: calc.advanceRequired,
        balanceAmount: calc.balanceAmount,
        balanceDueDate:
          body.balanceDueDate !== undefined
            ? body.balanceDueDate
              ? new Date(body.balanceDueDate)
              : null
            : existing.balanceDueDate,
        departureDate:
          body.departureDate !== undefined
            ? body.departureDate
              ? String(body.departureDate).trim()
              : null
            : existing.departureDate,
        departureCity:
          body.departureCity !== undefined
            ? body.departureCity
              ? String(body.departureCity).trim()
              : null
            : existing.departureCity,
        specialNotes:
          body.specialNotes !== undefined
            ? body.specialNotes
              ? String(body.specialNotes).trim()
              : null
            : existing.specialNotes,
        terms: body.terms !== undefined ? body.terms : existing.terms,
        validUntil:
          body.validUntil !== undefined
            ? body.validUntil
              ? new Date(body.validUntil)
              : null
            : existing.validUntil,
        status: body.status || existing.status,
        lineItemsJson: calc.lineItemsJson as any,
      },
      include: {
        customer: true,
        lead: true,
        package: true,
      },
    });

    await logAudit({
      userId: session.id,
      action: "UPDATE_QUOTATION",
      entity: "Quotation",
      entityId: quotation.id,
      details: {
        quotationNumber: quotation.quotationNumber,
        total: calc.total,
        discountAmount: calc.discountAmount,
      },
    });

    try {
      revalidatePath("/admin/quotations");
      revalidatePath(`/admin/quotations/${id}`);
      revalidatePath(`/admin/quotations/${id}/edit`);
    } catch {}

    return NextResponse.json({ success: true, quotation });
  } catch (error: unknown) {
    console.error("Error updating quotation:", error);
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "manage:quotations");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    await prisma.quotation.delete({ where: { id } });

    await logAudit({
      userId: session.id,
      action: "DELETE_QUOTATION",
      entity: "Quotation",
      entityId: id,
      details: { quotationNumber: existing.quotationNumber },
    });

    try {
      revalidatePath("/admin/quotations");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
