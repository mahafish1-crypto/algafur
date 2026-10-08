import React from "react";
import FaqSection from "@/components/home/FaqSection";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions | Al-Gafur International Tours And Travels",
  description: "Answers to common questions regarding Umrah visas, flight bookings, Indian meals, and hotel proximity.",
};

export default function FaqPage() {
  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-12">
        <FaqSection />

        <div className="bg-white p-8 rounded-3xl border border-gold-500/30 text-center space-y-3">
          <h3 className="text-xl font-serif font-bold text-forest-950">
            Have a question not listed here?
          </h3>
          <p className="text-xs text-neutral-600 max-w-md mx-auto">
            Our Umrah consultants are available on phone and WhatsApp to guide you through any custom itinerary or special health accommodations.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <a
              href="https://wa.me/919890708013?text=Assalamualaikum,%20I%20have%20a%20question%20about%20Umrah"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
            <a
              href="tel:+918793939393"
              className="inline-flex items-center gap-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-semibold py-2.5 px-5 rounded-xl text-xs"
            >
              <Phone className="w-4 h-4" />
              Call +91 8793939393
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

