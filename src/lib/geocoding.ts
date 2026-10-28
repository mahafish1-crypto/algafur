/**
 * AL GAFUR Reverse Geocoding Utility
 * 
 * Secure server-side reverse geocoding from latitude/longitude coordinates to human-readable address fields.
 * Supports:
 * 1. Google Maps Geocoding API (when GOOGLE_MAPS_API_KEY or GEOCODING_API_KEY is configured)
 * 2. OpenStreetMap Nominatim API (public fallback with strict timeout, rate limiting & required User-Agent)
 * 
 * Safety & Privacy:
 * - Coordinates and API keys are NEVER exposed on the client.
 * - Timeouts are bounded (6 seconds).
 * - No addresses or coordinates are fabricated.
 */

export interface ReverseGeocodeResult {
  success: boolean;
  address: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  locationSource: "GPS";
  provider: "google" | "nominatim" | "none";
  error?: string;
}

export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  // Validate coordinate boundaries
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      success: false,
      address: "",
      city: "",
      district: "",
      state: "",
      postalCode: "",
      country: "",
      latitude: 0,
      longitude: 0,
      locationSource: "GPS",
      provider: "none",
      error: "Invalid GPS coordinates provided.",
    };
  }

  const googleKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GEOCODING_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 1. Prefer Google Maps Geocoding if configured
  if (googleKey && googleKey.trim().length > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${encodeURIComponent(
        googleKey.trim()
      )}`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.status === "OK" && Array.isArray(data.results) && data.results.length > 0) {
          const first = data.results[0];
          const components: Array<{ types: string[]; long_name: string; short_name: string }> =
            first.address_components || [];

          const getComp = (type: string) =>
            components.find((c) => c.types.includes(type))?.long_name || "";

          const city =
            getComp("locality") ||
            getComp("administrative_area_level_2") ||
            getComp("sublocality") ||
            "";
          const district = getComp("administrative_area_level_2") || "";
          const state = getComp("administrative_area_level_1") || "";
          const postalCode = getComp("postal_code") || "";
          const country = getComp("country") || "India";
          const address = first.formatted_address || [city, state, country].filter(Boolean).join(", ");

          return {
            success: true,
            address,
            city,
            district,
            state,
            postalCode,
            country,
            latitude,
            longitude,
            locationSource: "GPS",
            provider: "google",
          };
        }
      }
    } catch (googleErr) {
      console.warn("Google Maps reverse geocoding failed or timed out:", googleErr);
    }
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "AlGafurHajjUmrah/1.0 (contact@algafur.com; https://www.algafur.com)",
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};

      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.state_district ||
        addr.county ||
        "";
      const district = addr.state_district || addr.county || "";
      const state = addr.state || "";
      const postalCode = addr.postcode || "";
      const country = addr.country || "India";

      // Build clean street/neighbourhood address
      const localParts = [
        addr.house_number,
        addr.road,
        addr.suburb || addr.neighbourhood,
        city,
        state,
        postalCode,
      ].filter(Boolean);

      const address = data.display_name || localParts.join(", ");

      return {
        success: true,
        address,
        city,
        district,
        state,
        postalCode,
        country,
        latitude,
        longitude,
        locationSource: "GPS",
        provider: "nominatim",
      };
    } else if (response.status === 429) {
      return {
        success: false,
        address: "",
        city: "",
        district: "",
        state: "",
        postalCode: "",
        country: "",
        latitude,
        longitude,
        locationSource: "GPS",
        provider: "nominatim",
        error: "Location lookup rate limit reached. Please type your city/address manually.",
      };
    }
  } catch (nomErr) {
    console.warn("Nominatim reverse geocoding failed or timed out:", nomErr);
  }

  return {
    success: false,
    address: "",
    city: "",
    district: "",
    state: "",
    postalCode: "",
    country: "",
    latitude,
    longitude,
    locationSource: "GPS",
    provider: "none",
    error: "Unable to detect exact address from coordinates. Please enter your city/address manually.",
  };
}

