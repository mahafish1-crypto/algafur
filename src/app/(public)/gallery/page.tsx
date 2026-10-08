import React from "react";
import Image from "next/image";
import { MapPin, Compass, Sparkles } from "lucide-react";

export const metadata = {
  title: "Holy Sites & Ziyarat Gallery | Al-Gafur International Tours And Travels",
  description: "Explore the historic Ziyarat sites of Makkah Mukarrama and Madinah Munawwara guided by Al-Gafur Tours.",
};

export default function GalleryPage() {
  const makkahSites = [
    { name: "Cave of Hira (Jabal Al-Noor)", desc: "The blessed mountain cave where the first revelation of the Holy Quran descended upon Prophet Muhammad (ﷺ)." },
    { name: "Cave of Thawr", desc: "The sanctuary cave where Prophet Muhammad (ﷺ) and Hazrat Abu Bakr (RA) took refuge during the Hijrah to Madinah." },
    { name: "Masjid Al-Ji'ranah (Jorana)", desc: "Historic Meeqat where the Prophet (ﷺ) entered Ihram after the triumph of Hunayn. 2nd guided Umrah point." },
    { name: "Masjid Ayesha (Tan'eem)", desc: "The nearest Meeqat outside the Haram boundary where Mother of the Believers Hazrat Ayesha (RA) made Niyyah. 3rd Umrah." },
    { name: "Sulh Hudaibiya", desc: "The monumental plain where the Treaty of Hudaibiya (Bay'at al-Ridwan) was ratified. 4th guided Umrah point." },
    { name: "Scenic City of Taif", desc: "Mountain excursion to Masjid Abdullah Ibn Abbas, rose distillation factories, Addas garden, and Meeqat Qarn al-Manazil." },
    { name: "Makkah Heritage Museum & Library", desc: "The Architecture exhibition of the Two Holy Mosques featuring historical Kaaba doors and pillars." },
    { name: "Masjid Al-Ijaba & Abu Bakr (RA) Residence", desc: "Sacred landmarks steeped in early Islamic trials, perseverance, and brotherhood." },
  ];

  const madinahSites = [
    { name: "Masjid Quba", desc: "The first mosque built in Islam. Praying two Rakat in it carries the spiritual reward of a complete Umrah according to Sahih Hadith." },
    { name: "Mount Uhud & Martyrs Cemetery", desc: "The mountain that loves the believers, resting place of Hazrat Hamza (RA) and the 70 noble martyrs of Uhud." },
    { name: "Masjid Al-Qiblatain", desc: "The Mosque of the Two Qiblas, where the divine revelation commanded the shift of prayer direction from Jerusalem to the Kaaba." },
    { name: "Battle of the Trench (Seven Mosques / Khandaq)", desc: "Historic battleground where the confederate siege was broken through divine wind and steadfast devotion." },
    { name: "Battleground of Badr", desc: "The historic plain of the first decisive victory of Islam, where 313 stood firm against adversity." },
    { name: "Bir al-Gharas & Bir-e-Usman", desc: "Blessed prophetic wells whose sweet waters were personally praised by the Messenger of Allah (ﷺ)." },
    { name: "Garden of Hazrat Salman Al-Farsi (RA)", desc: "The historic date palm grove planted by the Prophet (ﷺ) to secure the freedom of Salman Al-Farsi (RA)." },
    { name: "Old Hejaz Railway Station", desc: "The Ottoman historic terminus station of the Damascus to Madinah pilgrim train." },
  ];

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Historic Pilgrimage Heritage
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            Holy Ziyarat in Makkah &amp; Madinah
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Every site listed on our official posters is personally guided by scholars with authentic historical explanations.
          </p>
        </div>

        {/* Makkah Ziyarat */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-gold-600" />
            <h2 className="text-2xl font-serif font-bold text-forest-950">
              Makkah Al-Mukarramah Ziyarat Tour
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {makkahSites.map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Site #{idx + 1}
                </span>
                <h3 className="text-sm font-serif font-bold text-forest-950">{s.name}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Madinah Ziyarat */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h2 className="text-2xl font-serif font-bold text-forest-950">
              Madinah Al-Munawwarah Ziyarat Tour
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {madinahSites.map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Site #{idx + 1}
                </span>
                <h3 className="text-sm font-serif font-bold text-forest-950">{s.name}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

