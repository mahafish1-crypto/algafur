import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";
import { HOTELS_CACHE_TAG, PACKAGES_CACHE_TAG } from "@/lib/packages-data";
import { serializeHotelImages } from "@/lib/hotel-helpers";

export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        makkahPackages: { select: { id: true, name: true, slug: true } },
        madinahPackages: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ city: "asc" }, { starRating: "desc" }],
    });
    return NextResponse.json({ success: true, hotels });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:hotels");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body = await req.json();

    const {
      name,
      city,
      starRating,
      distanceFromHaram = "",
      walkingTime,
      roomTypes,
      amenities,
      address,
      mapLocation,
      description,
      mainImage,
      gallery,
      contactPhone,
      contactEmail,
      images,
      isAvailable = true,
      linkedPackageIds,
    } = body;

    if (!name || !String(name).trim() || !city) {
      return NextResponse.json(
        { error: "Hotel Name and City are required" },
        { status: 400 }
      );
    }

    const normalizedCity = String(city).toUpperCase();
    const serializedImages =
      typeof images === "string" && images.trim()
        ? images.trim()
        : serializeHotelImages({
            mainImage,
            gallery,
            contactPhone,
            contactEmail,
          });

    const parsedStars =
      starRating === "" || starRating === null || starRating === undefined
        ? 0
        : Number(starRating);

    const hotel = await prisma.hotel.create({
      data: {
        name: String(name).trim(),
        city: normalizedCity,
        starRating: Number.isNaN(parsedStars) ? 4 : parsedStars,
        distanceFromHaram: String(distanceFromHaram || "").trim(),
        walkingTime: walkingTime ? String(walkingTime).trim() : null,
        roomTypes: roomTypes ? String(roomTypes).trim() : null,
        amenities: amenities ? String(amenities).trim() : null,
        address: address ? String(address).trim() : null,
        mapLocation: mapLocation ? String(mapLocation).trim() : null,
        description: description ? String(description).trim() : null,
        images: serializedImages,
        isAvailable: Boolean(isAvailable),
      },
    });

    if (Array.isArray(linkedPackageIds) && linkedPackageIds.length > 0) {
      const validIds = linkedPackageIds.map((id) => String(id)).filter(Boolean);
      if (normalizedCity === "MAKKAH") {
        await prisma.package.updateMany({
          where: { id: { in: validIds } },
          data: {
            makkahHotelId: hotel.id,
            makkahHotelName: hotel.name,
            makkahDistance: hotel.distanceFromHaram || undefined,
          },
        });
      } else if (normalizedCity === "MADINAH") {
        await prisma.package.updateMany({
          where: { id: { in: validIds } },
          data: {
            madinahHotelId: hotel.id,
            madinahHotelName: hotel.name,
            madinahDistance: hotel.distanceFromHaram || undefined,
          },
        });
      }
    }

    const createdWithRelations = await prisma.hotel.findUnique({
      where: { id: hotel.id },
      include: {
        makkahPackages: { select: { id: true, name: true, slug: true } },
        madinahPackages: { select: { id: true, name: true, slug: true } },
      },
    });

    await logAudit({
      userId: session.id,
      action: "CREATE_HOTEL",
      entity: "Hotel",
      entityId: hotel.id,
      details: { name: hotel.name, city: hotel.city },
    });

    try {
      revalidateTag(HOTELS_CACHE_TAG);
      revalidateTag(PACKAGES_CACHE_TAG);
      revalidatePath("/");
      revalidatePath("/hotels");
      revalidatePath("/packages");
    } catch {
      // ignore revalidate warnings
    }

    return NextResponse.json({
      success: true,
      hotel: createdWithRelations || hotel,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
