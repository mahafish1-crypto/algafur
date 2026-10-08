import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (type && type !== "ALL") where.type = type;

    const packages = await prisma.package.findMany({
      where,
      include: {
        inclusions: true,
        itineraries: { orderBy: { dayNumber: "asc" } },
        departureGroups: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, packages });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      type = "UMRAH",
      badge = "PLATINUM",
      year = "2026 / 1448 Hijri",
      durationDays = 20,
      makkahNights = 12,
      madinahNights = 7,
      basePrice = 120000,
      priceQuad,
      priceTriple,
      priceDouble,
      priceSingle,
      childPrice,
      infantPrice,
      couplePrice,
      mrpPrice,
      currency = "INR",
      taxGst,
      additionalCharges,
      discountType,
      discountValue,
      departureDate = "31 October 2026",
      returnDate = "19 November 2026",
      departureCity = "Mumbai",
      featuredImage,
      heroImage,
      thumbnailImage,
      gallery,
      makkahHotelName,
      makkahDistance,
      makkahHotelRating = 4,
      makkahRoomType,
      makkahMealPlan,
      makkahDescription,
      makkahAmenities,
      makkahImage,
      madinahHotelName,
      madinahDistance,
      madinahHotelRating = 4,
      madinahRoomType,
      madinahMealPlan,
      madinahDescription,
      madinahAmenities,
      madinahImage,
      airline,
      flightNumber,
      pnr,
      departureAirport,
      arrivalAirport,
      flightType = "DIRECT",
      baggage,
      flightDetails,
      totalSeats = 45,
      bookedSeats = 0,
      status = "PUBLISHED",
      isFeatured = true,
      isPopular = true,
      overview,
      travelRequirements,
      termsAndConditions,
      cancellationPolicy,
      refundPolicy,
      importantNotes,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage,
      features,
      registrationDeadline,
      sortOrder = 0,
      inclusions = [],
      exclusions = [],
      itineraries = [],
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Package Name is required." }, { status: 400 });
    }

    // Auto-generate unique slug if empty
    let finalSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const existingSlug = await prisma.package.findUnique({ where: { slug: finalSlug } });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const calculatedQuad = priceQuad !== undefined ? Number(priceQuad) : Number(basePrice);
    const calculatedTriple = priceTriple !== undefined ? Number(priceTriple) : Math.round(Number(basePrice) * 1.1);
    const calculatedDouble = priceDouble !== undefined ? Number(priceDouble) : Math.round(Number(basePrice) * 1.25);
    const calculatedSingle = priceSingle !== undefined ? Number(priceSingle) : Math.round(Number(basePrice) * 1.5);

    const newPackage = await prisma.package.create({
      data: {
        name,
        slug: finalSlug,
        type,
        badge,
        year,
        durationDays: Number(durationDays),
        makkahNights: Number(makkahNights),
        madinahNights: Number(madinahNights),
        basePrice: Number(basePrice),
        priceQuad: calculatedQuad,
        priceTriple: calculatedTriple,
        priceDouble: calculatedDouble,
        priceSingle: calculatedSingle,
        childPrice: childPrice ? Number(childPrice) : null,
        infantPrice: infantPrice ? Number(infantPrice) : null,
        couplePrice: couplePrice ? Number(couplePrice) : null,
        mrpPrice: mrpPrice ? Number(mrpPrice) : null,
        currency,
        taxGst,
        additionalCharges,
        discountType,
        discountValue: discountValue ? Number(discountValue) : null,
        departureDate,
        returnDate,
        departureCity,
        featuredImage: featuredImage || "/brand/poster.jpg",
        heroImage,
        thumbnailImage,
        gallery: typeof gallery === "string" ? gallery : JSON.stringify(gallery || []),
        makkahHotelName: makkahHotelName || "Diyafa Jamal or similar",
        makkahDistance: makkahDistance || "500m walking",
        makkahHotelRating: Number(makkahHotelRating) || 4,
        makkahRoomType,
        makkahMealPlan,
        makkahDescription,
        makkahAmenities,
        makkahImage,
        madinahHotelName: madinahHotelName || "Ilaf Kuba or similar",
        madinahDistance: madinahDistance || "400m walking",
        madinahHotelRating: Number(madinahHotelRating) || 4,
        madinahRoomType,
        madinahMealPlan,
        madinahDescription,
        madinahAmenities,
        madinahImage,
        airline,
        flightNumber,
        pnr,
        departureAirport: departureAirport || "BOM",
        arrivalAirport: arrivalAirport || "MED",
        flightType,
        baggage: baggage || "2x23kg + 7kg cabin",
        flightDetails,
        totalSeats: Math.max(1, Number(totalSeats)),
        bookedSeats: Math.max(0, Number(bookedSeats)),
        status,
        isFeatured: Boolean(isFeatured),
        isPopular: Boolean(isPopular),
        overview,
        travelRequirements,
        termsAndConditions,
        cancellationPolicy,
        refundPolicy,
        importantNotes,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        features: typeof features === "string" ? features : JSON.stringify(features || []),
        registrationDeadline,
        sortOrder: Number(sortOrder) || 0,
        // Inclusions and Exclusions
        inclusions: {
          create: [
            ...inclusions.map((inc: any) => ({
              title: inc.title || inc,
              description: inc.description || null,
              icon: inc.icon || "CheckCircle2",
              isIncluded: true,
            })),
            ...exclusions.map((exc: any) => ({
              title: exc.title || exc,
              description: exc.description || null,
              icon: exc.icon || "XCircle",
              isIncluded: false,
            })),
          ],
        },
        // Itineraries
        itineraries: {
          create: itineraries.map((it: any, index: number) => ({
            dayNumber: it.dayNumber || index + 1,
            title: it.title || `Day ${index + 1}`,
            location: it.location || "Makkah",
            hotel: it.hotel || null,
            activities: it.activities || "",
            meals: it.meals || "Breakfast, Lunch, Dinner",
            transport: it.transport || "Air-conditioned luxury coach",
            notes: it.notes || null,
            images: it.images || null,
            sortOrder: index + 1,
          })),
        },
        // Initial Departure Group
        departureGroups: {
          create: {
            groupName: `${name} Group — ${departureDate}`,
            departureDate,
            returnDate,
            totalCapacity: Math.max(1, Number(totalSeats)),
            confirmedTravellers: Math.max(0, Number(bookedSeats)),
            status: "OPEN",
          },
        },
      },
      include: {
        inclusions: true,
        itineraries: true,
        departureGroups: true,
      },
    });

    await logAudit({
      userId: session.id,
      action: "CREATE_PACKAGE",
      entity: "Package",
      entityId: newPackage.id,
      details: { name: newPackage.name, slug: newPackage.slug, price: newPackage.basePrice },
    });

    return NextResponse.json({ success: true, package: newPackage });
  } catch (error: unknown) {
    console.error("Error creating package:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

