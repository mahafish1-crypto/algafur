import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({
      orderBy: { starRating: "desc" },
    });
    return NextResponse.json({ success: true, hotels });
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
      name,
      city,
      starRating = 4,
      distanceFromHaram,
      walkingTime,
      roomTypes,
      amenities,
      address,
      description,
    } = body;

    if (!name || !city || !distanceFromHaram) {
      return NextResponse.json(
        { error: "Hotel Name, City, and Distance from Haram are required" },
        { status: 400 }
      );
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        city: city.toUpperCase(),
        starRating: Number(starRating),
        distanceFromHaram,
        walkingTime: walkingTime || null,
        roomTypes: roomTypes || "Quad, Triple, Double",
        amenities: amenities || "Wi-Fi, 24/7 Room Service, Restaurant",
        address: address || null,
        description: description || null,
      },
    });

    await logAudit({
      userId: session?.id || null,
      action: "CREATE_HOTEL",
      entity: "Hotel",
      entityId: hotel.id,
      details: { name, city, distanceFromHaram },
    });

    return NextResponse.json({ success: true, hotel });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

