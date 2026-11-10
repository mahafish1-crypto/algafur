import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/api-auth";
import { PACKAGES_CACHE_TAG, revalidatePackagesCache } from "@/lib/packages-data";

export const dynamic = "force-dynamic";

const VALID_PACKAGE_SCALAR_FIELDS = new Set([
  "name",
  "slug",
  "type",
  "badge",
  "year",
  "durationDays",
  "makkahNights",
  "madinahNights",
  "basePrice",
  "priceQuad",
  "priceTriple",
  "priceDouble",
  "priceSingle",
  "childPrice",
  "infantPrice",
  "couplePrice",
  "mrpPrice",
  "currency",
  "taxGst",
  "additionalCharges",
  "discountType",
  "discountValue",
  "departureDate",
  "returnDate",
  "departureCity",
  "hasSpecificDates",
  "departureCycle",
  "startDate",
  "endDate",
  "highlights",
  "makkahHotelId",
  "madinahHotelId",
  "makkahHotelName",
  "madinahHotelName",
  "makkahDistance",
  "madinahDistance",
  "makkahHotelRating",
  "makkahRoomType",
  "makkahMealPlan",
  "makkahDescription",
  "makkahAmenities",
  "makkahImage",
  "makkahMap",
  "madinahHotelRating",
  "madinahRoomType",
  "madinahMealPlan",
  "madinahDescription",
  "madinahAmenities",
  "madinahImage",
  "madinahMap",
  "airline",
  "flightNumber",
  "pnr",
  "departureAirport",
  "arrivalAirport",
  "flightType",
  "baggage",
  "flightDetails",
  "totalSeats",
  "bookedSeats",
  "status",
  "isFeatured",
  "isPopular",
  "overview",
  "travelRequirements",
  "termsAndConditions",
  "cancellationPolicy",
  "refundPolicy",
  "importantNotes",
  "seoTitle",
  "seoDescription",
  "seoKeywords",
  "ogImage",
  "canonicalUrl",
  "features",
  "assignedGuides",
  "registrationDeadline",
  "sortOrder",
  "featuredImage",
  "heroImage",
  "thumbnailImage",
  "gallery",
]);

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

    if (updateData.hasSpecificDates !== undefined) updateData.hasSpecificDates = Boolean(updateData.hasSpecificDates);
    if (updateData.departureCycle !== undefined) updateData.departureCycle = updateData.departureCycle ? String(updateData.departureCycle).trim() : null;
    if (updateData.startDate !== undefined) updateData.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
    if (updateData.endDate !== undefined) updateData.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    if (updateData.highlights !== undefined) updateData.highlights = updateData.highlights ? String(updateData.highlights).trim() : null;
    
    // Overview & Description mapping
    if (body.overview !== undefined || body.description !== undefined) {
      const ov = body.overview !== undefined ? body.overview : body.description;
      updateData.overview = ov ? String(ov).trim() : null;
    }

    // Makkah Address mapping
    if (body.makkahAddress !== undefined || body.makkahDescription !== undefined) {
      const mkAddr = body.makkahAddress !== undefined ? body.makkahAddress : body.makkahDescription;
      updateData.makkahDescription = mkAddr ? String(mkAddr).trim() : null;
    }

    // Madinah Address mapping
    if (body.madinahAddress !== undefined || body.madinahDescription !== undefined) {
      const mdAddr = body.madinahAddress !== undefined ? body.madinahAddress : body.madinahDescription;
      updateData.madinahDescription = mdAddr ? String(mdAddr).trim() : null;
    }

    // Ziyarat landmarks mapping - cleanly store inside highlights as serialized JSON
    let highlightsPayload: string | null = null;
    if (body.ziyaratLandmarks && typeof body.ziyaratLandmarks === "object") {
      highlightsPayload = JSON.stringify({
        makkah: Array.isArray(body.ziyaratLandmarks.makkah) ? body.ziyaratLandmarks.makkah : [],
        madinah: Array.isArray(body.ziyaratLandmarks.madinah) ? body.ziyaratLandmarks.madinah : [],
        custom: Array.isArray(body.ziyaratLandmarks.custom) ? body.ziyaratLandmarks.custom : [],
      });
    } else if (body.makkahZiyarat || body.madinahZiyarat) {
      highlightsPayload = JSON.stringify({
        makkah: Array.isArray(body.makkahZiyarat) ? body.makkahZiyarat : [],
        madinah: Array.isArray(body.madinahZiyarat) ? body.madinahZiyarat : [],
        custom: Array.isArray(body.customZiyarat) ? body.customZiyarat : [],
      });
    } else if (body.highlights !== undefined) {
      if (typeof body.highlights === "string") {
        highlightsPayload = body.highlights.trim();
      } else if (typeof body.highlights === "object" && body.highlights !== null) {
        highlightsPayload = JSON.stringify(body.highlights);
      }
    }

    if (highlightsPayload !== null) {
      updateData.highlights = highlightsPayload;
    }

    if (updateData.gallery && typeof updateData.gallery !== "string") {
      updateData.gallery = JSON.stringify(updateData.gallery);
    }
    if (updateData.features && typeof updateData.features !== "string") {
      updateData.features = JSON.stringify(updateData.features);
    }
    if (updateData.assignedGuides !== undefined && typeof updateData.assignedGuides !== "string") {
      updateData.assignedGuides = JSON.stringify(updateData.assignedGuides || []);
    }

    if (updateData.slug) {
      updateData.slug = updateData.slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (updateData.slug.length < 3) {
        delete updateData.slug; // Preserve existing slug rather than allowing corrupted short slug
      }
    }

    // Ensure NO unknown keys are passed to prisma.package.update:
    const safeUpdateData: any = {};
    for (const [key, val] of Object.entries(updateData)) {
      if (VALID_PACKAGE_SCALAR_FIELDS.has(key)) {
        safeUpdateData[key] = val;
      }
    }

    // Run transaction if inclusions or itineraries need update
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update scalar fields with strictly validated schema arguments
      const pkg = await tx.package.update({
        where: { id },
        data: safeUpdateData,
      });

      // 1b. Automatically keep linked Hotel records in sync (name, distance, rating, address)
      const targetMakkahId = updateData.makkahHotelId || existing.makkahHotelId;
      if (
        targetMakkahId &&
        (updateData.makkahHotelName ||
          updateData.makkahDistance ||
          updateData.makkahHotelRating !== undefined ||
          updateData.makkahDescription !== undefined)
      ) {
        await tx.hotel
          .update({
            where: { id: targetMakkahId },
            data: {
              name: updateData.makkahHotelName || undefined,
              distanceFromHaram: updateData.makkahDistance || undefined,
              starRating:
                updateData.makkahHotelRating !== undefined
                  ? Number(updateData.makkahHotelRating)
                  : undefined,
              address:
                updateData.makkahDescription !== undefined
                  ? updateData.makkahDescription
                  : undefined,
            },
          })
          .catch((err) => {
            console.warn("Could not sync linked Makkah hotel:", err);
          });
      }

      const targetMadinahId = updateData.madinahHotelId || existing.madinahHotelId;
      if (
        targetMadinahId &&
        (updateData.madinahHotelName ||
          updateData.madinahDistance ||
          updateData.madinahHotelRating !== undefined ||
          updateData.madinahDescription !== undefined)
      ) {
        await tx.hotel
          .update({
            where: { id: targetMadinahId },
            data: {
              name: updateData.madinahHotelName || undefined,
              distanceFromHaram: updateData.madinahDistance || undefined,
              starRating:
                updateData.madinahHotelRating !== undefined
                  ? Number(updateData.madinahHotelRating)
                  : undefined,
              address:
                updateData.madinahDescription !== undefined
                  ? updateData.madinahDescription
                  : undefined,
            },
          })
          .catch((err) => {
            console.warn("Could not sync linked Madinah hotel:", err);
          });
      }

      // 2. Update Inclusions / Exclusions if provided
      if (inclusions !== undefined || exclusions !== undefined) {
        await tx.packageInclusion.deleteMany({ where: { packageId: id } });

        const newInclusions: any[] = [];
        if (Array.isArray(inclusions)) {
          inclusions.forEach((inc: any) => {
            const rawTitle = typeof inc === "string" ? inc : (inc?.title || inc?.name || inc?.text || String(inc));
            const title = (rawTitle || "").trim();
            if (title) {
              newInclusions.push({
                packageId: id,
                title,
                description: inc?.description ? String(inc.description).trim() : null,
                icon: inc?.icon || "CheckCircle2",
                isIncluded: true,
              });
            }
          });
        }
        if (Array.isArray(exclusions)) {
          exclusions.forEach((exc: any) => {
            const rawTitle = typeof exc === "string" ? exc : (exc?.title || exc?.name || exc?.text || String(exc));
            const title = (rawTitle || "").trim();
            if (title) {
              newInclusions.push({
                packageId: id,
                title,
                description: exc?.description ? String(exc.description).trim() : null,
                icon: exc?.icon || "XCircle",
                isIncluded: false,
              });
            }
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
              dayNumber: Number(it.dayNumber) || idx + 1,
              title: String(it.title || `Day ${idx + 1}`).trim(),
              location: String(it.location || "Makkah").trim(),
              hotel: it.hotel ? String(it.hotel).trim() : null,
              activities: String(it.activities || it.description || "").trim(),
              meals: it.meals ? String(it.meals).trim() : null,
              transport: it.transport ? String(it.transport).trim() : null,
              notes: it.notes ? String(it.notes).trim() : null,
              images: it.images ? (typeof it.images === "string" ? it.images : JSON.stringify(it.images)) : null,
              sortOrder: Number(it.sortOrder) || idx + 1,
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
        makkahHotel: true,
        madinahHotel: true,
      },
    });

    // Instant cache purge across all public and admin routes, handling old and new slugs
    revalidatePackagesCache([existing.slug, fullPackage?.slug]);
    try {
      revalidatePath("/", "page");
      revalidatePath("/packages", "page");
      if (existing.slug) revalidatePath(`/packages/${existing.slug}`, "page");
      if (fullPackage?.slug) revalidatePath(`/packages/${fullPackage.slug}`, "page");
      revalidatePath("/admin/packages", "page");
    } catch {}

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
        { error: "The default AL GAFUR Platinum 2026 package is protected and cannot be deleted." },
        { status: 400 }
      );
    }

    // Check if bookings exist on the package or on any of its departure groups
    const bookingCount = await prisma.booking.count({
      where: {
        OR: [
          { packageId: id },
          { departureGroup: { packageId: id } },
        ],
      },
    });

    // If bookings exist, archive safely instead of deleting to protect audit and pilgrim records
    if (bookingCount > 0) {
      const archived = await prisma.package.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      // Instant cache purge across all public and admin routes
      revalidatePackagesCache([existing.slug, archived.slug]);
      return NextResponse.json({
        success: true,
        archived: true,
        message: `Package has ${bookingCount} existing pilgrim booking(s) and was safely archived rather than deleted.`,
        package: archived,
      });
    }

    // Clean cascade deletion of all dependent records in a safe transaction
    await prisma.$transaction(async (tx) => {
      // 1. Unlink any LeadForm submissions referencing this package
      await tx.leadForm
        .updateMany({
          where: { packageId: id },
          data: { packageId: null },
        })
        .catch(() => {});

      // 2. Delete quotations linked to this package
      await tx.quotation
        .deleteMany({
          where: { packageId: id },
        })
        .catch(() => {});

      // 3. Delete departure groups for this package
      await tx.departureGroup.deleteMany({
        where: { packageId: id },
      });

      // 4. Delete inclusions, itineraries, and gallery media
      await tx.packageInclusion.deleteMany({
        where: { packageId: id },
      });
      await tx.packageItinerary.deleteMany({
        where: { packageId: id },
      });
      await tx.packageImage.deleteMany({
        where: { packageId: id },
      });

      // 5. Finally delete the package record
      await tx.package.delete({
        where: { id },
      });
    });

    await logAudit({
      userId: session.id,
      action: "DELETE_PACKAGE",
      entity: "Package",
      entityId: id,
      details: { name: existing.name, slug: existing.slug },
    });

    // Instant cache purge across all public and admin routes
    revalidatePackagesCache([existing.slug]);
    try {
      revalidatePath("/", "page");
      revalidatePath("/packages", "page");
      revalidatePath("/admin/packages", "page");
    } catch {}

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting package:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
