"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Quote, MessageSquarePlus, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import TestimonialCard from "@/components/testimonials/TestimonialCard";

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
  videoUrl?: string | null;
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
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const reviews = (dbTestimonials || []).map((item) => ({
    id: item.id,
    name: item.customerName || item.pilgrimName || "Blessed Pilgrim",
    city: item.city || "",
    package: item.packageTitle || item.packageTaken || "Umrah Deluxe Group",
    rating: typeof item.rating === "number" ? Math.min(5, Math.max(0, item.rating)) : 5,
    photo: item.photo || item.photoUrl || "",
    review: item.reviewText || item.review || "",
    videoUrl: item.videoUrl || null,
    isFeatured: Boolean(item.isFeatured),
  }));

  if (reviews.length === 0) {
    return null;
  }

  // Show up to 6 on homepage
  const displayedReviews = reviews.slice(0, 6);

  return (
    <section className="py-20 bg-ivory-50/60 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold mb-3 border border-emerald-200/60">
            <Quote className="w-3.5 h-3.5 text-gold-600" />
            <span>Voices of Blessed Pilgrims</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-forest-950">
            {t("section_testimonials", "Real Stories, Genuine Blessings")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Read and watch authentic experiences from pilgrims who completed their sacred
            journey with AL GAFUR INTERNATIONAL TOURS AND TRAVELS.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {displayedReviews.map((r, i) => (
            <TestimonialCard
              key={r.id || i}
              testimonial={{
                id: r.id,
                customerName: r.name,
                city: r.city,
                packageTitle: r.package,
                rating: r.rating,
                reviewText: r.review,
                photo: r.photo,
                videoUrl: r.videoUrl,
                isFeatured: r.isFeatured,
              }}
              isPlaying={playingVideoId === (r.id || String(i))}
              onPlay={() => setPlayingVideoId(r.id || String(i))}
            />
          ))}
        </div>

        {/* Bottom CTAs */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-bold transition-all shadow-md group"
          >
            <span>View All Reviews &amp; Video Testimonials</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/reviews#share"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-400 hover:bg-gold-300 text-forest-950 text-xs font-bold transition-all shadow-gold"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-forest-950" />
            <span>Share Your Pilgrimage Experience</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
