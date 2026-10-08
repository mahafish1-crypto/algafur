"use client";

import React from "react";
import {
  Users,
  Building,
  Utensils,
  ShieldCheck,
  Compass,
  HeartHandshake,
  Bus,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function WhyChooseUs() {
  const { t } = useLanguage();

  const trustPillars = [
    {
      icon: Users,
      title: "Guided by Renowned Scholars",
      description:
        "Every pilgrimage is spiritually led by esteemed scholars including Hafiz Asrar Sahab & Hafiz Sameer Madani, ensuring authentic Sunnah practices and daily inspiring bayans.",
    },
    {
      icon: Building,
      title: "Hotels Within Walking Distance",
      description:
        "We prioritize proximity. Our chosen hotels in Makkah (Diyafa Jamal, 500m) and Madinah (Ilaf Kuba, 400m) ensure you never miss congregational prayers in the Haram.",
    },
    {
      icon: Utensils,
      title: "Authentic 3-Times Indian Buffet",
      description:
        "Enjoy hygienic breakfast, lunch, and dinner prepared by seasoned Indian chefs. Home-style taste that gives you energy and peace of mind during worship.",
    },
    {
      icon: Compass,
      title: "5 Complete Guided Umrahs",
      description:
        "Maximize your pilgrimage rewards. Beyond your initial arrival Umrah, our guides take you to Masjid Jorana, Masjid Ayesha (Tan'eem), Sulh Hudaibiya, and Taif.",
    },
    {
      icon: ShieldCheck,
      title: "100% Transparent & Licensed",
      description:
        "Zero hidden surprises. Direct flights, guaranteed seat allotments, official KSA Ministry of Hajj & Umrah endorsements, and comprehensive medical travel insurance.",
    },
    {
      icon: HeartHandshake,
      title: "Elderly & Wheelchair Support",
      description:
        "Special attention for senior citizens and families with children. Airport wheelchair assistance, luggage handling, and 24/7 dedicated local coordinators in Saudi Arabia.",
    },
  ];

  return (
    <section className="py-20 bg-ivory-100/70 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Spiritual Excellence & Trust</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-forest-950">
            {t("section_why_us")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            We don&apos;t just sell tickets — we steward your sacred journey with dedication, transparency, and family-like care.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 rounded-2xl border border-neutral-200/90 hover:border-gold-500/40 shadow-sm hover:shadow-premium transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-forest-900/5 group-hover:bg-forest-900 text-emerald-800 group-hover:text-gold-400 flex items-center justify-center transition-colors mb-5 border border-emerald-900/10">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-forest-950 group-hover:text-emerald-900 transition-colors mb-2.5">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

