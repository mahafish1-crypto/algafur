"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Building,
  Plane,
  ShieldCheck,
  Utensils,
  Bus,
  Users,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface PackageCardData {
  id: string;
  slug: string;
  name: string;
  type: string;
  year?: string;
  durationDays: number;
  makkahNights: number;
  madinahNights: number;
  basePrice: number;
  departureDate: string;
  departureCity?: string;
  makkahHotelName?: string | null;
  madinahHotelName?: string | null;
  makkahDistance?: string | null;
  madinahDistance?: string | null;
  totalSeats: number;
  bookedSeats: number;
  badge?: string | null;
  featuredImage?: string | null;
  [key: string]: unknown;
}

interface PackageCardProps {
  pkg: PackageCardData;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const { t, formatPrice, localizeField } = useLanguage();
  const seatsRemaining = Math.max(0, pkg.totalSeats - pkg.bookedSeats);
  const isLimited = seatsRemaining > 0 && seatsRemaining <= 18;
  const localizedName = localizeField(pkg, "name", pkg.name);

  const defaultImage =
    pkg.slug.includes("platinum")
      ? "/brand/poster.jpg"
      : "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/80 hover:border-gold-500/40 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col justify-between">
      {/* Top Image & Badge Container */}
      <div className="relative h-52 w-full overflow-hidden bg-forest-950">
        <Image
          src={pkg.featuredImage || defaultImage}
          alt={localizedName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/20 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {pkg.badge && (
            <span className="bg-gradient-to-r from-gold-500 to-amber-600 text-forest-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-md tracking-wider">
              {pkg.badge}
            </span>
          )}
          {isLimited && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md animate-pulse">
              {seatsRemaining} {t("pkg_seats_left")}
            </span>
          )}
        </div>

        {/* Duration Chip */}
        <div className="absolute top-3 right-3 bg-forest-950/80 backdrop-blur-sm text-gold-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-gold-500/30 flex items-center gap-1">
          <Clock className="w-3 h-3 text-gold-400" />
          <span>
            {pkg.durationDays} {t("pkg_days")}
          </span>
        </div>

        {/* Bottom Banner inside Image: Stays */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-emerald-100 font-medium z-10">
          <span>
            {pkg.makkahNights}N Makkah • {pkg.madinahNights}N Madinah
          </span>
          <span className="text-gold-300 font-semibold">
            {pkg.departureCity || "Mumbai"} Flight
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Departure Date */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
            <Calendar className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
            <span>
              {t("pkg_departure")}: {pkg.departureDate}
            </span>
          </div>

          {/* Package Title */}
          <h3 className="text-lg font-serif font-bold text-forest-950 group-hover:text-emerald-800 transition-colors line-clamp-1">
            <Link href={`/packages/${pkg.slug}`}>{localizedName}</Link>
          </h3>

          {/* Hotel Highlights */}
          <div className="mt-3 space-y-1.5 text-xs bg-ivory-100/80 p-3 rounded-xl border border-neutral-100">
            <div className="flex items-start justify-between gap-2 text-neutral-700">
              <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                <Building className="w-3 h-3 text-gold-600 flex-shrink-0" /> {t("pkg_makkah_hotel")}:
              </span>
              <span className="font-medium text-right text-[11px] text-neutral-900">
                {pkg.makkahHotelName || "Diyafa Jamal"} ({pkg.makkahDistance || "500m"})
              </span>
            </div>
            <div className="flex items-start justify-between gap-2 text-neutral-700">
              <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                <Building className="w-3 h-3 text-gold-600 flex-shrink-0" /> {t("pkg_madinah_hotel")}:
              </span>
              <span className="font-medium text-right text-[11px] text-neutral-900">
                {pkg.madinahHotelName || "Ilaf Kuba"} ({pkg.madinahDistance || "400m"})
              </span>
            </div>
          </div>

          {/* Micro Inclusions Icons */}
          <div className="grid grid-cols-4 gap-1 pt-3 text-[10px] text-neutral-600 text-center">
            <div className="flex flex-col items-center p-1.5 rounded-lg bg-neutral-50">
              <Plane className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
              <span className="line-clamp-1">{t("pkg_direct_flight")}</span>
            </div>
            <div className="flex flex-col items-center p-1.5 rounded-lg bg-neutral-50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
              <span className="line-clamp-1">{t("pkg_visa_ins")}</span>
            </div>
            <div className="flex flex-col items-center p-1.5 rounded-lg bg-neutral-50">
              <Utensils className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
              <span className="line-clamp-1">{t("pkg_indian_buffet")}</span>
            </div>
            <div className="flex flex-col items-center p-1.5 rounded-lg bg-neutral-50">
              <Bus className="w-3.5 h-3.5 text-emerald-700 mb-0.5" />
              <span className="line-clamp-1">{t("pkg_full_ziyarat")}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-neutral-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] text-neutral-500 block uppercase font-medium">
                {t("pkg_starting_from")}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold font-serif text-forest-950">
                  {formatPrice(pkg.basePrice)}
                </span>
                <span className="text-[10px] text-neutral-500">{t("pkg_per_person")}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-neutral-500 block">{t("pkg_seat_status")}</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 justify-end">
                <Users className="w-3 h-3" />
                {seatsRemaining} {t("pkg_seats_open")}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/packages/${pkg.slug}`}
              className="text-center text-xs font-semibold py-2.5 px-3 rounded-lg border border-neutral-300 hover:border-forest-900 text-neutral-700 hover:text-forest-950 transition-colors"
            >
              {t("pkg_view_details")}
            </Link>
            <Link
              href={`/booking?package=${pkg.slug}`}
              className="text-center text-xs font-bold py-2.5 px-3 rounded-lg bg-forest-900 hover:bg-forest-950 text-gold-300 transition-colors shadow-sm"
            >
              {t("pkg_book_now")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

