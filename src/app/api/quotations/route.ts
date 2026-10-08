import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { quotationNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { lead: { name: { contains: search } } },
        { package: { name: { contains: search } } },
      ];
    }

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        lead: {
          select: { id: true, name: true, mobile: true, email: true },
        },
        package: {
          select: {
            id: true,
            name: true,
            type: true,
            durationDays: true,
            makkahHotelName: true,
            madinahHotelName: true,
            makkahDistance: true,
            madinahDistance: true,
            departureDate: true,
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
    const session = await getSession();
    const body = await req.json();

    const {
      customerId,
      leadId,
      packageId,
      travellersCount = 1,
      roomType = "QUAD",
      subtotal,
      discount = 0,
      tax = 0,
      total,
      advanceRequired = 0,
      balanceAmount = 0,
      terms,
      validUntil,
    } = body;

    if (!packageId || !subtotal || !total) {
      return NextResponse.json(
        { error: "Package, subtotal, and total are required" },
        { status: 400 }
      );
    }

    const count = await prisma.quotation.count();
    const quotationNumber = `ALQ-2026-${String(count + 101).padStart(5, "0")}`;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: customerId || null,
        leadId: leadId || null,
        packageId,
        travellersCount: Number(travellersCount),
        roomType,
        subtotal: parseFloat(subtotal),
        discount: parseFloat(discount),
        tax: parseFloat(tax),
        total: parseFloat(total),
        advanceRequired: parseFloat(advanceRequired),
        balanceAmount: parseFloat(balanceAmount),
        terms: terms || "Prices subject to flight fare and visa slot availability.",
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 86400000),
        status: "SENT",
        createdById: session?.id || "admin",
      },
      include: {
        customer: true,
        lead: true,
        package: true,
      },
    });

    await logAudit({
      userId: session?.id || null,
      action: "CREATE_QUOTATION",
      entity: "Quotation",
      entityId: quotation.id,
      details: { quotationNumber, total, travellersCount },
    });

    return NextResponse.json({ success: true, quotation });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

