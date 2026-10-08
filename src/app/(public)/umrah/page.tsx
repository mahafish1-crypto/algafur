import React from "react";
import prisma from "@/lib/db";
import PackageCard, { PackageCardData } from "@/components/packages/PackageCard";
import LeadEnquiryForm from "@/components/home/LeadEnquiryForm";
import PosterSpotlight from "@/components/home/PosterSpotlight";

export const metadata = {
  title: "Umrah Packages 2026 / 1448 Hijri | Al-Gafur International Tours And Travels",
  description: "Explore 15, 20 and 22-day Umrah packages departing from Maharashtra.",
};

export default async function UmrahPage() {
  const packages = await prisma.package.findMany({
    where: { type: "UMRAH", status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  const featured = packages.find((p) => p.slug === "umrah-platinum-package-2026") || packages[0];

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Umrah Pilgrimage 1448 / 2026
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            Guaranteed Departures with Scholarly Guidance
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Featuring 5 guided Umrahs, walking distance stays at Diyafa Jamal &amp; Ilaf Kuba, and authentic 3-times Indian food.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg as PackageCardData} />
          ))}
        </div>
      </div>

      <PosterSpotlight packageData={featured} />

      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <LeadEnquiryForm defaultPackage="Umrah Platinum Package (20 Days)" />
      </div>
    </div>
  );
}

