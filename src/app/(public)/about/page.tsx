import React from "react";
import Image from "next/image";
import BrandLogo from "@/components/brand/BrandLogo";
import { ShieldCheck, Award, HeartHandshake, MapPin, Phone, Users, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "About Us | Al-Gafur International Tours And Travels",
  description: "Learn about the mission, scholarly leadership, and background of Al-Gafur International Tours And Travels.",
};

export default function AboutPage() {
  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            About Al-Gafur Tours
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            Serving the Guests of Allah with Honor and Care
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            A premier international Hajj &amp; Umrah travel organization founded on devotion, transparency, and scholarly guidance.
          </p>
        </div>

        {/* Company Narrative & Mission */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-forest-950">
              Our Spiritual Mandate
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              At <strong>Al-Gafur International Tours And Travels</strong>, we believe embarking on Hajj or Umrah is not merely an itinerary — it is the milestone pilgrimage of a lifetime. Every detail, from selecting hotels with level walking pathways to the Haram courtyards, to preparing fresh Indian meals that nourish tired worshippers, is managed with intense responsibility.
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Our slogan reflects our devotion: <em className="text-forest-950 font-medium">&quot;एक सफर जिंदगी में तब्दीली लानेवाला... इन्शाअल्लाह&quot;</em> — A journey destined to transform your heart and life.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs font-semibold text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ministry of Hajj & Umrah Recognized Operations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Over 1,500+ Satisfied Pilgrims Guided Across Maharashtra</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Direct Mumbai Return Flights Guaranteed</span>
              </div>
            </div>
          </div>

          <div className="relative h-80 rounded-2xl overflow-hidden shadow-md border-2 border-gold-500/20">
            <Image
              src="/brand/img2.jpeg"
              alt="Hafiz Sameer Madani and Al-Gafur Guides"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Scholarly Leadership */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-serif font-bold text-forest-950">
              Scholarly Leadership &amp; Directorship
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Direct supervision by recognized Islamic teachers and experienced logistics directors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-forest-900 text-gold-300 font-bold flex items-center justify-center mx-auto text-lg">
                DM
              </div>
              <h3 className="text-base font-serif font-bold text-forest-950">
                Dr. Mudassir Rafique Sayyad
              </h3>
              <p className="text-xs text-gold-700 font-semibold">Managing Director</p>
              <p className="text-[11px] text-neutral-500">
                Oversees institutional partnerships, airline charters, and pilgrim welfare.
              </p>
              <p className="text-xs font-semibold text-neutral-800 pt-2">+91 8793939393</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-forest-900 text-gold-300 font-bold flex items-center justify-center mx-auto text-lg">
                HA
              </div>
              <h3 className="text-base font-serif font-bold text-forest-950">
                Hafiz Asrar Sahab (S.B.)
              </h3>
              <p className="text-xs text-gold-700 font-semibold">
                Religious Director &amp; International Naat Khwa
              </p>
              <p className="text-[11px] text-neutral-500">
                Leads spiritual discourses, lectures on Umrah virtues, and Madinah salam sessions.
              </p>
              <p className="text-xs font-semibold text-neutral-800 pt-2">+91 9890708013</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-forest-900 text-gold-300 font-bold flex items-center justify-center mx-auto text-lg">
                ZA
              </div>
              <h3 className="text-base font-serif font-bold text-forest-950">
                Zahir Ali Pathan
              </h3>
              <p className="text-xs text-gold-700 font-semibold">Director of Operations</p>
              <p className="text-[11px] text-neutral-500">
                Directs hotel contracting in Makkah &amp; Madinah and airport transfer operations.
              </p>
              <p className="text-xs font-semibold text-neutral-800 pt-2">+91 9764444044</p>
            </div>
          </div>
        </div>

        {/* Office Location */}
        <div className="bg-forest-950 text-white rounded-3xl p-8 sm:p-10 border border-gold-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">
              Pune Booking &amp; Registration Center
            </h3>
            <p className="text-xs text-emerald-200/80 max-w-md leading-relaxed">
              183, M.G. Road, 15 August Chowk, Khadda Market, Camp, Pune - 411001 (Maharashtra).
              <br />
              Booking Coordinator: Haji Nizam Tamboli (9422032786 / 88888032786).
            </p>
          </div>
          <a
            href="tel:+918793939393"
            className="bg-gold-400 hover:bg-gold-300 text-forest-950 font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-md whitespace-nowrap"
          >
            Contact Management
          </a>
        </div>
      </div>
    </div>
  );
}

