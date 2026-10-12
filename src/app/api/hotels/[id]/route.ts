import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireAuth } from "@/lib/api-auth";
import { HOTELS_CACHE_TAG, PACKAGES_CACHE_TAG } from "@/lib/packages-data";
import { serializeHotelImages } from "@/lib/hotel-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        makkahPackages: { select: { id: true, name: true, slug: true } },
        madinahPackages: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, hotel });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "manage:hotels");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const existing = await prisma.hotel.findUnique({
      where: { id },
      include: {
        makkahPackages: { select: { id: true, slug: true } },
        madinahPackages: { select: { id: true, slug: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    const body = await req.json();

    const {
      name,
      city,
      starRating,
      distanceFromHaram,
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
      isAvailable,
      linkedPackageIds,
    } = body;

    const normalizedCity = city
      ? String(city).toUpperCase()
      : existing.city;

    let serializedImages = existing.images;
    if (typeof images === "string") {
      serializedImages = images.trim();
    } else if (
      mainImage !== undefined ||
      gallery !== undefined ||
      contactPhone !== undefined ||
      contactEmail !== undefined
    ) {
      serializedImages = serializeHotelImages({
        mainImage,
        gallery,
        contactPhone,
        contactEmail,
      });
    }

    const parsedStars =
      starRating === "" || starRating === null
        ? 0
        : starRating !== undefined
        ? Number(starRating)
        : existing.starRating;

    const updated = await prisma.hotel.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : existing.name,
        city: normalizedCity,
        starRating: Number.isNaN(parsedStars) ? existing.starRating : parsedStars,
        distanceFromHaram:
          distanceFromHaram !== undefined
            ? String(distanceFromHaram || "").trim()
            : existing.distanceFromHaram,
        walkingTime:
          walkingTime !== undefined
            ? walkingTime
              ? String(walkingTime).trim()
              : null
            : existing.walkingTime,
        roomTypes:
          roomTypes !== undefined
            ? roomTypes
              ? String(roomTypes).trim()
              : null
            : existing.roomTypes,
        amenities:
          amenities !== undefined
            ? amenities
              ? String(amenities).trim()
              : null
            : existing.amenities,
        address:
          address !== undefined
            ? address
              ? String(address).trim()
              : null
            : existing.address,
        mapLocation:
          mapLocation !== undefined
            ? mapLocation
              ? String(mapLocation).trim()
              : null
            : existing.mapLocation,
        description:
          description !== undefined
            ? description
              ? String(description).trim()
              : null
            : existing.description,
        images: serializedImages,
        isAvailable:
          typeof isAvailable === "boolean" ? isAvailable : existing.isAvailable,
      },
    });

    // Update package associations if provided
    if (Array.isArray(linkedPackageIds)) {
      const targetIds = linkedPackageIds.map((pid) => String(pid)).filter(Boolean);
      if (normalizedCity === "MAKKAH") {
        // Unlink packages previously linked to this Makkah hotel that are no longer in targetIds
        await prisma.package.updateMany({
          where: {
            makkahHotelId: id,
            id: { notIn: targetIds },
          },
          data: { makkahHotelId: null },
        });
        if (targetIds.length > 0) {
          await prisma.package.updateMany({
            where: { id: { in: targetIds } },
            data: {
              makkahHotelId: id,
              makkahHotelName: updated.name,
              makkahDistance: updated.distanceFromHaram || undefined,
              makkahHotelRating: updated.starRating || undefined,
            },
          });
        }
      } else if (normalizedCity === "MADINAH") {
        await prisma.package.updateMany({
          where: {
            madinahHotelId: id,
            id: { notIn: targetIds },
          },
          data: { madinahHotelId: null },
        });
        if (targetIds.length > 0) {
          await prisma.package.updateMany({
            where: { id: { in: targetIds } },
            data: {
              madinahHotelId: id,
              madinahHotelName: updated.name,
              madinahDistance: updated.distanceFromHaram || undefined,
              madinahHotelRating: updated.starRating || undefined,
            },
          });
        }
      }
    } else {
      // Even if linkedPackageIds wasn't explicitly changed, sync name/distance to already-linked packages
      if (normalizedCity === "MAKKAH") {
        await prisma.package.updateMany({
          where: { makkahHotelId: id },
          data: {
            makkahHotelName: updated.name,
            makkahDistance: updated.distanceFromHaram || undefined,
            makkahHotelRating: updated.starRating || undefined,
          },
        });
      } else if (normalizedCity === "MADINAH") {
        await prisma.package.updateMany({
          where: { madinahHotelId: id },
          data: {
            madinahHotelName: updated.name,
            madinahDistance: updated.distanceFromHaram || undefined,
            madinahHotelRating: updated.starRating || undefined,
          },
        });
      }
    }

    const hotelWithRelations = await prisma.hotel.findUnique({
      where: { id },
      include: {
        makkahPackages: { select: { id: true, name: true, slug: true } },
        madinahPackages: { select: { id: true, name: true, slug: true } },
      },
    });

    await logAudit({
      userId: session.id,
      action: "UPDATE_HOTEL",
      entity: "Hotel",
      entityId: id,
      details: { name: updated.name, city: updated.city },
    });

    try {
      revalidateTag(HOTELS_CACHE_TAG);
      revalidateTag(PACKAGES_CACHE_TAG);
      revalidatePath("/");
      revalidatePath("/hotels");
      revalidatePath("/packages");
      const allSlugs = new Set<string>([
        ...existing.makkahPackages.map((p) => p.slug),
        ...existing.madinahPackages.map((p) => p.slug),
        ...(hotelWithRelations?.makkahPackages.map((p) => p.slug) || []),
        ...(hotelWithRelations?.madinahPackages.map((p) => p.slug) || []),
      ]);
      for (const slug of allSlugs) {
        if (slug) revalidatePath(`/packages/${slug}`);
      }
    } catch {
      // ignore revalidate warnings
    }

    return NextResponse.json({
      success: true,
      hotel: hotelWithRelations || updated,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "manage:hotels");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const existing = await prisma.hotel.findUnique({
      where: { id },
      include: {
        makkahPackages: { select: { id: true, name: true, slug: true } },
        madinahPackages: { select: { id: true, name: true, slug: true } },
        bookingHotels: { select: { id: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    const linkedPackages = [
      ...existing.makkahPackages,
      ...existing.madinahPackages,
    ];

    if (linkedPackages.length > 0) {
      const pkgNames = linkedPackages.map((p) => p.name).join(", ");
      return NextResponse.json(
        {
          error: `Cannot delete "${existing.name}" because it is linked to package(s): ${pkgNames}. Please unlink it from those packages first or mark the hotel as Inactive.`,
          linkedPackages,
        },
        { status: 400 }
      );
    }

    if (existing.bookingHotels.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${existing.name}" because it has historical booking allocations. Please mark the hotel as Inactive instead.`,
        },
        { status: 400 }
      );
    }

    await prisma.hotel.delete({ where: { id } });

    await logAudit({
      userId: session.id,
      action: "DELETE_HOTEL",
      entity: "Hotel",
      entityId: id,
      details: { name: existing.name, city: existing.city },
    });

    try {
      revalidateTag(HOTELS_CACHE_TAG);
      revalidateTag(PACKAGES_CACHE_TAG);
      revalidatePath("/");
      revalidatePath("/hotels");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

