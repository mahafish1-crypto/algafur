import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    const flights = await prisma.flight.findMany({
      orderBy: { departureDate: "asc" },
    });
    return NextResponse.json({ success: true, flights });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:flights");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body = await req.json();

    const {
      airline,
      flightNumber,
      pnr,
      departureAirport,
      arrivalAirport,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      baggage,
      cabin,
    } = body;

    if (!airline || !flightNumber || !departureAirport || !arrivalAirport) {
      return NextResponse.json(
        { error: "Airline, Flight Number, Departure and Arrival airports are required" },
        { status: 400 }
      );
    }

    const flight = await prisma.flight.create({
      data: {
        airline,
        flightNumber,
        pnr: pnr || null,
        departureAirport,
        arrivalAirport,
        departureDate: departureDate || "2026-10-31",
        departureTime: departureTime || "08:00",
        arrivalDate: arrivalDate || "2026-10-31",
        arrivalTime: arrivalTime || "12:30",
        baggage: baggage || "2x23kg + 7kg cabin",
        cabin: cabin || "Economy",
      },
    });

    await logAudit({
      userId: session.id,
      action: "CREATE_FLIGHT",
      entity: "Flight",
      entityId: flight.id,
      details: { airline, flightNumber, pnr },
    });

    return NextResponse.json({ success: true, flight });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
