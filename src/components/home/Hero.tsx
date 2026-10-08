"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
  Compass,
  Calendar,
  ShieldCheck,
  Users,
  Building,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-forest-950 text-white min-h-[85vh] flex items-center">
      {/* Background Cinematic Visual with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
        <Image
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1920&auto=format&fit=crop"
          alt="The Holy Kaaba at Masjid Al-Haram Makkah"
          fill
          priority
          className="object-cover object-center scale-105 animate-pulse duration-[10000ms]"
        />
      </div>

      {/* Atmospheric Dark & Emerald Radial Gradients */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-forest-950 via-forest-950/85 to-forest-900/60" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-500/15 via-transparent to-transparent" />

      {/* Subtle Pattern Grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0b533b12_1px,transparent_1px),linear-gradient(to_bottom,#0b533b12_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 md:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Top Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-900/90 border border-gold-500/30 text-gold-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>1448 Hijri Booking Open • Maharashtra Departures</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
              {t("hero_headline").split(",")[0]},
              <br />
              <span className="gold-gradient-text">
                {t("hero_headline").split(",")[1] || "Handled With Care."}
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed max-w-xl font-normal">
              {t("hero_sub")}
            </p>

            {/* Key Value Points */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-emerald-200/90 max-w-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Hotels 400m - 500m to Haram</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Scholarly Guidance (5 Umrahs)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>3-Times Daily Indian Buffet</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Direct Return Flights</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Featured Next Departure Card */}
            <div className="bg-gradient-to-b from-forest-900/90 to-forest-950/95 border border-gold-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl" />

              {/* Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Next Confirmed Departure
                </span>
                <span className="text-[11px] font-semibold bg-gold-500/20 text-gold-300 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                  20 Days Journey
                </span>
              </div>

              {/* Package Title */}
              <div className="py-4">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Umrah Platinum Package
                </h3>
                <p className="text-xs text-emerald-300 mt-1">
                  Departing: <strong>31 October – 19 November 2026</strong>
                </p>
                <p className="text-xs text-emerald-200/70 mt-0.5">
                  Direct Mumbai Flight • 12N Makkah • 7N Madinah
                </p>
              </div>

              {/* Key Features List */}
              <div className="space-y-2 py-3 border-y border-white/10 text-xs text-emerald-100">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-300/80">Makkah Hotel:</span>
                  <span className="font-semibold text-right">Diyafa Jamal (500m)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-300/80">Madinah Hotel:</span>
                  <span className="font-semibold text-right">Ilaf Kuba (400m)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-300/80">Spiritual Guides:</span>
                  <span className="font-semibold text-right text-gold-300">
                    Hafiz Asrar & Hafiz Sameer
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-300/80">Seats Available:</span>
                  <span className="font-bold text-amber-300">17 of 45 remaining</span>
                </div>
              </div>

              {/* Price & Book Action */}
              <div className="pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-300/70 block">Starting from</span>
                  <span className="text-2xl font-extrabold text-gold-400">
                    ₹1,20,000<span className="text-xs font-normal text-white/70">/pax</span>
                  </span>
                </div>

                <Link
                  href="/packages/umrah-platinum-package-2026"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-gold-400 hover:bg-gold-300 text-forest-950 px-4 py-2.5 rounded-xl transition-all shadow-md"
                >
                  View Details & Book
                </Link>
              </div>
            </div>

            {/* Floating Trust Badges */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-forest-900/80 border border-gold-500/20 p-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <ShieldCheck className="w-7 h-7 text-gold-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Govt. Verified</div>
                  <div className="text-[10px] text-emerald-200/70">Full Visa & Insurance</div>
                </div>
              </div>
              <div className="bg-forest-900/80 border border-gold-500/20 p-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <Users className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Over 1,500+</div>
                  <div className="text-[10px] text-emerald-200/70">Pilgrims Served</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

