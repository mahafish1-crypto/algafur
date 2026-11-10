import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/api-auth";
import { PACKAGES_CACHE_TAG, revalidatePackagesCache } from "@/lib/packages-data";
import { parseDateString } from "@/lib/package-dates";
import { MAKKAH_MAIN_ZIYARAT, MADINAH_MAIN_ZIYARAT } from "@/lib/constants/ziyarats";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");
    const search = searchParams.get("q") || searchParams.get("search");
    const featured = searchParams.get("featured") || searchParams.get("isFeatured");
    const departureCity = searchParams.get("departureCity") || searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const duration = searchParams.get("duration") || searchParams.get("durationDays");
    const slug = searchParams.get("slug");
    const sort = searchParams.get("sort") || "nearest_departure";
    const limitParam = searchParams.get("limit");
    const limit = limitParam && !isNaN(Number(limitParam)) ? Math.max(1, Number(limitParam)) : undefined;
    const pageParam = searchParams.get("page");
    const page = pageParam && !isNaN(Number(pageParam)) ? Math.max(1, Number(pageParam)) : 1;

    const where: any = {};

    // Status filtering: default to PUBLISHED, allow ALL or custom status
    if (statusParam && statusParam.toUpperCase() === "ALL") {
      // Do not filter by status
    } else if (statusParam) {
      where.status = statusParam.toUpperCase();
    } else {
      where.status = "PUBLISHED";
    }

    // Type filtering
    if (typeParam && typeParam.toUpperCase() !== "ALL") {
      where.type = typeParam.toUpperCase();
    }

    if (slug) where.slug = slug;
    if (featured !== null && featured !== undefined && featured !== "") {
      where.isFeatured = featured === "true" || featured === "1";
    }
    if (departureCity && departureCity.toUpperCase() !== "ALL") {
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

    // Fetch all matching packages with full relational stays and departures
    const rawPackages = await prisma.package.findMany({
      where,
      include: {
        inclusions: true,
        itineraries: { orderBy: { dayNumber: "asc" } },
        departureGroups: true,
        makkahHotel: true,
        madinahHotel: true,
        _count: { select: { bookings: true } },
      },
    });

    const now = Date.now();

    // Helper to calculate effective nearest future departure timestamp
    const getEffectiveDate = (pkg: any): number => {
      let minUpcoming = Infinity;

      // 1. Direct package startDate if future
      if (pkg.startDate) {
        const time = new Date(pkg.startDate).getTime();
        if (!isNaN(time) && time >= now && time < minUpcoming) {
          minUpcoming = time;
        }
      }

      // 2. Departure groups with upcoming dates
      if (pkg.departureGroups && Array.isArray(pkg.departureGroups) && pkg.departureGroups.length > 0) {
        for (const dg of pkg.departureGroups) {
          if (dg.startDate) {
            const time = new Date(dg.startDate).getTime();
            if (!isNaN(time) && time >= now && time < minUpcoming) {
              minUpcoming = time;
            }
          }
          if (dg.departureDate) {
            const time = parseDateString(dg.departureDate);
            if (time !== null && time >= now && time < minUpcoming) {
              minUpcoming = time;
            }
          }
        }
      }

      // 3. Package textual departureDate if upcoming
      if (pkg.departureDate && typeof pkg.departureDate === "string") {
        const time = parseDateString(pkg.departureDate);
        if (time !== null && time >= now && time < minUpcoming) {
          minUpcoming = time;
        }
      }

      return minUpcoming;
    };

    // Smart chronological sorting: Nearest future departure strictly prioritized at top
    const sortedPackages = [...rawPackages].sort((a, b) => {
      const dateA = getEffectiveDate(a);
      const dateB = getEffectiveDate(b);

      // Primary: Nearest future departure first
      if (dateA !== dateB) {
        return dateA - dateB;
      }

      // Secondary sorting if query sort parameter is specified
      if (sort === "price_asc" || sort === "price-low") {
        const priceA = a.priceQuad || a.basePrice || 0;
        const priceB = b.priceQuad || b.basePrice || 0;
        return priceA - priceB;
      }
      if (sort === "price_desc" || sort === "price-high") {
        const priceA = a.priceQuad || a.basePrice || 0;
        const priceB = b.priceQuad || b.basePrice || 0;
        return priceB - priceA;
      }
      if (sort === "duration" || sort === "duration_desc") {
        return b.durationDays - a.durationDays;
      }
      if (sort === "duration_asc") {
        return a.durationDays - b.durationDays;
      }
      if (sort === "popular") {
        if (a.isPopular !== b.isPopular) return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      }

      // Fallback tie-breaker: Featured first, then newest updatedAt
      if (a.isFeatured !== b.isFeatured) {
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const totalCount = sortedPackages.length;
    const skip = limit ? (page - 1) * limit : 0;
    const pagedPackages = limit ? sortedPackages.slice(skip, skip + limit) : sortedPackages;

    // Structured Ziyarat Parsing & Payload Enrichment
    const formattedPackages = pagedPackages.map((pkg) => {
      let ziyarats = { makkah: [] as string[], madinah: [] as string[] };
      try {
        if (pkg.highlights) {
          const parsed = typeof pkg.highlights === "string" ? JSON.parse(pkg.highlights) : pkg.highlights;
          ziyarats = {
            makkah: Array.isArray(parsed.makkah) ? parsed.makkah.filter(Boolean) : [],
            madinah: Array.isArray(parsed.madinah) ? parsed.madinah.filter(Boolean) : [],
          };
        }
      } catch {
        ziyarats = { makkah: [], madinah: [] };
      }

      // If no custom landmarks set, populate standard comprehensive presets
      if (ziyarats.makkah.length === 0 && ziyarats.madinah.length === 0) {
        ziyarats = {
          makkah: [...MAKKAH_MAIN_ZIYARAT],
          madinah: [...MADINAH_MAIN_ZIYARAT],
        };
      }

      return {
        ...pkg,
        ziyarats: {
          ...ziyarats,
          totalCount: ziyarats.makkah.length + ziyarats.madinah.length,
        },
        makkahZiyarat: ziyarats.makkah,
        madinahZiyarat: ziyarats.madinah,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedPackages.length,
      total: totalCount,
      page: limit ? page : 1,
      totalPages: limit ? Math.ceil(totalCount / limit) : 1,
      data: formattedPackages,
      packages: formattedPackages,
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
      assignedGuides,
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
    } else if (highlights) {
      highlightsPayload = typeof highlights === "string" ? highlights.trim() : JSON.stringify(highlights);
    }

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
        highlights: highlightsPayload,
        featuredImage: featuredImage || "/brand/poster.jpg",
        heroImage,
        thumbnailImage,
        gallery: typeof gallery === "string" ? gallery : JSON.stringify(gallery || []),
        makkahHotelName: makkahHotelName || "Diyafa Jamal or similar",
        makkahDistance: makkahDistance || "500m walking",
        makkahHotelRating: Number(makkahHotelRating) || 4,
        makkahRoomType,
        makkahMealPlan,
        makkahDescription: makkahDescription
          ? String(makkahDescription).trim()
          : body.makkahAddress
          ? String(body.makkahAddress).trim()
          : null,
        makkahAmenities,
        makkahImage,
        madinahHotelName: madinahHotelName || "Ilaf Kuba or similar",
        madinahDistance: madinahDistance || "400m walking",
        madinahHotelRating: Number(madinahHotelRating) || 4,
        madinahRoomType,
        madinahMealPlan,
        madinahDescription: madinahDescription
          ? String(madinahDescription).trim()
          : body.madinahAddress
          ? String(body.madinahAddress).trim()
          : null,
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
        assignedGuides:
          typeof assignedGuides === "string"
            ? assignedGuides
            : JSON.stringify(assignedGuides || []),
        registrationDeadline,
        sortOrder: Number(sortOrder) || 0,
        // Inclusions and Exclusions
        inclusions: {
          create: [
            ...inclusions
              .map((inc: any) => {
                const rawTitle = typeof inc === "string" ? inc : (inc?.title || inc?.name || inc?.text || String(inc));
                const title = (rawTitle || "").trim();
                return {
                  title,
                  description: inc?.description ? String(inc.description).trim() : null,
                  icon: inc?.icon || "CheckCircle2",
                  isIncluded: true,
                };
              })
              .filter((inc: any) => Boolean(inc.title)),
            ...exclusions
              .map((exc: any) => {
                const rawTitle = typeof exc === "string" ? exc : (exc?.title || exc?.name || exc?.text || String(exc));
                const title = (rawTitle || "").trim();
                return {
                  title,
                  description: exc?.description ? String(exc.description).trim() : null,
                  icon: exc?.icon || "XCircle",
                  isIncluded: false,
                };
              })
              .filter((exc: any) => Boolean(exc.title)),
          ],
        },
        // Itineraries
        itineraries: {
          create: itineraries.map((it: any, index: number) => ({
            dayNumber: Number(it.dayNumber) || index + 1,
            title: String(it.title || `Day ${index + 1}`).trim(),
            location: String(it.location || "Makkah").trim(),
            hotel: it.hotel ? String(it.hotel).trim() : null,
            activities: String(it.activities || it.description || "").trim(),
            meals: it.meals ? String(it.meals).trim() : null,
            transport: it.transport ? String(it.transport).trim() : null,
            notes: it.notes ? String(it.notes).trim() : null,
            images: it.images ? (typeof it.images === "string" ? it.images : JSON.stringify(it.images)) : null,
            sortOrder: Number(it.sortOrder) || index + 1,
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

