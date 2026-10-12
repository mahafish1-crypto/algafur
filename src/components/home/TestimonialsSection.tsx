"use client";

import React from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface TestimonialItem {
  id?: string;
  pilgrimName?: string;
  customerName?: string;
  city: string;
  packageTaken?: string;
  packageTitle?: string;
  rating: number;
  review?: string;
  reviewText?: string;
  photoUrl?: string | null;
  photo?: string | null;
  isFeatured?: boolean;
  status?: string;
}

interface TestimonialsSectionProps {
  testimonials?: TestimonialItem[];
}

export default function TestimonialsSection({
  testimonials: dbTestimonials,
}: TestimonialsSectionProps) {
  const { t } = useLanguage();

  const reviews = (dbTestimonials || []).map((item) => ({
    id: item.id,
    name: item.customerName || item.pilgrimName || "Pilgrim",
    city: item.city || "",
    package: item.packageTitle || item.packageTaken || "",
    rating: typeof item.rating === "number" ? Math.min(5, Math.max(0, item.rating)) : 5,
    photo: item.photo || item.photoUrl || "",
    review: item.reviewText || item.review || "",
  }));

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold mb-3">
            <Quote className="w-3.5 h-3.5 text-gold-600" />
            <span>Pilgrim Experiences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-forest-950">
            {t("section_testimonials", "Voices of Blessed Pilgrims")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Read heartfelt experiences from pilgrims who completed their sacred
            journey with Al-Gafur Tours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => {
            const initials = r.name
              .split(" ")
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={r.id || i}
                className="bg-ivory-100/60 p-7 rounded-2xl border border-neutral-200/90 hover:border-gold-500/40 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {r.rating > 0 ? (
                      <div className="flex items-center gap-1 text-gold-500">
                        {[...Array(r.rating)].map((_, idx) => (
                          <Star
                            key={idx}
                            className="w-3.5 h-3.5 fill-gold-500 text-gold-500"
                          />
                        ))}
                      </div>
                    ) : (
                      <span />
                    )}
                    <Quote className="w-6 h-6 text-emerald-200" />
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed italic mb-6">
                    &ldquo;{r.review}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/60">
                  {r.photo ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-forest-900 flex-shrink-0 border border-gold-400">
                      <Image
                        src={r.photo}
                        alt={r.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-forest-900 text-gold-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-gold-400">
                      {initials}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-forest-950">
                      {r.name}
                    </h4>
                    {r.city && (
                      <p className="text-[10px] text-neutral-500">{r.city}</p>
                    )}
                    {r.package && (
                      <p className="text-[10px] text-gold-700 font-semibold">
                        {r.package}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
