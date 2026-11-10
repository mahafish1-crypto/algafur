import React from "react";
import Link from "next/link";
import {
  MapPin,
  Compass,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Holy Ziyarat in Makkah & Madinah | AL GAFUR INTERNATIONAL",
  description:
    "Explore the sacred landmarks of Makkah Mukarramah and Madinah Munawwarah personally guided by Islamic scholars with AL GAFUR INTERNATIONAL TOURS AND TRAVELS.",
};

export default async function ZiyaratPage() {
  const settings = await getSiteSettings();
  const whatsappRaw = (settings.whatsapp_number || "919890708013").replace(/[^0-9]/g, "");

  const makkahMain = [
    {
      title: "Jabal-e-Noor & Ghar-e-Hira (Cave of Hira)",
      category: "First Revelation",
      desc: "The blessed mountain cave where the Holy Prophet Muhammad (ﷺ) received the first divine revelation of Surah Al-Alaq through Angel Jibreel (AS).",
    },
    {
      title: "Ghar-e-Thawr (Cave of Thawr)",
      category: "Hijrah Sanctuary",
      desc: "The monumental cave on Mount Thawr where the Prophet (ﷺ) and his loyal companion Hazrat Abu Bakr Siddiq (RA) took refuge for 3 nights during the Hijrah to Madinah.",
    },
    {
      title: "Plains of Arafat & Jabal Al-Rahmah",
      category: "Pillar of Hajj",
      desc: "The sacred plain where the Prophet (ﷺ) delivered his Farewell Sermon (Khutbatul Wada). Standing at Arafat is the defining rite of Hajj.",
    },
    {
      title: "Muzdalifah (Mash'ar Al-Haram)",
      category: "Hajj Landmark",
      desc: "The open plain beneath the stars between Mina and Arafat where pilgrims gather pebbles and spend the night in profound supplication.",
    },
    {
      title: "Mina (City of Tents)",
      category: "Sacrifice & Jamarat",
      desc: "The historical valley where Prophet Ibrahim (AS) obeyed Allah's command, featuring the 3 Jamarat stones and historic Masjid Al-Khayf.",
    },
    {
      title: "Jannat-ul-Mualla",
      category: "Historic Cemetery",
      desc: "The ancient cemetery in Makkah containing the blessed resting place of Sayyidatina Khadijatul Kubra (RA), the Prophet's grandfather Abdul Muttalib, and uncle Abu Talib.",
    },
    {
      title: "Masjid-e-Jinn",
      category: "Prophetic Miracle",
      desc: "The sacred mosque where a company of Jinn listened to the Prophet (ﷺ) recite the Holy Quran, accepted Islam, and pledged allegiance.",
    },
  ];

  const makkahSpecial = [
    {
      title: "Taif Mountain City Tour",
      category: "Scholarly Excursion",
      desc: "Full-day scenic excursion including Masjid Abdullah Ibn Abbas (RA), the fragrant Rose Water distilleries, the historic Addas grape garden, and Meeqat Qarn Al-Manazil.",
    },
    {
      title: "Sulah Hudaibiya & Bay'at al-Ridwan",
      category: "Historical Treaty",
      desc: "The monumental plain where the Treaty of Hudaibiya was signed and 1,400 companions gave allegiance under the tree. Official guided Umrah point.",
    },
    {
      title: "Masjid Ji'ranah (Jorana)",
      category: "Guided Umrah Point",
      desc: "Historic Meeqat where Prophet Muhammad (ﷺ) donned Ihram after the triumph of Hunayn. 2nd guided group Umrah point for our pilgrims.",
    },
    {
      title: "Masjid Ayesha (Tan'eem)",
      category: "Nearest Meeqat",
      desc: "The famous Meeqat outside the Haram boundary where Umm al-Mu'mineen Hazrat Ayesha (RA) entered Ihram. 3rd guided Umrah point.",
    },
    {
      title: "Camel Ride & Bedouin Desert Camp",
      category: "Traditional Culture",
      desc: "Authentic Arabian desert experience with guided camel rides, fresh date refreshments, and Bedouin hospitality.",
    },
    {
      title: "Kiswa Factory & Two Holy Mosques Museum",
      category: "Architecture Heritage",
      desc: "Exhibition displaying historical Kaaba doors, wooden pillars, ancient Quranic manuscripts, and artisanal embroidery of the Kiswa gold weave.",
    },
    {
      title: "Valley of Banu Saad",
      category: "Prophetic Childhood",
      desc: "The fertile valley where Prophet Muhammad (ﷺ) spent his tender infancy under the caring stewardship of Hazrat Halima Saadia (RA).",
    },
    {
      title: "Hazrat Abu Bakr (RA) Residence & Masjid Al-Ejaba",
      category: "Early Islam Landmarks",
      desc: "Sanctified landmarks steeped in early Islamic trials, perseverance, steadfast prayer, and unshakable brotherhood.",
    },
  ];

  const madinahMain = [
    {
      title: "Masjid Quba",
      category: "First Mosque of Islam",
      desc: "The foundational mosque built by Prophet Muhammad (ﷺ). Performing two Rakat in it carries the spiritual reward of a complete Umrah according to Sahih Hadith.",
    },
    {
      title: "Mount Uhud & Shuhada-e-Uhud",
      category: "Sacred Mountain",
      desc: "The beloved mountain praised by the Prophet (ﷺ), housing the resting places of Hazrat Hamza (RA) — Leader of the Martyrs — and 70 noble companions.",
    },
    {
      title: "Masjid Al-Qiblatain",
      category: "Two Qiblas",
      desc: "The historic mosque where revelation descended during prayer commanding the shift of the prayer direction from Bait Al-Maqdis (Jerusalem) to the Kaaba in Makkah.",
    },
    {
      title: "Saba Masajid (Seven Mosques) & Khandaq",
      category: "Battle of the Trench",
      desc: "The strategic defensive frontline where Salman Al-Farsi (RA) advised digging the trench, defeating the confederate army with divine assistance.",
    },
    {
      title: "Jannat-ul-Baqi",
      category: "Blessed Cemetery",
      desc: "The sacred resting place adjacent to the Prophet's Mosque containing over 10,000 Sahaba, wives of the Prophet (ﷺ), and noble Ahl-al-Bayt.",
    },
    {
      title: "Masjid-e-Juma",
      category: "First Friday Prayer",
      desc: "The sacred mosque marking the exact location where Prophet Muhammad (ﷺ) led the very first Friday congregational prayer upon arriving in Madinah.",
    },
  ];

  const madinahSpecial = [
    {
      title: "Battleground of Badr",
      category: "First Islamic Triumph",
      desc: "The historic desert plain 130 km from Madinah where 313 ill-equipped believers triumphed over 1,000 warriors through angels and unwavering faith.",
    },
    {
      title: "Bir-e-Ghars (Prophetic Well)",
      category: "Prophetic Wells",
      desc: "The blessed sweet water well from which Prophet Muhammad (ﷺ) drank and requested that his final bath be performed from its waters.",
    },
    {
      title: "Bir-e-Usman (Well of Rumah)",
      category: "Enduring Sadaqah",
      desc: "The well purchased by Hazrat Usman Ghani (RA) and dedicated as an eternal Waqf for all Muslims, flowing with fresh water to this very day.",
    },
    {
      title: "Garden of Hazrat Salman Al-Farsi (RA)",
      category: "Historic Date Grove",
      desc: "The historic date palm orchard planted by the blessed hands of the Prophet (ﷺ) to secure the emancipation of Hazrat Salman Al-Farsi (RA).",
    },
    {
      title: "Old Hejaz Railway Station",
      category: "Ottoman Heritage",
      desc: "The magnificent terminus built by Sultan Abdul Hamid II to transport pilgrims from Damascus and Istanbul directly into the sanctuary of Madinah.",
    },
    {
      title: "Wadi-e-Aqiq (The Blessed Valley)",
      category: "Sacred Valley",
      desc: "The lush valley running west of Madinah that was termed 'The Blessed Valley' by Prophet Muhammad (ﷺ) after a visitation from Angel Jibreel (AS).",
    },
  ];

  return (
    <div className="bg-ivory-100/40 min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 text-white py-16 px-4 sm:px-8 border-b border-gold-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 text-gold-300 text-xs font-bold border border-gold-500/30">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Sacred Landmarks Guided by Islamic Scholars</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Holy Ziyarat in Makkah &amp; Madinah
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Walk in the footsteps of the Beloved Prophet Muhammad (ﷺ) and the
            noble Sahaba. Every landmark is visited with luxury air-conditioned
            transportation and scholarly historical commentary.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-400 hover:bg-gold-300 text-forest-950 shadow-gold transition-all"
            >
              <span>Explore Packages with Guided Ziyarat</span>
              <ArrowRight className="w-3.5 h-3.5 text-forest-950" />
            </Link>
            <a
              href={`https://wa.me/${whatsappRaw}?text=Assalamualaikum,%20I%20would%20like%20information%20about%20Ziyarat%20tours`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-forest-900/90 hover:bg-forest-800 text-gold-300 border border-gold-500/30 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>Ask About Private Family Ziyarat</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16 mt-12">
        {/* Section 1: Makkah Main Ziyarat */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-neutral-200/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-700 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Makkah Al-Mukarramah</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
                Primary Historical Ziyarat
              </h2>
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              {makkahMain.length} Sacred Sites Included in All Packages
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {makkahMain.map((site, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs hover:border-gold-500/50 hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 inline-block">
                    {site.category}
                  </span>
                  <h3 className="text-base font-serif font-bold text-forest-950">
                    {site.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {site.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                  <span>Site #{idx + 1}</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Guided Tour
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Makkah Special Excursions */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-neutral-200/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-700 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Makkah Al-Mukarramah</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
                Special Excursions &amp; Guided Umrahs
              </h2>
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              Taif Mountain Tour, 4 Guided Umrah Points &amp; Desert Experiences
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {makkahSpecial.map((site, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs hover:border-gold-500/50 hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-800 bg-gold-50 px-2 py-0.5 rounded border border-gold-200/60 inline-block">
                    {site.category}
                  </span>
                  <h3 className="text-sm font-serif font-bold text-forest-950">
                    {site.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {site.desc}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Special #{idx + 1}</span>
                  <span className="text-gold-700 font-bold">Featured</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Madinah Main Ziyarat */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-neutral-200/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Madinah Al-Munawwarah</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
                Primary Prophetic Landmarks
              </h2>
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              {madinahMain.length} Sacred Sites Included in All Packages
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {madinahMain.map((site, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs hover:border-emerald-600/50 hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 inline-block">
                    {site.category}
                  </span>
                  <h3 className="text-base font-serif font-bold text-forest-950">
                    {site.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {site.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                  <span>Site #{idx + 1}</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Guided Tour
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Madinah Special Ziyarat */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-neutral-200/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Madinah Al-Munawwarah</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
                Special Prophetic Heritage &amp; Badr Tour
              </h2>
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              Battleground of Badr, Prophetic Wells &amp; Date Groves
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {madinahSpecial.map((site, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs hover:border-emerald-600/50 hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300/50 inline-block">
                    {site.category}
                  </span>
                  <h3 className="text-base font-serif font-bold text-forest-950">
                    {site.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {site.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                  <span>Special #{idx + 1}</span>
                  <span className="text-gold-700 font-bold">Featured Tour</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white rounded-3xl p-8 sm:p-12 text-center border border-gold-500/30 space-y-4 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gold-300">
            Every Package Includes Complete Scholarly Ziyarat
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            Our experienced Islamic scholars travel with each group to explain
            the profound Quranic and Hadith context of every site.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/packages"
              className="px-6 py-3 rounded-xl bg-gold-400 hover:bg-gold-300 text-forest-950 font-bold text-xs sm:text-sm shadow-gold transition-all"
            >
              Browse Packages &amp; Departures
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm border border-gold-500/30 transition-all"
            >
              Contact Travel Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
