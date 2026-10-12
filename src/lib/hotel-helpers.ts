export interface ParsedHotelMedia {
  mainImage: string;
  gallery: string[];
  allImages: string[];
  contactPhone: string;
  contactEmail: string;
}

export function parseHotelImages(
  imagesRaw: string | null | undefined,
  city?: string | null,
  fallbackUrl?: string | null
): ParsedHotelMedia {
  const defaultMakkah =
    "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop";
  const defaultMadinah =
    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop";
  const cityDefault =
    String(city || "").toUpperCase() === "MADINAH" ? defaultMadinah : defaultMakkah;

  let mainImage = fallbackUrl || "";
  let gallery: string[] = [];
  let contactPhone = "";
  let contactEmail = "";

  if (imagesRaw && imagesRaw.trim()) {
    try {
      const parsed = JSON.parse(imagesRaw);
      if (Array.isArray(parsed)) {
        const validUrls = parsed
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
        if (validUrls.length > 0) {
          mainImage = validUrls[0];
          gallery = validUrls.slice(1);
        }
      } else if (parsed && typeof parsed === "object") {
        if (typeof parsed.mainImage === "string" && parsed.mainImage.trim()) {
          mainImage = parsed.mainImage.trim();
        }
        if (Array.isArray(parsed.gallery)) {
          gallery = parsed.gallery
            .map((u: unknown) => (typeof u === "string" ? u.trim() : ""))
            .filter(Boolean);
        }
        if (typeof parsed.contactPhone === "string") {
          contactPhone = parsed.contactPhone.trim();
        }
        if (typeof parsed.contactEmail === "string") {
          contactEmail = parsed.contactEmail.trim();
        }
      }
    } catch {
      if (imagesRaw.startsWith("http") || imagesRaw.startsWith("/")) {
        const parts = imagesRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (parts.length > 0) {
          mainImage = parts[0];
          gallery = parts.slice(1);
        }
      }
    }
  }

  const resolvedMain = mainImage || fallbackUrl || cityDefault;
  const allImages = [
    resolvedMain,
    ...gallery.filter((url) => url && url !== resolvedMain),
  ];

  return {
    mainImage: resolvedMain,
    gallery,
    allImages,
    contactPhone,
    contactEmail,
  };
}

export function serializeHotelImages(input: {
  mainImage?: string;
  gallery?: string[];
  contactPhone?: string;
  contactEmail?: string;
}): string {
  const mainImage = (input.mainImage || "").trim();
  const gallery = Array.isArray(input.gallery)
    ? input.gallery.map((u) => String(u || "").trim()).filter(Boolean)
    : [];
  const contactPhone = (input.contactPhone || "").trim();
  const contactEmail = (input.contactEmail || "").trim();

  return JSON.stringify({
    mainImage,
    gallery,
    contactPhone,
    contactEmail,
  });
}

export function parseHotelAmenities(
  amenitiesRaw: string | null | undefined
): string[] {
  if (!amenitiesRaw || !amenitiesRaw.trim()) return [];
  try {
    const parsed = JSON.parse(amenitiesRaw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
  } catch {
    // Fallback to comma-separated string
  }
  return amenitiesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatHotelCityLabel(city?: string | null): string {
  const normalized = String(city || "").toUpperCase();
  if (normalized === "MAKKAH") return "Makkah Al-Mukarramah";
  if (normalized === "MADINAH") return "Madinah Al-Munawwarah";
  if (normalized === "JEDDAH") return "Jeddah";
  return city || "Holy City";
}

