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
  Sparkles,
  Building,
  Star,
  MapPin,
} from "lucide-react";

function extractMainHotelImage(imagesJson?: string | null, fallbackImg?: string | null): string | null {
  if (imagesJson) {
    try {
      const parsed = JSON.parse(imagesJson);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
        return parsed[0];
      }
      if (parsed && typeof parsed.mainImage === "string" && parsed.mainImage) {
        return parsed.mainImage;
      }
    } catch {
      if (imagesJson.startsWith("/") || imagesJson.startsWith("http")) {
        return imagesJson;
      }
    }
  }
  return fallbackImg || null;
}

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
    makkahHotelRating?: number | null;
    madinahHotelRating?: number | null;
    makkahImage?: string | null;
    madinahImage?: string | null;
    makkahHotel?: {
      id: string;
      name: string;
      city: string;
      starRating: number;
      distanceFromHaram: string;
      images?: string | null;
    } | null;
    madinahHotel?: {
      id: string;
      name: string;
      city: string;
      starRating: number;
      distanceFromHaram: string;
      images?: string | null;
    } | null;
    totalSeats: number;
    bookedSeats: number;
  } | null;
  settings?: Record<string, string>;
  spiritualGuides?: Array<{
    id: string;
    name: string;
    designation: string;
    photo?: string;
  }>;
}

