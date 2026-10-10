import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/api-auth";
import { PACKAGES_CACHE_TAG } from "@/lib/packages-data";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        inclusions: true,
        itineraries: { orderBy: { dayNumber: "asc" } },
        departureGroups: true,
        makkahHotel: true,
        madinahHotel: true,
      },
    });

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, package: pkg });
  } catch (error: unknown) {
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

async function handleUpdate(
  req: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const auth = await requireAuth(req, "manage:packages");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.package.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Separate relational fields from scalar fields
    const { inclusions, exclusions, itineraries, ...scalarFields } = body;

    // Typecast numeric and boolean values cleanly
    const updateData: any = { ...scalarFields };

    if (updateData.basePrice !== undefined) updateData.basePrice = Number(updateData.basePrice);
    if (updateData.priceQuad !== undefined) updateData.priceQuad = updateData.priceQuad !== null ? Number(updateData.priceQuad) : null;
    if (updateData.priceTriple !== undefined) updateData.priceTriple = updateData.priceTriple !== null ? Number(updateData.priceTriple) : null;
    if (updateData.priceDouble !== undefined) updateData.priceDouble = updateData.priceDouble !== null ? Number(updateData.priceDouble) : null;
    if (updateData.priceSingle !== undefined) updateData.priceSingle = updateData.priceSingle !== null ? Number(updateData.priceSingle) : null;
    if (updateData.childPrice !== undefined) updateData.childPrice = updateData.childPrice !== null ? Number(updateData.childPrice) : null;
    if (updateData.infantPrice !== undefined) updateData.infantPrice = updateData.infantPrice !== null ? Number(updateData.infantPrice) : null;
    if (updateData.couplePrice !== undefined) updateData.couplePrice = updateData.couplePrice !== null ? Number(updateData.couplePrice) : null;
    if (updateData.mrpPrice !== undefined) updateData.mrpPrice = updateData.mrpPrice !== null ? Number(updateData.mrpPrice) : null;
    if (updateData.discountValue !== undefined) updateData.discountValue = updateData.discountValue !== null ? Number(updateData.discountValue) : null;

    if (updateData.durationDays !== undefined) updateData.durationDays = Number(updateData.durationDays);
    if (updateData.makkahNights !== undefined) updateData.makkahNights = Number(updateData.makkahNights);
    if (updateData.madinahNights !== undefined) updateData.madinahNights = Number(updateData.madinahNights);
    if (updateData.totalSeats !== undefined) updateData.totalSeats = Number(updateData.totalSeats);
    if (updateData.bookedSeats !== undefined) updateData.bookedSeats = Number(updateData.bookedSeats);
    if (updateData.makkahHotelRating !== undefined) updateData.makkahHotelRating = updateData.makkahHotelRating ? Number(updateData.makkahHotelRating) : 4;
    if (updateData.madinahHotelRating !== undefined) updateData.madinahHotelRating = updateData.madinahHotelRating ? Number(updateData.madinahHotelRating) : 4;
    if (updateData.sortOrder !== undefined) updateData.sortOrder = Number(updateData.sortOrder) || 0;

    if (updateData.gallery && typeof updateData.gallery !== "string") {
      updateData.gallery = JSON.stringify(updateData.gallery);
    }
    if (updateData.features && typeof updateData.features !== "string") {
      updateData.features = JSON.stringify(updateData.features);
    }

    // Run transaction if inclusions or itineraries need update
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update scalar fields
      const pkg = await tx.package.update({
        where: { id },
        data: updateData,
      });

      // 2. Update Inclusions / Exclusions if provided
      if (inclusions !== undefined || exclusions !== undefined) {
        await tx.packageInclusion.deleteMany({ where: { packageId: id } });

        const newInclusions: any[] = [];
        if (Array.isArray(inclusions)) {
          inclusions.forEach((inc: any) => {
            newInclusions.push({
              packageId: id,
              title: inc.title || inc,
              description: inc.description || null,
              icon: inc.icon || "CheckCircle2",
              isIncluded: true,
            });
          });
        }
        if (Array.isArray(exclusions)) {
          exclusions.forEach((exc: any) => {
            newInclusions.push({
              packageId: id,
              title: exc.title || exc,
              description: exc.description || null,
              icon: exc.icon || "XCircle",
              isIncluded: false,
            });
          });
        }

        if (newInclusions.length > 0) {
          await tx.packageInclusion.createMany({ data: newInclusions });
        }
      }

      // 3. Update Itineraries if provided
      if (itineraries !== undefined && Array.isArray(itineraries)) {
        await tx.packageItinerary.deleteMany({ where: { packageId: id } });

        if (itineraries.length > 0) {
          await tx.packageItinerary.createMany({
            data: itineraries.map((it: any, idx: number) => ({
              packageId: id,
              dayNumber: it.dayNumber || idx + 1,
              title: it.title || `Day ${idx + 1}`,
              location: it.location || "Makkah",
              hotel: it.hotel || null,
              activities: it.activities || "",
              meals: it.meals || null,
              transport: it.transport || null,
              notes: it.notes || null,
              images: it.images || null,
              sortOrder: idx + 1,
            })),
          });
        }
      }

      // 4. Update DepartureGroup capacity / booked if seats were changed
      if (updateData.totalSeats !== undefined || updateData.bookedSeats !== undefined) {
        await tx.departureGroup.updateMany({
          where: { packageId: id, status: "OPEN" },
          data: {
            totalCapacity: updateData.totalSeats !== undefined ? updateData.totalSeats : undefined,
            confirmedTravellers: updateData.bookedSeats !== undefined ? updateData.bookedSeats : undefined,
          },
        });
      }

      return pkg;
    });

    await logAudit({
      userId: session.id,
      action: "UPDATE_PACKAGE_FULL",
      entity: "Package",
      entityId: id,
      details: { name: updated.name, slug: updated.slug },
    });

    const fullPackage = await prisma.package.findUnique({
      where: { id },
      include: {
        inclusions: true,
        itineraries: { orderBy: { dayNumber: "asc" } },
        departureGroups: true,
      },
    });

    try {
      revalidateTag(PACKAGES_CACHE_TAG);
      revalidatePath("/");
      revalidatePath("/packages");
      revalidatePath("/booking");
      if (existing.slug) {
        revalidatePath(`/packages/${existing.slug}`);
      }
      if (fullPackage?.slug && fullPackage.slug !== existing.slug) {
        revalidatePath(`/packages/${fullPackage.slug}`);
      }
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json({ success: true, package: fullPackage });
  } catch (error: unknown) {
    console.error("Error updating package:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, "manage:packages");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await params;
    const existing = await prisma.package.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Safeguard: Never delete existing default platinum package!
    if (existing.slug === "umrah-platinum-package-2026") {
      return NextResponse.json(
        { error: "The default Al-Gafur Platinum 2026 package is protected and cannot be deleted." },
        { status: 400 }
      );
    }

    // If bookings exist, archive instead of deleting
    if (existing._count.bookings > 0) {
      const archived = await prisma.package.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      try {
        revalidateTag(PACKAGES_CACHE_TAG);
        revalidatePath("/");
        revalidatePath("/packages");
        revalidatePath("/booking");
        revalidatePath(`/packages/${existing.slug}`);
      } catch (e) {
        console.warn("revalidatePath warning:", e);
      }
      return NextResponse.json({
        success: true,
        message: "Package has existing pilgrim bookings and was archived instead of deleted.",
        package: archived,
      });
    }

    // Otherwise delete package
    await prisma.package.delete({ where: { id } });

    await logAudit({
      userId: session.id,
      action: "DELETE_PACKAGE",
      entity: "Package",
      entityId: id,
      details: { name: existing.name, slug: existing.slug },
    });

    try {
      revalidateTag(PACKAGES_CACHE_TAG);
      revalidatePath("/");
      revalidatePath("/packages");
      revalidatePath("/booking");
      revalidatePath(`/packages/${existing.slug}`);
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting package:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
