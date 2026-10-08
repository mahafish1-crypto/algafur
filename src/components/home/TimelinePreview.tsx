"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, Calendar, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

export default function TimelinePreview() {
  const [activeDay, setActiveDay] = useState(0);

  const itinerarySteps = [
    {
      day: "Day 01",
      title: "Direct Flight Mumbai to Madinah",
      location: "Madinah Munawwarah",
      desc: "Board the direct flight from Mumbai Chhatrapati Shivaji Maharaj Airport. Arrive at Prince Mohammad Airport in Madinah. Group private transfer to Hotel Ilaf Kuba. Initial peace and Salaam at Masjid An-Nabawi.",
      highlight: "Direct Flight & Hotel Check-in",
    },
    {
      day: "Day 03",
      title: "Historic Madinah Ziyarat & Quba",
      location: "Madinah Holy Sites",
      desc: "Private AC luxury coach tour visiting Masjid Quba (where 2 Rakat equals reward of one Umrah), Mount Uhud & the Martyrs cemetery, Masjid Qiblatain, and the Seven Mosques (Battle of Trench).",
      highlight: "Scholar Guided Ziyarat",
    },
    {
      day: "Day 08",
      title: "Ihram at Meeqat & 1st Umrah",
      location: "Madinah to Makkah",
      desc: "Put on Ihram at hotel, proceed to Meeqat Dhul Hulayfah for Niyyah and Talbiyah. Travel by express coach / Haramain train to Makkah Mukarrama. Check in to Diyafa Jamal and perform First Umrah with guidance.",
      highlight: "First Sacred Umrah",
    },
    {
      day: "Day 11",
      title: "2nd Umrah from Masjid Jorana",
      location: "Makkah Al-Mukarramah",
      desc: "Morning excursion to historic Meeqat Al-Ji'ranah, where the Prophet (PBUH) donned Ihram after the Battle of Hunayn. Guidance for entering Ihram and performing second Umrah.",
      highlight: "Second Guided Umrah",
    },
    {
      day: "Day 13",
      title: "3rd Umrah from Masjid Ayesha",
      location: "Tan'eem, Makkah",
      desc: "Trip to Masjid Ayesha (Tan'eem). Perform Niyyah for 3rd Umrah and complete Tawaf and Sa'i alongside our scholars.",
      highlight: "Third Guided Umrah",
    },
    {
      day: "Day 15",
      title: "4th Umrah from Sulh Hudaibiya",
      location: "Hudaibiya Historic Plains",
      desc: "Visit the legendary site of the Treaty of Hudaibiya (Ridwan Pledge). Visit the local museum and camel farm, put on Ihram and complete 4th Umrah.",
      highlight: "Fourth Guided Umrah",
    },
    {
      day: "Day 16",
      title: "Taif Mountain Excursion & 5th Umrah",
      location: "Taif & Qarn al-Manazil",
      desc: "Full day scenic mountain tour of Taif. Visit Masjid Abdullah Ibn Abbas, Addas Garden, and historic rose perfumeries. Stop at Meeqat Qarn al-Manazil to don Ihram for 5th Umrah.",
      highlight: "Fifth Guided Umrah",
    },
    {
      day: "Day 20",
      title: "Tawaf-e-Wida & Return to Mumbai",
      location: "Jeddah to Mumbai",
      desc: "Complete the emotional Farewell Tawaf (Tawaf-e-Wida). Receive 5-Litre sealed blessed Zamzam cans. Transfer to Jeddah King Abdulaziz International Airport for direct return flight to Mumbai.",
      highlight: "Zamzam Distribution & Farewell",
    },
  ];

  return (
    <section className="py-20 bg-ivory-100/50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3">
            <Compass className="w-3.5 h-3.5 text-gold-600" />
            <span>Interactive Pilgrimage Journey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-forest-950">
            Day-by-Day Itinerary Preview
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Every day is thoughtfully scheduled so you can immerse yourself in devotion without logistical stress.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Day Selector Buttons on Left */}
          <div className="lg:col-span-5 space-y-2">
            {itinerarySteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between border ${
                  activeDay === idx
                    ? "bg-forest-900 text-white border-gold-500/40 shadow-md transform -translate-x-1"
                    : "bg-white text-neutral-800 border-neutral-200/80 hover:bg-emerald-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      activeDay === idx
                        ? "bg-gold-500 text-forest-950"
                        : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    {step.day}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold">{step.title}</h4>
                    <p
                      className={`text-[11px] ${
                        activeDay === idx ? "text-emerald-300" : "text-neutral-500"
                      }`}
                    >
                      {step.location}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    activeDay === idx
                      ? "bg-forest-950 text-gold-300 border border-gold-500/30"
                      : "text-neutral-400"
                  }`}
                >
                  {step.highlight}
                </span>
              </button>
            ))}
          </div>

          {/* Active Day Detail Display Card on Right */}
          <div className="lg:col-span-7 bg-white p-7 sm:p-9 rounded-3xl border border-gold-500/30 shadow-premium sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <span className="text-xs font-extrabold text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200 uppercase tracking-wider">
                {itinerarySteps[activeDay].day} Detail
              </span>
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {itinerarySteps[activeDay].location}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-forest-950 mt-4 mb-3">
              {itinerarySteps[activeDay].title}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {itinerarySteps[activeDay].desc}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-neutral-100 text-xs">
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>3 Times Indian Meals Provided</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>AC Transport / Express Transit</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Scholar Supervision</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Free Laundry Included</span>
              </div>
            </div>

            <div className="mt-8 pt-4 flex items-center justify-between">
              <Link
                href="/packages/umrah-platinum-package-2026"
                className="inline-flex items-center gap-2 text-xs font-bold text-forest-950 bg-gold-400 hover:bg-gold-300 px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <span>View Complete 20-Day Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

