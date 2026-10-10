import React from "react";
import prisma from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { Building, MapPin, Star, CheckCircle2, Wifi, Utensils, Coffee } from "lucide-react";

export const metadata = {
  title: "Hotels in Makkah & Madinah | Al-Gafur International Tours And Travels",
  description: "Explore our handpicked 4-star and luxury hotels within walking distance of Masjid Al-Haram and Masjid An-Nabawi.",
};

export const revalidate = 60;

export default async function HotelsPage() {
  let hotels: any[] = [];
  try {
    hotels = await prisma.hotel.findMany({
      orderBy: { starRating: "desc" },
    });
  } catch (err) {
    console.error("Failed to query hotels:", err);
  }

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Accommodations
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            Walking Distance Hotels in Holy Cities
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            No long coach waits. Stay within 400m to 500m of the sacred sanctuaries for effortless daily prayers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hotels.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-premium transition-all space-y-4 p-6 sm:p-8"
            >
              <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-forest-950">
                <Image
                  src={
                    h.city === "MAKKAH"
                      ? "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop"
                      : "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop"
                  }
                  alt={h.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 bg-forest-950/80 text-gold-300 text-xs font-bold px-3 py-1 rounded-md border border-gold-500/30">
                  {h.distanceFromHaram} Walking Distance
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    {h.city === "MAKKAH" ? "Makkah Al-Mukarramah" : "Madinah Al-Munawwarah"}
                  </span>
                  <div className="flex gap-1 text-gold-500">
                    {[...Array(h.starRating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold-500" />
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-forest-950 mt-1">{h.name}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2">{h.description}</p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  <strong>Location:</strong> {h.address}
                </p>

                <div className="pt-3 border-t border-neutral-100 mt-4 flex justify-between items-center">
                  <span className="text-xs text-neutral-600">
                    Walking Time: <strong>{h.walkingTime}</strong>
                  </span>
                  <Link
                    href={`/packages?hotel=${encodeURIComponent(h.name)}`}
                    className="text-xs font-bold text-forest-950 bg-gold-400 hover:bg-gold-300 px-4 py-2 rounded-xl"
                  >
                    View Packages
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

