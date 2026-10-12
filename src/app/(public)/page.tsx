import Hero from "@/components/home/Hero";
import SmartPackageFinder from "@/components/home/SmartPackageFinder";
import PackageCard, { PackageCardData } from "@/components/packages/PackageCard";
import PosterSpotlight from "@/components/home/PosterSpotlight";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HotelsPreview from "@/components/home/HotelsPreview";
import TimelinePreview from "@/components/home/TimelinePreview";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FaqSection from "@/components/home/FaqSection";
import LeadEnquiryForm from "@/components/home/LeadEnquiryForm";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  getPublishedPackagesCatalog,
  getPublishedHotels,
  getPublishedTestimonials,
  getPublishedFaqs,
} from "@/lib/packages-data";
import { getSiteSettings } from "@/lib/settings";
import { getSpiritualGuidesForPackage } from "@/lib/team-data";

export const revalidate = 60;

export default async function HomePage() {
  const [allPackages, hotels, testimonials, faqs, settings] = await Promise.all([
    getPublishedPackagesCatalog().catch((err) => {
      console.error("Failed to query packages in HomePage:", err);
      return [];
    }),
    getPublishedHotels().catch(() => []),
    getPublishedTestimonials().catch(() => []),
    getPublishedFaqs().catch(() => []),
    getSiteSettings(),
  ]);

  const packages = allPackages.slice(0, 6);
  const preferredSlug = settings.hero_featured_package_slug || "umrah-platinum-package-2026";
  const featuredPlatinum =
    allPackages.find((p) => p.slug === preferredSlug) ||
    allPackages.find((p) => p.slug === "umrah-platinum-package-2026") ||
    packages[0] ||
    null;

  const spiritualGuides = await getSpiritualGuidesForPackage(featuredPlatinum?.id).catch(
    () => []
  );

  const showPackagesGrid = settings.home_show_packages_grid !== "false";
  const showPosterSpotlight = settings.home_show_poster_spotlight !== "false";
  const showWhyChoose = settings.home_show_why_choose !== "false";
  const showHotelsPreview = settings.home_show_hotels_preview !== "false";
  const showTimeline = settings.home_show_journey_timeline !== "false";
  const showTestimonials = settings.home_show_testimonials !== "false";
  const showFaq = settings.home_show_faq !== "false";
  const showLeadForm = settings.home_show_lead_form !== "false";

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <Hero
        featuredPackage={featuredPlatinum}
        settings={settings}
        spiritualGuides={spiritualGuides}
      />

      {/* 2. Smart Package Finder */}
      <SmartPackageFinder />

      {/* 3. Featured Packages Grid */}
      {showPackagesGrid && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>Available Departures</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-forest-950">
                Featured Hajj &amp; Umrah Packages
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
                Authentic pricing, direct flights, and guaranteed reservations backed by official agreements.
              </p>
            </div>

            <Link
              href="/packages"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              <span>View All Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg as PackageCardData} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Signature Poster Spotlight */}
      {showPosterSpotlight && (
        <PosterSpotlight packageData={featuredPlatinum} settings={settings} />
      )}

      {/* 5. Trust Pillars: Why Pilgrims Choose Al-Gafur */}
      {showWhyChoose && <WhyChooseUs />}

      {/* 6. Hotels Proximity Showcase */}
      {showHotelsPreview && <HotelsPreview hotels={hotels} />}

      {/* 7. Interactive Itinerary Timeline */}
      {showTimeline && <TimelinePreview />}

      {/* 8. Pilgrim Testimonials */}
      {showTestimonials && <TestimonialsSection testimonials={testimonials} />}

      {/* 9. Categorized FAQ */}
      {showFaq && <FaqSection faqs={faqs} />}

      {/* 10. Lead Enquiry Form */}
      {showLeadForm && (
        <LeadEnquiryForm
          defaultPackage={featuredPlatinum?.name}
          defaultPackageId={featuredPlatinum?.id}
          packages={allPackages.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            type: p.type,
          }))}
          settings={settings}
          sourcePage="/"
        />
      )}
    </div>
  );
}
