import React from "react";
import PackageCard, { PackageCardData } from "@/components/packages/PackageCard";
import LeadEnquiryForm from "@/components/home/LeadEnquiryForm";
import { getPublishedPackagesCatalog } from "@/lib/packages-data";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata = {
  title: "Ramadan Umrah 2027 / 1448 Hijri | Al-Gafur International Tours And Travels",
  description: "Spend Laylatul Qadr and celebrate Eid-ul-Fitr in the holy courtyards of Makkah & Madinah.",
};

export default async function RamadanUmrahPage() {
  const [allPackages, settings] = await Promise.all([
    getPublishedPackagesCatalog().catch(() => []),
    getSiteSettings(),
  ]);
  const ramadanPackages = allPackages.filter((p) => p.type === "RAMADAN_UMRAH");

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Ramadan 1448 Hijri
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            Blessed Ramadan Umrah &amp; Eid-ul-Fitr
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            The Prophet (ﷺ) said: &quot;An Umrah in Ramadan is equal to Hajj with me.&quot; Experience the supreme blessing of the last 10 nights in Makkah Mukarrama.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ramadanPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg as PackageCardData} />
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <LeadEnquiryForm
          defaultPackage={ramadanPackages[0]?.name || "Ramadan Blessed Last 15 Days"}
          defaultPackageId={ramadanPackages[0]?.id}
          packages={allPackages.map((p) => ({ id: p.id, name: p.name, slug: p.slug, type: p.type }))}
          settings={settings}
          sourcePage="/ramadan-umrah"
        />
      </div>
    </div>
  );
}

