import React from "react";
import PackageCard, { PackageCardData } from "@/components/packages/PackageCard";
import LeadEnquiryForm from "@/components/home/LeadEnquiryForm";
import { Compass, ShieldCheck, Sparkles } from "lucide-react";
import { getPublishedPackagesCatalog } from "@/lib/packages-data";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata = {
  title: "Hajj 1448 / 2027 Registration | Al-Gafur International Tours And Travels",
  description: "Official registration and guidance for Hajj pilgrimage with Al-Gafur Tours.",
};

export default async function HajjPage() {
  const [allPackages, settings] = await Promise.all([
    getPublishedPackagesCatalog().catch(() => []),
    getSiteSettings(),
  ]);
  const hajjPackages = allPackages.filter((p) => p.type === "HAJJ");

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Hajj 1448 Hijri (2027)
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            The Crown of Devotion: Sacred Hajj Pilgrimage
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Complete Shifting &amp; Non-Shifting packages with dedicated Azizia apartments, Mina European upgraded tents, and senior scholar guidance.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <ShieldCheck className="w-8 h-8 text-gold-600" />
            <h3 className="text-base font-serif font-bold text-forest-950">Official Quota &amp; Approvals</h3>
            <p className="text-xs text-neutral-600">
              Authorized processing with Haj Committee of India and KSA Ministry of Hajj &amp; Umrah.
            </p>
          </div>
          <div className="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <Compass className="w-8 h-8 text-emerald-700" />
            <h3 className="text-base font-serif font-bold text-forest-950">Intensive Pre-Hajj Seminars</h3>
            <p className="text-xs text-neutral-600">
              Practical workshops in Pune &amp; Mumbai covering the 5 days of Hajj rites, health, and logistics.
            </p>
          </div>
          <div className="bg-white p-7 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <Sparkles className="w-8 h-8 text-gold-600" />
            <h3 className="text-base font-serif font-bold text-forest-950">Upgraded Camp Services</h3>
            <p className="text-xs text-neutral-600">
              Air-conditioned gypsum partition tents in Mina, buffet meals in Arafat, and private transit coach.
            </p>
          </div>
        </div>

        {/* Package Grid */}
        <div>
          <h2 className="text-xl font-serif font-bold text-forest-950 mb-6">
            Hajj Packages &amp; Advance Seat Booking
          </h2>
          {hajjPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {hajjPackages.map((p) => (
                <PackageCard key={p.id} pkg={p as PackageCardData} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-neutral-200 text-center space-y-3">
              <h3 className="text-base font-serif font-bold text-forest-950">
                Hajj 1448 Registration Open for Quota Allocation
              </h3>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">
                Official package slots are currently undergoing seat confirmation. Submit your passport details below to be prioritized on our advance waiting list.
              </p>
            </div>
          )}
        </div>

        {/* Lead Form */}
        <LeadEnquiryForm
          defaultPackage={hajjPackages[0]?.name || "Executive Hajj 2027"}
          defaultPackageId={hajjPackages[0]?.id}
          packages={allPackages.map((p) => ({ id: p.id, name: p.name, slug: p.slug, type: p.type }))}
          settings={settings}
          sourcePage="/hajj"
        />
      </div>
    </div>
  );
}

