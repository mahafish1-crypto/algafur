"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Building, MapPin, Star, Wifi, Utensils, CheckCircle2, ArrowRight } from "lucide-react";

export default function HotelsPreview() {
  const hotels = [
    {
      name: "Diyafa Jamal",
      city: "Makkah Al-Mukarramah",
      distance: "500m (6 Mins Walk)",
      rating: 4,
      image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop",
      description: "Our signature Makkah stay located on Ibrahim Al-Khalil Road. Level walking pathway directly to King Abdulaziz Gate of Masjid Al-Haram.",
      features: ["500m Level Walk to Haram", "In-house Indian Chef", "Elevators & Luggage Porters", "Free Wi-Fi in all rooms"],
    },
    {
      name: "Ilaf Kuba / Dar Al Taqwa",
      city: "Madinah Al-Munawwarah",
      distance: "400m (5 Mins Walk)",
      rating: 4,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop",
      description: "Serene hotel in the central northern district of Madinah, granting fast, straightforward access to both the Men's and Women's courtyards of the Prophet's Mosque.",
      features: ["400m to Prophet's Courtyard", "Near Ladies Gate Access", "Spacious 4-Bed & 3-Bed Rooms", "24/7 Reception Desk"],
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold mb-2">
              <Building className="w-3.5 h-3.5 text-gold-600" />
              <span>Premium Holy Stays</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-forest-950">
              Hotels Walking Distance to the Haram
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
              No long shuttle waits or taxi hassles. Step out of your room and reach the Holy Sanctuary in minutes.
            </p>
          </div>

          <Link
            href="/hotels"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
          >
            <span>Explore All Hotels & Galleries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hotels.map((h, i) => (
            <div
              key={i}
              className="bg-ivory-100/50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-gold-500/40 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col md:flex-row"
            >
              <div className="relative md:w-5/12 h-56 md:h-auto min-h-[200px]">
                <Image
                  src={h.image}
                  alt={h.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 bg-forest-950/80 backdrop-blur-sm text-gold-300 text-[11px] font-bold px-2.5 py-1 rounded-md border border-gold-500/30">
                  {h.distance}
                </div>
              </div>

              <div className="p-6 md:w-7/12 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                      {h.city}
                    </span>
                    <div className="flex items-center gap-0.5 text-gold-500">
                      {[...Array(h.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-gold-500 text-gold-500" />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-forest-950">{h.name}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                    {h.description}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 mt-4 text-[11px] text-neutral-700">
                    {h.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/packages?hotel=${encodeURIComponent(h.name)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-forest-950 hover:text-emerald-700"
                  >
                    View Packages with this Hotel →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

