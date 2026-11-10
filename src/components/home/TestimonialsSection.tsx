"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Quote, Video, Play, MessageSquarePlus, ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { parseVideoUrl } from "@/lib/video-parser";

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

  const reviews = (dbTestimonials || []).map((item) => {
    const video = parseVideoUrl(item.videoUrl);
    return {
      id: item.id,
      name: item.customerName || item.pilgrimName || "Blessed Pilgrim",
      city: item.city || "",
      package: item.packageTitle || item.packageTaken || "Umrah Deluxe Group",
      rating: typeof item.rating === "number" ? Math.min(5, Math.max(0, item.rating)) : 5,
      photo: item.photo || item.photoUrl || "",
      review: item.reviewText || item.review || "",
      video,
      isFeatured: Boolean(item.isFeatured),
    };
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedReviews.map((r, i) => {
            const initials = r.name
              .split(" ")
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase() || "HA";

            const hasVideo = Boolean(r.video.embedUrl);
            const isPlaying = playingVideoId === (r.id || String(i));

            return (
              <div
                key={r.id || i}
                className="bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200 hover:border-gold-500/50 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: Rating & Verified Pilgrim Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-gold-500">
                      {r.rating > 0 ? (
                        [...Array(r.rating)].map((_, idx) => (
                          <Star
                            key={idx}
                            className="w-3.5 h-3.5 fill-gold-500 text-gold-500"
                          />
                        ))
                      ) : (
                        <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                      )}
                      <span className="text-[11px] font-bold text-neutral-700 ml-1">
                        5.0
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified Pilgrim</span>
                    </div>
                  </div>

                  {/* Video Player or Preview (if attached) */}
                  {hasVideo && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-neutral-200 bg-black aspect-video relative group">
                      {isPlaying ? (
                        <iframe
                          src={r.video.embedUrl || ""}
                          title={`${r.name}'s Video Review`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <div
                          onClick={() => setPlayingVideoId(r.id || String(i))}
                          className="w-full h-full relative cursor-pointer flex items-center justify-center bg-forest-950 overflow-hidden"
                        >
                          {r.video.thumbnailUrl && (
                            <Image
                              src={r.video.thumbnailUrl}
                              alt={r.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-forest-950/40 group-hover:bg-forest-950/20 transition-colors" />
                          <div className="relative z-10 w-12 h-12 rounded-full bg-gold-500 text-forest-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-forest-950 ml-0.5" />
                          </div>
                          <div className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                            <Video className="w-3 h-3 text-gold-400" />
                            <span>Watch Pilgrim Video</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Written Review Quote */}
                  <p className="text-xs sm:text-[13px] text-neutral-700 leading-relaxed italic mb-6">
                    &ldquo;{r.review}&rdquo;
                  </p>
                </div>

                {/* Pilgrim Profile Footer */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/70">
                  {r.photo ? (
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-forest-900 flex-shrink-0 border-2 border-gold-400 shadow-sm">
                      <Image
                        src={r.photo}
                        alt={r.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-forest-950 text-gold-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border-2 border-gold-400 shadow-sm">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-forest-950 truncate">
                      {r.name}
                    </h4>
                    {r.city && (
                      <p className="text-[11px] text-neutral-500 truncate">{r.city}</p>
                    )}
                    {r.package && (
                      <p className="text-[10px] text-gold-700 font-semibold truncate">
                        {r.package}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
