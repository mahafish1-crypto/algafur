import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/api-auth";
import { PACKAGES_CACHE_TAG, revalidatePackagesCache } from "@/lib/packages-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("q") || searchParams.get("search");
    const featured = searchParams.get("featured") || searchParams.get("isFeatured");
    const departureCity = searchParams.get("departureCity") || searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const duration = searchParams.get("duration") || searchParams.get("durationDays");
    const slug = searchParams.get("slug");
    const sort = searchParams.get("sort") || "newest";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(100, Math.max(1, Number(limitParam))) : undefined;
    const pageParam = searchParams.get("page");
    const page = pageParam ? Math.max(1, Number(pageParam)) : 1;

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (type && type !== "ALL") where.type = type;
    if (slug) where.slug = slug;
    if (featured !== null && featured !== undefined && featured !== "") {
      where.isFeatured = featured === "true" || featured === "1";
    }
    if (departureCity && departureCity !== "ALL") {
      where.departureCity = { contains: departureCity, mode: "insensitive" };
    }
    if (duration && !isNaN(Number(duration))) {
      where.durationDays = Number(duration);
    }
    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice && !isNaN(Number(minPrice))) where.basePrice.gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) where.basePrice.lte = Number(maxPrice);
    }
    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { overview: { contains: q, mode: "insensitive" } },
        { badge: { contains: q, mode: "insensitive" } },
        { makkahHotelName: { contains: q, mode: "insensitive" } },
        { madinahHotelName: { contains: q, mode: "insensitive" } },
        { airline: { contains: q, mode: "insensitive" } },
        { departureCity: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy: any = [{ isFeatured: "desc" }, { createdAt: "desc" }];
    if (sort === "price_asc" || sort === "price-low") orderBy = { basePrice: "asc" };
    else if (sort === "price_desc" || sort === "price-high") orderBy = { basePrice: "desc" };
    else if (sort === "duration" || sort === "duration_desc") orderBy = { durationDays: "desc" };
    else if (sort === "duration_asc") orderBy = { durationDays: "asc" };
    else if (sort === "popular") orderBy = [{ isPopular: "desc" }, { createdAt: "desc" }];
    else if (sort === "newest") orderBy = { createdAt: "desc" };
    else if (sort === "oldest") orderBy = { createdAt: "asc" };

    const take = limit;
    const skip = limit ? (page - 1) * limit : undefined;

    const [totalCount, packages] = await Promise.all([
      prisma.package.count({ where }),
      prisma.package.findMany({
        where,
        include: {
          inclusions: true,
          itineraries: { orderBy: { dayNumber: "asc" } },
          departureGroups: true,
          makkahHotel: true,
          madinahHotel: true,
          _count: { select: { bookings: true } },
        },
        orderBy,
        take,
        skip,
      }),
    ]);

    return NextResponse.json({
      success: true,
      count: packages.length,
      total: totalCount,
      page: limit ? page : 1,
      totalPages: limit ? Math.ceil(totalCount / limit) : 1,
      packages,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, "manage:packages");
    if (!auth.authorized) return auth.response;
    const session = auth.session;

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
      hasSpecificDates = false,
      departureCycle = "1st & 3rd Week of Every Month",
      startDate = null,
      endDate = null,
      highlights = null,
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

    // Auto-generate unique slug if empty or too short
    const sanitizedSlug = (typeof slug === "string" ? slug : "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const nameSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    let finalSlug = sanitizedSlug && sanitizedSlug.length >= 3 ? sanitizedSlug : nameSlug;
    if (!finalSlug || finalSlug.length < 3) {
      finalSlug = `package-${Date.now().toString().slice(-6)}`;
    }

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
        hasSpecificDates: Boolean(hasSpecificDates),
        departureCycle: departureCycle ? String(departureCycle).trim() : "1st & 3rd Week of Every Month",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        highlights: highlights
          ? String(highlights).trim()
          : body.ziyaratLandmarks
          ? typeof body.ziyaratLandmarks === "string"
            ? body.ziyaratLandmarks
            : JSON.stringify(body.ziyaratLandmarks)
          : null,
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
        overview: overview ? String(overview).trim() : body.description ? String(body.description).trim() : null,
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

    // Instant cache purge across all public and admin routes
    revalidatePackagesCache([newPackage.slug]);

    return NextResponse.json({ success: true, package: newPackage });
  } catch (error: unknown) {
    console.error("Error creating package:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

