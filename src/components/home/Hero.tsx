"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import {
  Compass,
  Calendar,
  ShieldCheck,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface HeroProps {
  featuredPackage?: {
    id?: string;
    slug: string;
    name: string;
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
  } | null;
  settings?: Record<string, string>;
}

export default function Hero({ featuredPackage }: HeroProps) {
  const { t, formatPrice, localizeField } = useLanguage();

  useEffect(() => {
    trackAnalyticsEvent({
      eventType: "HOME_VIEW",
      sourcePage: "/",
    });
  }, []);

  const pkg = featuredPackage || {
    slug: "umrah-platinum-package-2026",
    name: "Umrah Platinum Package",
    durationDays: 20,
    makkahNights: 12,
    madinahNights: 7,
    basePrice: 120000,
    departureDate: "31 October – 19 November 2026",
    departureCity: "Mumbai",
    makkahHotelName: "Diyafa Jamal",
    madinahHotelName: "Ilaf Kuba",
    makkahDistance: "500m",
    madinahDistance: "400m",
    totalSeats: 45,
    bookedSeats: 28,
  };

  const seatsRemaining = Math.max(0, pkg.totalSeats - pkg.bookedSeats);
  const pkgTitle = localizeField(pkg as Record<string, unknown>, "name", pkg.name);
  const headlineParts = t("hero_headline").split(",");

  return (
    <section className="relative overflow-hidden bg-forest-950 text-white min-h-[85vh] flex items-center">
      {/* Background Cinematic Visual with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
        <Image
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1920&auto=format&fit=crop"
          alt="The Holy Kaaba at Masjid Al-Haram Makkah"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
      </div>

      {/* Atmospheric Dark & Emerald Radial Gradients */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-forest-950 via-forest-950/85 to-forest-900/60" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-500/15 via-transparent to-transparent" />

      {/* Subtle Pattern Grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0b533b12_1px,transparent_1px),linear-gradient(to_bottom,#0b533b12_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-14 md:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Top Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-900/90 border border-gold-500/30 text-gold-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span>{t("hero_badge")}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
              {headlineParts[0]}
              {headlineParts.length > 1 ? "," : ""}
              {headlineParts[1] && (
                <>
                  <br />
                  <span className="gold-gradient-text">{headlineParts.slice(1).join(",")}</span>
                </>
              )}
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-emerald-100/85 leading-relaxed max-w-xl font-normal">
              {t("hero_sub")}
            </p>

            {/* Key Value Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-emerald-200/90 max-w-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>{t("hero_point_1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>{t("hero_point_2")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>{t("hero_point_3")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>{t("hero_point_4")}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-4">
              <Link
                href="/packages"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-forest-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 px-6 py-3.5 rounded-xl shadow-gold transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4" />
                {t("btn_explore_packages")}
              </Link>
              <Link
                href="#lead-form"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-100 hover:text-white bg-forest-900/80 hover:bg-forest-900 border border-gold-500/30 px-6 py-3.5 rounded-xl transition-all"
              >
                <Calendar className="w-4 h-4 text-gold-400" />
                {t("btn_plan_umrah")}
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual Card with Live Departure Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            {/* Featured Next Departure Card */}
            <div className="bg-gradient-to-b from-forest-900/90 to-forest-950/95 border border-gold-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl" />

              {/* Status Header */}
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {t("hero_next_departure")}
                </span>
                <span className="text-[11px] font-semibold bg-gold-500/20 text-gold-300 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                  {pkg.durationDays} {t("pkg_days")}
                </span>
              </div>

              {/* Package Title */}
              <div className="py-4">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {pkgTitle}
                </h3>
                <p className="text-xs text-emerald-300 mt-1">
                  {t("pkg_departure")}: <strong>{pkg.departureDate}</strong>
                </p>
                <p className="text-xs text-emerald-200/70 mt-0.5">
                  {pkg.departureCity || "Mumbai"} {t("pkg_direct_flight")} • {pkg.makkahNights}N Makkah • {pkg.madinahNights}N Madinah
                </p>
              </div>

              {/* Key Features List */}
              <div className="space-y-2 py-3 border-y border-white/10 text-xs text-emerald-100">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-emerald-300/80">{t("pkg_makkah_hotel")}:</span>
                  <span className="font-semibold text-right">
                    {pkg.makkahHotelName || "Diyafa Jamal"} ({pkg.makkahDistance || "500m"})
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-emerald-300/80">{t("pkg_madinah_hotel")}:</span>
                  <span className="font-semibold text-right">
                    {pkg.madinahHotelName || "Ilaf Kuba"} ({pkg.madinahDistance || "400m"})
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-emerald-300/80">Spiritual Guides:</span>
                  <span className="font-semibold text-right text-gold-300">
                    Hafiz Asrar &amp; Hafiz Sameer
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-emerald-300/80">{t("pkg_seat_status")}:</span>
                  <span className="font-bold text-amber-300">
                    {seatsRemaining} / {pkg.totalSeats} {t("pkg_seats_open")}
                  </span>
                </div>
              </div>

              {/* Price & Book Action */}
              <div className="pt-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-emerald-300/70 block">
                    {t("pkg_starting_from")}
                  </span>
                  <span className="text-2xl font-extrabold text-gold-400">
                    {formatPrice(pkg.basePrice)}
                    <span className="text-xs font-normal text-white/70">{t("pkg_per_person")}</span>
                  </span>
                </div>

                <Link
                  href={`/packages/${pkg.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-gold-400 hover:bg-gold-300 text-forest-950 px-4 py-2.5 rounded-xl transition-all shadow-md"
                >
                  {t("pkg_view_details")} &amp; {t("pkg_book_now")}
                </Link>
              </div>
            </div>

            {/* Floating Trust Badges */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-forest-900/80 border border-gold-500/20 p-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <ShieldCheck className="w-7 h-7 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">{t("hero_govt_verified")}</div>
                  <div className="text-[10px] text-emerald-200/70">{t("hero_full_visa")}</div>
                </div>
              </div>
              <div className="bg-forest-900/80 border border-gold-500/20 p-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <Users className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">{t("hero_pilgrims_count")}</div>
                  <div className="text-[10px] text-emerald-200/70">{t("hero_pilgrims_served")}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

