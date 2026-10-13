import { NextRequest, NextResponse } from "next/server";
import { reverseGeocodeCoordinates } from "@/lib/geocoding";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon") || searchParams.get("lng");

    if (!latParam || !lonParam) {
      return NextResponse.json(
        { success: false, error: "Missing required 'lat' and 'lon' query parameters." },
        { status: 400 }
      );
    }

    const latitude = parseFloat(latParam);
    const longitude = parseFloat(lonParam);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: "Latitude and longitude must be valid floating point numbers." },
        { status: 400 }
      );
    }

    const result = await reverseGeocodeCoordinates(latitude, longitude);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Unable to resolve coordinates to address.",
          provider: result.provider,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        address: result.address,
        city: result.city,
        district: result.district,
        state: result.state,
        postalCode: result.postalCode,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude,
        locationSource: "GPS",
        provider: result.provider,
      },
    });
  } catch (err: unknown) {
    console.error("Reverse geocoding API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal error processing location lookup. Please enter your address manually.",
      },
      { status: 500 }
    );
  }
}

