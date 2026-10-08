import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingNumber = searchParams.get("bookingNumber")?.trim();
    const phone = searchParams.get("phone")?.trim();

    if (!bookingNumber || !phone) {
      return NextResponse.json(
        { error: "Booking Number and Phone are required." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: {
        bookingNumber: {
          equals: bookingNumber,
        },
        customer: {
          phone: {
            contains: phone.replace(/[^0-9]/g, "").slice(-10),
          },
        },
      },
      include: {
        package: {
          select: {
            name: true,
            departureDate: true,
            durationDays: true,
            makkahHotelName: true,
            madinahHotelName: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
        visaApplications: {
          select: {
            status: true,
          },
        },
        documents: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "No booking matches the provided number and phone." },
        { status: 404 }
      );
    }

    const hasApprovedVisa = booking.visaApplications.some((v) => v.status === "APPROVED");
    const allDocsVerified =
      booking.documents.length > 0 &&
      booking.documents.every((d) => d.status === "VERIFIED");

    return NextResponse.json({
      booking: {
        bookingNumber: booking.bookingNumber,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        adults: booking.adults,
        children: booking.children,
        totalAmount: booking.totalAmount,
        paidAmount: booking.paidAmount,
        outstandingAmount: booking.outstandingAmount,
        package: booking.package,
        customerName: booking.customer.name,
        documentsVerified: allDocsVerified,
        visaApproved: hasApprovedVisa,
        readyToTravel: hasApprovedVisa && booking.paymentStatus === "PAID",
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

