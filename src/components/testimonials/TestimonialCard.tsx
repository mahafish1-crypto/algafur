"use client";

import React from "react";
import Image from "next/image";
import {
  Star,
  ShieldCheck,
  Video,
  Play,
  MapPin,
  Quote,
  Instagram,
} from "lucide-react";
import { parseVideoUrl } from "@/lib/video-parser";

export interface TestimonialCardData {
  id?: string;
  customerName?: string;
  name?: string;
  pilgrimName?: string;
  city?: string;
  packageTitle?: string;
  packageTaken?: string;
  package?: string;
  rating?: number;
  reviewText?: string;
  review?: string;
  photo?: string | null;
  photoUrl?: string | null;
  videoUrl?: string | null;
  isFeatured?: boolean;
}

interface TestimonialCardProps {
  testimonial: TestimonialCardData;
  isPlaying?: boolean;
  onPlay?: () => void;
  className?: string;
}

export default function TestimonialCard({
  testimonial,
  isPlaying = false,
  onPlay,
  className = "",
}: TestimonialCardProps) {
  const name =
    testimonial.customerName ||
    testimonial.name ||
    testimonial.pilgrimName ||
    "Blessed Pilgrim";
  const city = testimonial.city || "";
  const pkgTitle =
    testimonial.packageTitle ||
    testimonial.packageTaken ||
    testimonial.package ||
    "Umrah Deluxe Group";
  const rating =
    typeof testimonial.rating === "number"
      ? Math.min(5, Math.max(1, testimonial.rating))
      : 5;
  const review = testimonial.reviewText || testimonial.review || "";
  const photo = testimonial.photo || testimonial.photoUrl || null;
  const video = parseVideoUrl(testimonial.videoUrl);

  const initials =
    name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "HA";

  const hasVideo = Boolean(video.embedUrl);
  const isVertical = video.type === "instagram" || Boolean(video.isShort);

  return (
    <div
      className={`bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200 hover:border-gold-500/50 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div className="space-y-4">
        {/* Top Header: Star Rating & Verified Pilgrim Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gold-500">
            {[...Array(rating)].map((_, idx) => (
              <Star
                key={idx}
                className="w-3.5 h-3.5 fill-gold-500 text-gold-500"
              />
            ))}
            <span className="text-[11px] font-bold text-neutral-700 ml-1">
              {rating}.0
            </span>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Verified Pilgrim</span>
          </div>
        </div>

        {/* Video Player or Embed if present */}
        {hasVideo && (
          <div className="my-2">
            {isVertical ? (
              /* Vertical Container for Instagram Reels & YouTube Shorts */
              <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[520px] sm:max-h-[540px] mx-auto shadow-md border border-gray-800">
                {isPlaying ? (
                  <iframe
                    src={video.embedUrl || ""}
                    title={`${name}'s Video Review`}
                    className="w-full h-full border-0"
                    allow={
                      video.type === "instagram"
                        ? "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        : "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    }
                    allowFullScreen
                    scrolling="no"
                  />
                ) : (
                  <div
                    onClick={onPlay}
                    className="w-full h-full relative cursor-pointer flex flex-col items-center justify-center bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 text-white overflow-hidden group"
                  >
                    {video.thumbnailUrl && (
                      <Image
                        src={video.thumbnailUrl}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-forest-950/40 group-hover:bg-forest-950/20 transition-colors" />

                    <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-tr from-gold-500 to-amber-300 text-forest-950 flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-forest-950 ml-0.5" />
                    </div>

                    <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/10">
                      <span className="flex items-center gap-1.5">
                        {video.type === "instagram" ? (
                          <Instagram className="w-3.5 h-3.5 text-pink-400" />
                        ) : (
                          <Video className="w-3.5 h-3.5 text-gold-400" />
                        )}
                        <span>{video.type === "instagram" ? "Watch Reel" : "Watch Short"}</span>
                      </span>
                      <span className="text-[10px] text-gold-300 font-bold uppercase tracking-wider">
                        Play
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Standard Landscape 16:9 Container for YouTube Videos */
              <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-[16/9] shadow-md border border-gray-800">
                {isPlaying ? (
                  <iframe
                    src={video.embedUrl || ""}
                    title={`${name}'s Video Review`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    scrolling="no"
                  />
                ) : (
                  <div
                    onClick={onPlay}
                    className="w-full h-full relative cursor-pointer flex items-center justify-center bg-forest-950 overflow-hidden group"
                  >
                    {video.thumbnailUrl && (
                      <Image
                        src={video.thumbnailUrl}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-forest-950/40 group-hover:bg-forest-950/20 transition-colors" />

                    <div className="relative z-10 w-12 h-12 rounded-full bg-gold-500 text-forest-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-forest-950 ml-0.5" />
                    </div>

                    <div className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black/75 text-white text-[10px] font-semibold">
                      <Video className="w-3 h-3 text-gold-400" />
                      <span>Play Video Review</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Review Text */}
        <p className="text-xs sm:text-[13px] text-neutral-700 leading-relaxed italic">
          &ldquo;{review}&rdquo;
        </p>
      </div>

      {/* Pilgrim Profile Footer */}
      <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/70 mt-4">
        {photo ? (
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-forest-900 flex-shrink-0 border-2 border-gold-400 shadow-sm">
            <Image
              src={photo}
              alt={name}
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
            {name}
          </h4>
          {city && (
            <p className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-neutral-400 inline" />
              <span>{city}</span>
            </p>
          )}
          {pkgTitle && (
            <p className="text-[10px] text-gold-700 font-semibold truncate">
              {pkgTitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
