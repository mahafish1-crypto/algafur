import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";
import { computeQuotationTotals } from "@/lib/quotation-math";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "view:quotations");
    if (!auth.authorized) return auth.response;

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { quotationNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search, mode: "insensitive" } } },
        { lead: { name: { contains: search, mode: "insensitive" } } },
        { package: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, whatsapp: true, email: true, city: true },
        },
        lead: {
          select: { id: true, name: true, mobile: true, email: true, city: true },
        },
        package: {
          select: {
            id: true,
            name: true,
            type: true,
            durationDays: true,
            makkahNights: true,
            madinahNights: true,
            makkahHotelName: true,
            madinahHotelName: true,
            makkahDistance: true,
            madinahDistance: true,
            makkahMealPlan: true,
            madinahMealPlan: true,
            airline: true,
            flightType: true,
            departureDate: true,
            departureCity: true,
            inclusions: true,
          },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, quotations });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:quotations");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body = await req.json();

    const {
      customerId,
      leadId,
      packageId,
      customerName,
      customerPhone,
      customerWhatsapp,
      customerEmail,
      customerCity,
      roomType = "QUAD",
      adultCount,
      adultUnitPrice,
      travellersCount,
      childWithBedCount = 0,
      childWithBedPrice = 0,
      childNoBedCount = 0,
      childNoBedPrice = 0,
      infantCount = 0,
      infantPrice = 0,
      discountType = "FLAT",
      discountValue,
      discount = 0,
      discountReason = null,
      taxPercent = 0,
      additionalCharges = 0,
      additionalChargesNote = null,
      advanceRequired = 0,
      balanceDueDate = null,
      departureDate = null,
      departureCity = null,
      specialNotes = null,
      terms,
      validUntil,
      status = "SENT",
    } = body;

    if (!packageId) {
      return NextResponse.json({ error: "Package is required" }, { status: 400 });
    }

    // Resolve adult count & unit price if legacy client payload is used
    const effectiveAdultCount =
      adultCount !== undefined ? Number(adultCount) : Number(travellersCount || 1);
    const effectiveAdultUnitPrice =
      adultUnitPrice !== undefined
        ? Number(adultUnitPrice)
        : body.subtotal && effectiveAdultCount > 0
        ? Number(body.subtotal) / effectiveAdultCount
        : 0;
    const effectiveDiscountValue =
      discountValue !== undefined ? Number(discountValue) : Number(discount || 0);

    const calc = computeQuotationTotals({
      roomType,
      adultCount: effectiveAdultCount,
      adultUnitPrice: effectiveAdultUnitPrice,
      childWithBedCount: Number(childWithBedCount),
      childWithBedPrice: Number(childWithBedPrice),
      childNoBedCount: Number(childNoBedCount),
      childNoBedPrice: Number(childNoBedPrice),
      infantCount: Number(infantCount),
      infantPrice: Number(infantPrice),
      discountType,
      discountValue: effectiveDiscountValue,
      discountReason,
      taxPercent: Number(taxPercent),
      additionalCharges: Number(additionalCharges),
      additionalChargesNote,
      advanceRequired: Number(advanceRequired),
    });

    const count = await prisma.quotation.count();
    let quotationNumber = `QT-2026-${String(count + 101).padStart(4, "0")}`;
    const existingNum = await prisma.quotation.findUnique({
      where: { quotationNumber },
      select: { id: true },
    });
    if (existingNum) {
      quotationNumber = `QT-2026-${String(count + 101).padStart(4, "0")}-${Date.now().toString().slice(-4)}`;
    }

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: customerId || null,
        leadId: leadId || null,
        packageId,
        customerName: customerName ? String(customerName).trim() : null,
        customerPhone: customerPhone ? String(customerPhone).trim() : null,
        customerWhatsapp: customerWhatsapp ? String(customerWhatsapp).trim() : null,
        customerEmail: customerEmail ? String(customerEmail).trim() : null,
        customerCity: customerCity ? String(customerCity).trim() : null,
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
        discountReason: discountReason ? String(discountReason).trim() : null,
        tax: calc.gstAmount,
        taxPercent: calc.taxPercent,
        gstAmount: calc.gstAmount,
        additionalCharges: calc.additionalCharges,
        additionalChargesNote: additionalChargesNote ? String(additionalChargesNote).trim() : null,
        total: calc.total,
        advanceRequired: calc.advanceRequired,
        balanceAmount: calc.balanceAmount,
        balanceDueDate: balanceDueDate ? new Date(balanceDueDate) : null,
        departureDate: departureDate ? String(departureDate).trim() : null,
        departureCity: departureCity ? String(departureCity).trim() : null,
        specialNotes: specialNotes ? String(specialNotes).trim() : null,
        terms: terms || "Prices subject to flight fare and visa slot availability.",
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 86400000),
        lineItemsJson: calc.lineItemsJson as any,
        status: status || "SENT",
        createdById: session.id,
      },
      include: {
        customer: true,
        lead: true,
        package: true,
      },
    });

    await logAudit({
      userId: session.id,
      action: "CREATE_QUOTATION",
      entity: "Quotation",
      entityId: quotation.id,
      details: {
        quotationNumber,
        total: calc.total,
        discountAmount: calc.discountAmount,
        travellersCount: calc.travellersCount,
      },
    });

    try {
      revalidatePath("/admin/quotations");
    } catch {}

    return NextResponse.json({ success: true, quotation });
  } catch (error: unknown) {
    console.error("Error creating quotation:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