export default function Hero({
  featuredPackage,
  settings = {},
  spiritualGuides = [],
}: HeroProps) {
  const { t, formatPrice, localizeField, language } = useLanguage();

  useEffect(() => {
    trackAnalyticsEvent({
      eventType: "HOME_VIEW",
      sourcePage: "/",
    });
  }, []);

  const pkg = featuredPackage || {
    slug: "umrah-platinum-package-2026",
    name: "Umrah Platinum Package (15 Days)",
    durationDays: 15,
    makkahNights: 8,
    madinahNights: 6,
    basePrice: 120000,
    departureDate: "31 October – 19 November 2026",
    departureCity: "Mumbai",
    makkahHotelName: "Diyafa Jamal",
    madinahHotelName: "Ilaf Kuba",
    makkahDistance: "500m walking",
    madinahDistance: "400m walking",
    makkahHotelRating: 4,
    madinahHotelRating: 4,
    makkahImage: null,
    madinahImage: null,
    makkahHotel: null,
    madinahHotel: null,
    totalSeats: 45,
    bookedSeats: 18,
  };

  const seatsRemaining = Math.max(0, pkg.totalSeats - pkg.bookedSeats);
  const pkgTitle = localizeField(pkg as Record<string, unknown>, "name", pkg.name);

  // Use Admin settings when configured (in default English), with localized fallback for other languages
  const isEnglish = language === "en";
  const heroBadge =
    (isEnglish && settings.hero_badge) || t("hero_badge", "2026 / 1448 Hijri Registrations Open");

  const defaultHeadlineParts = t("hero_headline", "Your Sacred Journey, Handled With Care.").split(",");
  const headlineMain =
    (isEnglish && settings.hero_headline_main) || defaultHeadlineParts[0] || "Your Sacred Journey";
  const headlineHighlight =
    (isEnglish && settings.hero_headline_highlight) ||
    defaultHeadlineParts.slice(1).join(",").trim() ||
    "Handled With Care.";

  const heroDescription =
    (isEnglish && settings.hero_description) ||
    t(
      "hero_sub",
      "Transparent pricing, direct flights from Mumbai, near-Haram hotels, Indian cuisine, and dedicated religious guidance."
    );

  const heroBgImage =
    settings.hero_bg_image ||
    "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1920&auto=format&fit=crop";

  const primaryCtaLabel =
    (isEnglish && settings.hero_cta_primary_label) || t("btn_explore_packages", "Explore 2026 Packages");
  const primaryCtaHref = settings.hero_cta_primary_href || "/packages";

  const secondaryCtaLabel =
    (isEnglish && settings.hero_cta_secondary_label) || t("btn_plan_umrah", "Request a Callback");
  const secondaryCtaHref = settings.hero_cta_secondary_href || "#lead-form";

  const showFeaturedCard = settings.hero_show_featured_card !== "false";

  const stat1Title =
    (isEnglish && settings.hero_stat_1_title) || t("hero_govt_verified", "100% Verified");
  const stat1Subtitle =
    (isEnglish && settings.hero_stat_1_subtitle) || t("hero_full_visa", "Ministry Approved Visa");

  const stat2Title =
    (isEnglish && settings.hero_stat_2_title) || t("hero_pilgrims_count", "1,500+ Pilgrims");
  const stat2Subtitle =
    (isEnglish && settings.hero_stat_2_subtitle) || t("hero_pilgrims_served", "Guided Across Maharashtra");

  // Resolved Makkah & Madinah Hotel details from linked DB relation or package fields
  const makkahName = pkg.makkahHotel?.name || pkg.makkahHotelName || "Diyafa Jamal";
  const makkahDist = pkg.makkahHotel?.distanceFromHaram || pkg.makkahDistance || "500m";
  const makkahStars = pkg.makkahHotel?.starRating || pkg.makkahHotelRating || 4;
  const makkahThumb = extractMainHotelImage(pkg.makkahHotel?.images, pkg.makkahImage);

  const madinahName = pkg.madinahHotel?.name || pkg.madinahHotelName || "Ilaf Kuba";
  const madinahDist = pkg.madinahHotel?.distanceFromHaram || pkg.madinahDistance || "400m";
  const madinahStars = pkg.madinahHotel?.starRating || pkg.madinahHotelRating || 4;
  const madinahThumb = extractMainHotelImage(pkg.madinahHotel?.images, pkg.madinahImage);

  const guidesLabel =
    spiritualGuides.length > 0
      ? spiritualGuides.map((g) => g.name).join(" & ")
      : "Hafiz Asrar Sahab & Hafiz Sameer Madani";

  return (
    <section className="relative overflow-hidden bg-forest-950 text-white min-h-[82vh] flex items-center">
      {/* Background Cinematic Visual with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
        <Image
          src={heroBgImage}
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-14 md:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={showFeaturedCard ? "lg:col-span-6 space-y-6" : "lg:col-span-10 space-y-6"}
          >
            {/* Top Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-900/90 border border-gold-500/30 text-gold-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span>{heroBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
              {headlineMain}
              {headlineHighlight && (
                <>
                  <br />
                  <span className="gold-gradient-text">{headlineHighlight}</span>
                </>
              )}
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-emerald-100/85 leading-relaxed max-w-xl font-normal">
              {heroDescription}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-forest-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 px-6 py-3.5 rounded-xl shadow-gold transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4" />
                {primaryCtaLabel}
              </Link>
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-100 hover:text-white bg-forest-900/80 hover:bg-forest-900 border border-gold-500/30 px-6 py-3.5 rounded-xl transition-all"
              >
                <Calendar className="w-4 h-4 text-gold-400" />
                {secondaryCtaLabel}
              </Link>
            </div>

            {/* Trust / Statistic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-lg">
              <div className="bg-forest-900/80 border border-gold-500/20 p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <ShieldCheck className="w-7 h-7 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">{stat1Title}</div>
                  <div className="text-[11px] text-emerald-200/75">{stat1Subtitle}</div>
                </div>
              </div>
              <div className="bg-forest-900/80 border border-gold-500/20 p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <Users className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">{stat2Title}</div>
                  <div className="text-[11px] text-emerald-200/75">{stat2Subtitle}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Featured Package Card with Highlighted Makkah & Madinah Hotels */}
          {showFeaturedCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-6 relative"
            >
              <div className="bg-gradient-to-b from-forest-900/95 to-forest-950/95 border border-gold-500/35 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md space-y-4">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl" />

                {/* Status Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {t("hero_next_departure")}
                  </span>
                  <span className="text-[11px] font-semibold bg-gold-500/20 text-gold-300 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                    {pkg.durationDays} {t("pkg_days")} • {pkg.makkahNights}N Makkah / {pkg.madinahNights}N Madinah
                  </span>
                </div>

                {/* Package Title & Departure */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    {pkgTitle}
                  </h2>
                  <p className="text-xs text-emerald-300 mt-1">
                    {t("pkg_departure")}: <strong>{pkg.departureDate}</strong> • {pkg.departureCity || "Mumbai"} {t("pkg_direct_flight")}
                  </p>
                </div>

                {/* Highlighted Makkah & Madinah Hotel Cards */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-gold-400" />
                      Near-Haram Hotel Accommodations
                    </span>
                    <Link
                      href={`/packages/${pkg.slug}#package-hotels`}
                      className="text-[11px] font-semibold text-emerald-300 hover:text-gold-300 underline"
                    >
                      View Hotel Details →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Makkah Hotel Highlight Card */}
                    <div className="bg-forest-950/90 border border-gold-500/25 rounded-2xl p-3 flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-forest-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
                        {makkahThumb ? (
                          <img
                            src={makkahThumb}
                            alt={makkahName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building className="w-6 h-6 text-gold-400/70" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                            Makkah
                          </span>
                          {makkahStars > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-gold-400 font-bold">
                              <Star className="w-2.5 h-2.5 fill-gold-400" />
                              {makkahStars}★
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-white truncate mt-0.5">
                          {makkahName}
                        </h3>
                        {makkahDist && (
                          <p className="text-[11px] text-emerald-200/80 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-gold-400 flex-shrink-0" />
                            <span>{makkahDist} from Haram</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Madinah Hotel Highlight Card */}
                    <div className="bg-forest-950/90 border border-gold-500/25 rounded-2xl p-3 flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-forest-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
                        {madinahThumb ? (
                          <img
                            src={madinahThumb}
                            alt={madinahName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building className="w-6 h-6 text-gold-400/70" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                            Madinah
                          </span>
                          {madinahStars > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-gold-400 font-bold">
                              <Star className="w-2.5 h-2.5 fill-gold-400" />
                              {madinahStars}★
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-white truncate mt-0.5">
                          {madinahName}
                        </h3>
                        {madinahDist && (
                          <p className="text-[11px] text-emerald-200/80 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-gold-400 flex-shrink-0" />
                            <span>{madinahDist} from Nabawi</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guides & Availability */}
                <div className="space-y-1.5 py-2.5 border-y border-white/10 text-xs text-emerald-100">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-emerald-300/80">Spiritual Guides:</span>
                    <span className="font-semibold text-right text-gold-300 truncate max-w-[220px]">
                      {guidesLabel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-emerald-300/80">{t("pkg_seat_status")}:</span>
                    <span className="font-bold text-amber-300">
                      {seatsRemaining} / {pkg.totalSeats} {t("pkg_seats_open")}
                    </span>
                  </div>
                </div>

                {/* Price & View Package Action */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-emerald-300/70 block">
                      {t("pkg_starting_from")}
                    </span>
                    <span className="text-2xl font-extrabold text-gold-400">
                      {formatPrice(pkg.basePrice)}
                      <span className="text-xs font-normal text-white/70">{t("pkg_per_person")}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/packages/${pkg.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-gold-400 hover:bg-gold-300 text-forest-950 px-4 py-2.5 rounded-xl transition-all shadow-md"
                    >
                      View Package &amp; Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
