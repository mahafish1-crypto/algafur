import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { getPublishedHotels } from "@/lib/packages-data";
import {
  parseHotelImages,
  parseHotelAmenities,
  formatHotelCityLabel,
} from "@/lib/hotel-helpers";

export const metadata = {
  title: "Hotels in Makkah & Madinah | Al-Gafur International Tours And Travels",
  description:
    "Explore our handpicked hotels within walking distance of Masjid Al-Haram and Masjid An-Nabawi.",
};

export const revalidate = 60;

export default async function HotelsPage() {
  const hotels = await getPublishedHotels().catch((err) => {
    console.error("Failed to query hotels:", err);
    return [];
  });

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Accommodations
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            Hotels in Makkah &amp; Madinah
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Verified partner accommodations selected for comfort and convenient access to the sacred sanctuaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hotels.map((h) => {
            const media = parseHotelImages(h.images, h.city);
            const amenities = parseHotelAmenities(h.amenities);
            const distance = h.distanceFromHaram || (h as any).distanceToHaram || "";
            const starCount =
              typeof h.starRating === "number" && h.starRating > 0
                ? Math.min(5, h.starRating)
                : 0;

            return (
              <div
                key={h.id}
                className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-premium transition-all flex flex-col justify-between p-6 sm:p-8"
              >
                <div className="space-y-4">
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-forest-950">
                    <Image
                      src={media.mainImage}
                      alt={h.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {distance && (
                      <div className="absolute top-3 left-3 bg-forest-950/85 text-gold-300 text-xs font-bold px-3 py-1 rounded-md border border-gold-500/30">
                        {distance} from Haram
                      </div>
                    )}
                  </div>

                  {media.gallery.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {media.gallery.slice(0, 4).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative h-16 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100"
                        >
                          <Image
                            src={imgUrl}
                            alt={`${h.name} photo ${idx + 2}`}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                        {formatHotelCityLabel(h.city)}
                      </span>
                      {starCount > 0 && (
                        <div className="flex gap-1 text-gold-500">
                          {[...Array(starCount)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-gold-500" />
                          ))}
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-serif font-bold text-forest-950 mt-1">
                      {h.name}
                    </h3>

                    {h.description && (
                      <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                        {h.description}
                      </p>
                    )}

                    {h.address && (
                      <p className="text-xs text-neutral-600 mt-2 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                        <span>{h.address}</span>
                      </p>
                    )}

                    {h.mapLocation && (
                      <a
                        href={h.mapLocation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 mt-1.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View on Google Maps
                      </a>
                    )}

                    {amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {amenities.map((am, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] bg-ivory-100 text-forest-950 px-2.5 py-1 rounded-lg border border-neutral-200 font-medium"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {am}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 mt-5 flex justify-between items-center">
                  <span className="text-xs text-neutral-600 flex items-center gap-1.5">
                    {h.walkingTime ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-gold-600" />
                        <span>
                          Walking Time: <strong>{h.walkingTime}</strong>
                        </span>
                      </>
                    ) : distance ? (
                      <span>
                        Distance: <strong>{distance}</strong>
                      </span>
                    ) : (
                      <span>Verified Accommodation</span>
                    )}
                  </span>
                  <Link
                    href={`/packages?hotel=${encodeURIComponent(h.name)}`}
                    className="text-xs font-bold text-forest-950 bg-gold-400 hover:bg-gold-300 px-4 py-2 rounded-xl transition-colors"
                  >
                    View Packages
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
