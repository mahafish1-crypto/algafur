"use client";

import React from "react";
import Image from "next/image";
import { Star, Quote, CheckCircle2 } from "lucide-react";
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
}

interface TestimonialsSectionProps {
  testimonials?: TestimonialItem[];
}

export default function TestimonialsSection({ testimonials: dbTestimonials }: TestimonialsSectionProps) {
  const { t } = useLanguage();

  const defaultReviews = [
    {
      name: "Haji Nizam Tamboli",
      city: "Camp, Pune, Maharashtra",
      package: "Umrah Platinum Group 2026",
      rating: 5,
      photo: "/brand/img2.jpeg",
      review:
        "Alhamdulillah! Travelling with Al-Gafur was a life changing experience for me and my family. The hotels in Makkah (Diyafa Jamal) and Madinah (Ilaf Kuba) were genuinely walking distance from the holy mosques. The Indian meals were fresh every day, and our 5 Umrahs were guided with great care and humility by Hafiz Asrar Sahab.",
    },
    {
      name: "Adv. Farooq Baig",
      city: "Bandra, Mumbai",
      package: "Ramadan Umrah Special",
      rating: 5,
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
      review:
        "From visa issuance in record time to luggage handling and flight coordination, the Al-Gafur team handled everything like their own family members. Transparent pricing with no surprises. Highly recommended for elders.",
    },
    {
      name: "Haji Aslam Inamdar",
      city: "Ahmednagar, Maharashtra",
      package: "Umrah Deluxe Group",
      rating: 5,
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
      review:
        "The Taif excursion and historical Ziyarat to Badr, Uhud, and Bir-e-Usman were explained with authentic references by Hafiz Sameer Madani. Everything promised on their poster was delivered 100%. May Allah reward the Al-Gafur team.",
    },
  ];

  const reviews =
    dbTestimonials && dbTestimonials.length > 0
      ? dbTestimonials.map((item) => ({
          name: item.customerName || item.pilgrimName || "Pilgrim",
          city: item.city,
          package: item.packageTitle || item.packageTaken || "Umrah Tour",
          rating: item.rating || 5,
          photo: item.photo || item.photoUrl || "/brand/img2.jpeg",
          review: item.reviewText || item.review || "",
        }))
      : defaultReviews;

  return (
    <section className="py-20 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold mb-3">
            <Quote className="w-3.5 h-3.5 text-gold-600" />
            <span>Pilgrim Experiences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-forest-950">
            {t("section_testimonials")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Read heartfelt experiences from pilgrims who completed their sacred journey under our care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="bg-ivory-100/60 p-7 rounded-2xl border border-neutral-200/90 hover:border-gold-500/40 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-gold-500">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-emerald-200" />
                </div>

                <p className="text-xs text-neutral-700 leading-relaxed italic mb-6">
                  &ldquo;{r.review}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/60">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-forest-900 flex-shrink-0 border border-gold-400">
                  <Image
                    src={r.photo}
                    alt={r.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-forest-950 flex items-center gap-1">
                    <span>{r.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                  </h4>
                  <p className="text-[10px] text-neutral-500">{r.city}</p>
                  <p className="text-[10px] text-gold-700 font-semibold">{r.package}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

