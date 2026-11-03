import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSiteSettings, getWhatsAppApiKey } from "@/lib/settings";
import { buildCanonicalUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate Request via Bearer Token or ?api_key= query parameter
    const authHeader = req.headers.get("authorization");
    let providedKey = "";

    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      providedKey = authHeader.substring(7).trim();
    } else {
      const urlKey = req.nextUrl.searchParams.get("api_key");
      if (urlKey) {
        providedKey = urlKey.trim();
      }
    }

    const expectedKey = await getWhatsAppApiKey();

    if (!providedKey || providedKey !== expectedKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Valid API key required via Authorization Bearer token or ?api_key= query parameter.",
        },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 2. Fetch Active Settings, Published Packages, and Approved Testimonials in Parallel
    const [settings, packages, testimonials] = await Promise.all([
      getSiteSettings().catch((): Record<string, string> => ({})),
      prisma.package.findMany({
        where: { status: "PUBLISHED" },
        include: {
          inclusions: true,
          makkahHotel: true,
          madinahHotel: true,
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }),
      prisma.testimonial.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 10,
      }),
    ]);

    // 3. Format Company Branding & Helplines
    const companyName =
      settings.company_name || "AL GAFUR INTERNATIONAL TOURS AND TRAVELS";
    const companyTagline =
      settings.company_tagline || "Your Sacred Journey, Our Sacred Trust";
    const contactNumbers = [
      settings.company_phone_1 || "+91 8793939393",
      settings.company_phone_2 || "+91 9890708013",
      settings.company_phone_3,
    ].filter(Boolean) as string[];

    const rawWa = (settings.whatsapp_number || "919890708013").trim();
    const whatsappNumber = rawWa.startsWith("+")
      ? `+${rawWa.replace(/^\++/, "")}`
      : `+${rawWa}`;

    const email = settings.company_email || "contact@algafur.com";
    const headOffice =
      settings.company_address ||
      "183, M.G. Road, 15 August Chowk, Khadda Market, Near Camp, Pune - 411001, Maharashtra, India.";
    const website = buildCanonicalUrl("/");

    // Standard Inclusions / Exclusions Fallback
    const DEFAULT_INCLUSIONS = [
      "Umrah Tourist / eVisa Processing with Medical Insurance",
      "Direct Round-trip Airline Flight Tickets",
      "Verified Hotel Accommodations in Makkah & Madinah",
      "3 Daily Fresh Indian Buffet Meals (Breakfast, Lunch, Dinner)",
      "Daily Laundry Assistance & Room Service Support",
      "Air-conditioned Luxury Bus Transportation for All Transfers",
      "Complete Guided Holy Ziyarat in Makkah & Madinah",
      "5 Litres Sealed Zamzam Water Bottle per Pilgrim",
      "Pilgrim Welcome Kit (Trolley Bag, Ihram, Tasbeeh & Umrah Book)",
    ];

    const DEFAULT_EXCLUSIONS = [
      "Room service, private telephone calls & personal expenses",
      "Excess baggage charges beyond standard airline allowance",
      "Private wheelchair attendant charges at Haram",
      "Custom individual transport outside scheduled group itineraries",
    ];

    // 4. Map Packages to A-to-Z JSON Specification
    const formattedPackages = packages.map((pkg) => {
      // Inclusions / Exclusions
      const packageInclusions = pkg.inclusions
        .filter((inc) => inc.isIncluded)
        .map((inc) => (inc.description ? `${inc.title} - ${inc.description}` : inc.title));

      const packageExclusions = pkg.inclusions
        .filter((inc) => !inc.isIncluded)
        .map((exc) => (exc.description ? `${exc.title} - ${exc.description}` : exc.title));

      let finalInclusions =
        packageInclusions.length > 0 ? packageInclusions : DEFAULT_INCLUSIONS;
      let finalExclusions =
        packageExclusions.length > 0 ? packageExclusions : DEFAULT_EXCLUSIONS;

      if (packageInclusions.length === 0 && pkg.features) {
        try {
          const parsed =
            typeof pkg.features === "string"
              ? JSON.parse(pkg.features)
              : pkg.features;
          if (Array.isArray(parsed) && parsed.length > 0) {
            finalInclusions = parsed;
          }
        } catch {
          // keep defaults
        }
      }

      // Package Category & Type
      const category = pkg.type || "UMRAH";
      let packageType = pkg.badge || "Standard";
      if (!pkg.badge) {
        const lowerSlug = pkg.slug.toLowerCase();
        if (lowerSlug.includes("platinum")) packageType = "Platinum";
        else if (lowerSlug.includes("deluxe")) packageType = "Deluxe";
        else if (lowerSlug.includes("economy")) packageType = "Economy";
      }

      // Hotel Distances & Addresses
      const makkahHotelName =
        pkg.makkahHotel?.name || pkg.makkahHotelName || "Diyafa Jamal or similar";
      const makkahDistance =
        pkg.makkahHotel?.distanceFromHaram ||
        pkg.makkahDistance ||
        "500m walking";
      const makkahAddress =
        pkg.makkahHotel?.address || "Ajyad / Ibrahim Khalil Road, Makkah Al-Mukarramah";
      const makkahStars =
        pkg.makkahHotel?.starRating || pkg.makkahHotelRating || 4;

      const madinahHotelName =
        pkg.madinahHotel?.name || pkg.madinahHotelName || "Ilaf Kuba or similar";
      const madinahDistance =
        pkg.madinahHotel?.distanceFromHaram ||
        pkg.madinahDistance ||
        "400m walking";
      const madinahAddress =
        pkg.madinahHotel?.address || "Central Northern Area, Madinah Al-Munawwarah";
      const madinahStars =
        pkg.madinahHotel?.starRating || pkg.madinahHotelRating || 4;

      // Flight Details
      const isDirect =
        pkg.flightType !== "CONNECTING" &&
        (Boolean(pkg.airline) || Boolean(pkg.flightDetails) || pkg.flightType === "DIRECT");

      const airline =
        pkg.airline ||
        (pkg.flightDetails ? "Direct Group Airline" : "Saudi Airlines / Direct Charter");
      const departureCity = pkg.departureAirport
        ? `${pkg.departureCity} (${pkg.departureAirport})`
        : pkg.departureCity || "Mumbai (BOM)";
      const arrivalCity = pkg.arrivalAirport || "Jeddah (JED) / Madinah (MED)";

      // Pricing & Sharing Variants
      const startingPrice = pkg.priceQuad || pkg.basePrice;
      const currency = pkg.currency || "INR";
      const sharingVariants = {
        quadSharing: pkg.priceQuad || pkg.basePrice,
        tripleSharing: pkg.priceTriple || Math.round(pkg.basePrice * 1.1),
        doubleSharing: pkg.priceDouble || Math.round(pkg.basePrice * 1.25),
        singleRoom: pkg.priceSingle || Math.round(pkg.basePrice * 1.5),
      };

      const publicUrl = buildCanonicalUrl(`/packages/${pkg.slug}`);
      const quickEnquiryUrl = `${publicUrl}#lead-form`;

      return {
        id: pkg.id,
        title: pkg.name,
        slug: pkg.slug,
        category,
        packageType,
        totalDurationDays: pkg.durationDays,
        departureSchedule: {
          hasSpecificDates: Boolean(pkg.hasSpecificDates),
          frequency: pkg.hasSpecificDates
            ? null
            : pkg.departureCycle || "1st & 3rd Week of Every Month",
          startDate: pkg.startDate ? pkg.startDate.toISOString() : null,
          endDate: pkg.endDate ? pkg.endDate.toISOString() : null,
        },
        stayBreakdown: {
          makkahNights: pkg.makkahNights,
          madinahNights: pkg.madinahNights,
        },
        pricing: {
          startingPrice,
          currency,
          sharingVariants,
        },
        hotels: {
          makkah: {
            name: makkahHotelName,
            starRating: makkahStars,
            distanceFromHaram: makkahDistance,
            address: makkahAddress,
          },
          madinah: {
            name: madinahHotelName,
            starRating: madinahStars,
            distanceFromHaram: madinahDistance,
            address: madinahAddress,
          },
        },
        flightDetails: {
          airline,
          isDirect,
          departureCity,
          arrivalCity,
        },
        inclusions: finalInclusions,
        exclusions: finalExclusions,
        publicUrl,
        quickEnquiryUrl,
      };
    });

    // 5. Format Approved Testimonials
    const formattedTestimonials = testimonials.map((t) => ({
      customerName: t.customerName,
      city: t.city || "Pune",
      rating: t.rating || 5,
      review: t.reviewText,
    }));

    // 6. Assemble Full Response Payload
    const payload = {
      success: true,
      generatedAt: new Date().toISOString(),
      company: {
        name: companyName,
        tagline: companyTagline,
        contactNumbers,
        whatsappNumber,
        email,
        headOffice,
        website,
      },
      packages: formattedPackages,
      testimonials: formattedTestimonials,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: unknown) {
    console.error("Error in /api/v1/whatsapp/summary:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
