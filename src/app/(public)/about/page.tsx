import React from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const companyName = settings.company_name || "Al-Gafur International Tours And Travels";
  return {
    title: `About Us | ${companyName}`,
    description: settings.about_subtitle || "Learn about the mission, scholarly leadership, and background of Al-Gafur International Tours And Travels.",
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const companyName = settings.company_name || "Al-Gafur International Tours And Travels";
  const badge = settings.about_badge || "About Al-Gafur Tours";
  const title = settings.about_title || "Serving the Guests of Allah with Honor and Care";
  const subtitle =
    settings.about_subtitle ||
    "A premier international Hajj & Umrah travel organization founded on devotion, transparency, and scholarly guidance.";
  const mandateTitle = settings.about_mandate_title || "Our Spiritual Mandate";
  const mandateDesc1 =
    settings.about_mandate_description_1 ||
    `At ${companyName}, we believe embarking on Hajj or Umrah is not merely an itinerary — it is the milestone pilgrimage of a lifetime. Every detail, from selecting hotels with level walking pathways to the Haram courtyards, to preparing fresh Indian meals that nourish tired worshippers, is managed with intense responsibility.`;
  const mandateDesc2 =
    settings.about_mandate_description_2 ||
    'Our slogan reflects our devotion: "एक सफर जिंदगी में तब्दीली लानेवाला... इन्शाअल्लाह" — A journey destined to transform your heart and life.';
  const aboutImage = settings.about_image || "/brand/img2.jpeg";

  const feature1 = settings.about_feature_1 || "Ministry of Hajj & Umrah Recognized Operations";
  const feature2 = settings.about_feature_2 || "Over 1,500+ Satisfied Pilgrims Guided Across Maharashtra";
  const feature3 = settings.about_feature_3 || "Direct Mumbai Return Flights Guaranteed";

  const leader1Name = settings.about_leader_1_name || "Dr. Mudassir Rafique Sayyad";
  const leader1Role = settings.about_leader_1_role || "Managing Director";
  const leader1Desc = settings.about_leader_1_desc || "Oversees institutional partnerships, airline charters, and pilgrim welfare.";
  const leader1Phone = settings.about_leader_1_phone || "+91 8793939393";

  const leader2Name = settings.about_leader_2_name || "Hafiz Asrar Sahab (S.B.)";
  const leader2Role = settings.about_leader_2_role || "Religious Director & International Naat Khwan";
  const leader2Desc = settings.about_leader_2_desc || "Leads spiritual discourses, lectures on Umrah virtues, and Madinah salam sessions.";
  const leader2Phone = settings.about_leader_2_phone || "+91 9890708013";

  const leader3Name = settings.about_leader_3_name || "Zahir Ali Pathan";
  const leader3Role = settings.about_leader_3_role || "Director of Operations";
  const leader3Desc = settings.about_leader_3_desc || "Directs hotel contracting in Makkah & Madinah and airport transfer operations.";
  const leader3Phone = settings.about_leader_3_phone || "+91 9764444044";

  const address =
    settings.company_address ||
    "183, M.G. Road, 15 August Chowk, Khadda Market, Near Camp, Pune - 411001, Maharashtra, India.";
  const phone1 = settings.company_phone_1 || "+91 8793939393";

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            {badge}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            {subtitle}
          </p>
        </div>

        {/* Company Narrative & Mission */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-forest-950">
              {mandateTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {mandateDesc1}
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed italic text-forest-950 font-medium">
              {mandateDesc2}
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs font-semibold text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{feature1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{feature2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{feature3}</span>
              </div>
            </div>
          </div>

          <div className="relative h-80 rounded-2xl overflow-hidden shadow-md border-2 border-gold-500/20 bg-forest-950">
            <Image
              src={aboutImage}
              alt={companyName}
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
                {leader1Name}
              </h3>
              <p className="text-xs text-gold-700 font-semibold">{leader1Role}</p>
              <p className="text-[11px] text-neutral-500">
                {leader1Desc}
              </p>
              <a href={`tel:${leader1Phone.replace(/\s+/g, "")}`} className="block text-xs font-semibold text-neutral-800 pt-2 hover:text-gold-700">
                {leader1Phone}
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-forest-900 text-gold-300 font-bold flex items-center justify-center mx-auto text-lg">
                HA
              </div>
              <h3 className="text-base font-serif font-bold text-forest-950">
                {leader2Name}
              </h3>
              <p className="text-xs text-gold-700 font-semibold">
                {leader2Role}
              </p>
              <p className="text-[11px] text-neutral-500">
                {leader2Desc}
              </p>
              <a href={`tel:${leader2Phone.replace(/\s+/g, "")}`} className="block text-xs font-semibold text-neutral-800 pt-2 hover:text-gold-700">
                {leader2Phone}
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-forest-900 text-gold-300 font-bold flex items-center justify-center mx-auto text-lg">
                ZA
              </div>
              <h3 className="text-base font-serif font-bold text-forest-950">
                {leader3Name}
              </h3>
              <p className="text-xs text-gold-700 font-semibold">{leader3Role}</p>
              <p className="text-[11px] text-neutral-500">
                {leader3Desc}
              </p>
              <a href={`tel:${leader3Phone.replace(/\s+/g, "")}`} className="block text-xs font-semibold text-neutral-800 pt-2 hover:text-gold-700">
                {leader3Phone}
              </a>
            </div>
          </div>
        </div>

        {/* Office Location */}
        <div className="bg-forest-950 text-white rounded-3xl p-8 sm:p-10 border border-gold-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">
              Registration &amp; Booking Centers
            </h3>
            <p className="text-xs text-emerald-200/80 max-w-md leading-relaxed">
              {address}
            </p>
          </div>
          <a
            href={`tel:${phone1.replace(/\s+/g, "")}`}
            className="bg-gold-400 hover:bg-gold-300 text-forest-950 font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-md whitespace-nowrap"
          >
            Contact Management: {phone1}
          </a>
        </div>
      </div>
    </div>
  );
}
