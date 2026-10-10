"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}

interface FaqSectionProps {
  faqs?: FaqItem[];
}

export default function FaqSection({ faqs: dbFaqs }: FaqSectionProps) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs = [
    {
      q: "What is included in the Al-Gafur Umrah Platinum Package?",
      a: "Our Platinum Package covers direct return flights from Mumbai, official Umrah visa with medical insurance, 12 nights in Makkah Mukarrama (Diyafa Jamal or similar), 7 nights in Madinah Munawwara (Ilaf Kuba or similar), 3 times Indian buffet meals, 5 guided Umrahs, comprehensive Ziyarat in Makkah & Madinah, free 5L Zamzam, and a complete luggage & Ihram travel kit.",
    },
    {
      q: "How many Umrahs are conducted during the 20-day tour?",
      a: "We conduct 5 blessed Umrahs with full scholar guidance: 1. Initial Umrah upon arrival, 2. From Masjid Jorana, 3. From Masjid Ayesha (Tan'eem), 4. From historic Sulh Hudaibiya, and 5. From Taif (Meeqat Qarn al-Manazil).",
    },
    {
      q: "What documents are required to apply for an Umrah Visa?",
      a: "Original Passport valid for at least 6 months, 2 passport size photographs with white background, and a copy of your Aadhaar card. Our visa team handles all portal submissions with the Ministry of Hajj & Umrah.",
    },
    {
      q: "How far are the hotels from Masjid Al-Haram and Masjid An-Nabawi?",
      a: "Our Makkah hotel (Diyafa Jamal) is approximately 500 meters walking distance, and our Madinah hotel (Ilaf Kuba) is approximately 400 meters walking distance from the sacred courtyards. No buses or cabs are needed to reach prayers.",
    },
    {
      q: "Can I pay the package amount in installments?",
      a: "Yes! You can reserve your seat with an advance booking token of ₹25,000 per pilgrim. The remaining amount can be paid in convenient installments prior to departure.",
    },
    {
      q: "Is there support for senior citizens and wheelchairs?",
      a: "Yes, we arrange airport wheelchairs, direct room assistance, and dedicated coordinators to assist senior citizens during Tawaf and Sa'i upon request.",
    },
  ];

  const faqs =
    dbFaqs && dbFaqs.length > 0
      ? dbFaqs.map((item) => ({
          q: item.question,
          a: item.answer,
        }))
      : defaultFaqs;

  return (
    <section className="py-20 bg-ivory-100/40 border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-gold-600" />
            <span>Clear Answers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-forest-950">
            {t("section_faqs")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Everything you need to know about preparing for your Umrah with Al-Gafur Tours.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-neutral-200/90 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif font-semibold text-sm sm:text-base text-forest-950 hover:text-emerald-900"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gold-600 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/50 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

