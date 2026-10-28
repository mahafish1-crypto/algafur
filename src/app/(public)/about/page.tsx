import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Compass,
  ShieldCheck,
  HeartHandshake,
  Building,
  Phone,
  Mail,
  Award,
  Users,
  Briefcase,
  Calculator,
  Headphones,
  Sparkles,
} from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { getPublicTeamProfiles, TeamMemberProfile } from "@/lib/team-data";
import { getPublishedPackagesCatalog } from "@/lib/packages-data";
import LeadEnquiryForm from "@/components/home/LeadEnquiryForm";

export const revalidate = 60;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const companyName =
    settings.company_name || "AL GAFUR INTERNATIONAL TOURS AND TRAVELS";
  return {
    title: `About Us & Leadership | ${companyName}`,
    description:
      settings.about_subtitle ||
      "Learn about the mission, scholarly leadership, spiritual guides, and operations team of AL GAFUR INTERNATIONAL TOURS AND TRAVELS.",
  };
}

function TeamProfileCard({
  member,
  packageMap,
}: {
  member: TeamMemberProfile;
  packageMap: Map<string, { name: string; slug: string }>;
}) {
  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const linkedPkgs = (member.packageIds || [])
    .map((pid) => packageMap.get(pid))
    .filter(Boolean) as Array<{ name: string; slug: string }>;

  return (
    <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-premium transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3 text-center">
        {member.photo ? (
          <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-gold-500/40 shadow-sm bg-forest-950">
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-forest-900 text-gold-300 font-serif font-bold flex items-center justify-center mx-auto text-xl border-2 border-gold-500/30 shadow-xs">
            {initials}
          </div>
        )}

        <div>
          <h3 className="text-base font-serif font-bold text-forest-950">
            {member.name}
          </h3>
          <p className="text-xs text-gold-700 font-semibold mt-0.5">
            {member.designation}
          </p>
        </div>

        {member.bio && (
          <p className="text-xs text-neutral-600 leading-relaxed">
            {member.bio}
          </p>
        )}

        {member.languages && (
          <p className="text-[11px] text-neutral-500">
            <strong className="text-forest-950">Languages:</strong>{" "}
            {member.languages}
          </p>
        )}

        {member.services && (
          <p className="text-[11px] text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200/70">
            {member.services}
          </p>
        )}

        {linkedPkgs.length > 0 && (
          <div className="pt-2 border-t border-neutral-100 text-left space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Guided Packages:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {linkedPkgs.map((pkg, idx) => (
                <Link
                  key={idx}
                  href={`/packages/${pkg.slug}`}
                  className="text-[11px] font-semibold text-forest-950 bg-ivory-100 hover:bg-gold-100 px-2.5 py-0.5 rounded-lg border border-gold-500/30 transition-colors"
                >
                  {pkg.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {(member.phone || member.email) && (
        <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-center gap-3 text-xs">
          {member.phone && (
            <a
              href={`tel:${member.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1 font-semibold text-forest-950 hover:text-gold-700"
            >
              <Phone className="w-3.5 h-3.5 text-gold-600" />
              {member.phone}
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="inline-flex items-center gap-1 font-medium text-neutral-600 hover:text-forest-950"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              {member.email}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default async function AboutPage() {
  const [settings, activeTeam, packages] = await Promise.all([
    getSiteSettings(),
    getPublicTeamProfiles().catch(() => []),
    getPublishedPackagesCatalog().catch(() => []),
  ]);

  const packageMap = new Map<string, { name: string; slug: string }>();
  for (const p of packages) {
    packageMap.set(p.id, { name: p.name, slug: p.slug });
  }

  const companyName =
    settings.company_name || "AL GAFUR INTERNATIONAL TOURS AND TRAVELS";
  const badge = settings.about_badge || "About AL GAFUR";
  const title =
    settings.about_title || "Serving the Guests of Allah with Honor and Care";
  const subtitle =
    settings.about_subtitle ||
    "A premier international Hajj & Umrah travel organization founded on devotion, transparency, and scholarly guidance.";
  const mandateTitle =
    settings.about_mandate_title || "Company Introduction & Spiritual Mission";
  const mandateDesc1 =
    settings.about_mandate_description_1 ||
    `At ${companyName}, we believe embarking on Hajj or Umrah is not merely an itinerary — it is the milestone pilgrimage of a lifetime. Every detail, from selecting hotels with convenient access to the Haram courtyards, to preparing fresh Indian meals that nourish worshippers, is managed with intense responsibility.`;
  const mandateDesc2 =
    settings.about_mandate_description_2 ||
    'Our slogan reflects our devotion: "एक सफर जिंदगी में तब्दीली लानेवाला... इन्शाअल्लाह" — A journey destined to transform your heart and life.';
  const aboutImage = settings.about_image || "/brand/img2.jpeg";

  const feature1 =
    settings.about_feature_1 ||
    "Ministry of Hajj & Umrah Recognized Operations";
  const feature2 =
    settings.about_feature_2 ||
    "Over 1,500+ Satisfied Pilgrims Guided Across Maharashtra";
  const feature3 =
    settings.about_feature_3 || "Direct Return Group Flights & Verified Hotels";

  const address =
    settings.company_address ||
    "183, M.G. Road, 15 August Chowk, Khadda Market, Near Camp, Pune - 411001, Maharashtra, India.";
  const phone1 = settings.company_phone_1 || "+91 8793939393";

  // Categorize active team members
  const directors = activeTeam.filter((m) => m.category === "DIRECTOR");
  const spiritualGuides = activeTeam.filter(
    (m) => m.category === "SPIRITUAL_GUIDE"
  );
  const operationsTeam = activeTeam.filter((m) => m.category === "OPERATIONS");
  const salesTeam = activeTeam.filter((m) => m.category === "SALES");
  const accountsTeam = activeTeam.filter((m) => m.category === "ACCOUNTS");
  const supportAndOtherTeam = activeTeam.filter(
    (m) => m.category === "SUPPORT" || m.category === "OTHER"
  );

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            {badge}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">{subtitle}</p>
        </div>

        {/* 1. Company Introduction & Mission */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-forest-950">
              {mandateTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {mandateDesc1}
            </p>
            <p className="text-xs sm:text-sm leading-relaxed italic text-forest-950 font-medium">
              {mandateDesc2}
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs font-semibold text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feature1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feature2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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

        {/* 2. Our Approach to Hajj & Umrah Services */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Pilgrim-First Service Standards
            </span>
            <h2 className="text-2xl font-serif font-bold text-forest-950 mt-2">
              Our Approach to Hajj &amp; Umrah Services
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Every group departure is structured around spiritual authenticity,
              elder comfort, and transparent communication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-forest-950 text-gold-300 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-forest-950">
                Sunnah-Guided Manasik
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Pre-departure orientation and on-ground guidance in Makkah and
                Madinah so every pilgrim performs Umrah and Ziyarat with clarity.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-forest-950 text-gold-300 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-forest-950">
                Handpicked Sanctuary Hotels
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Verified accommodations within convenient walking access of
                Masjid Al-Haram and Masjid An-Nabawi, clearly disclosed upfront.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-forest-950 text-gold-300 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-forest-950">
                Personal Advisor Confirmation
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Submit your enquiry online and our team personally reviews room
                preferences, dates, and family requirements before confirming.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-forest-950 text-gold-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-forest-950">
                End-to-End Operations Care
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                From visa processing and airline group ticketing to Saudi coach
                transfers and Indian buffet meals, our team accompanies you.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Directors & Leadership */}
        {directors.length > 0 && (
          <section id="leadership" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold text-forest-950 flex items-center justify-center gap-2">
                <Briefcase className="w-5 h-5 text-gold-600" />
                Directors &amp; Leadership
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Institutional governance, strategic airline partnerships, and
                overall pilgrim welfare.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {directors.map((member) => (
                <TeamProfileCard
                  key={member.id}
                  member={member}
                  packageMap={packageMap}
                />
              ))}
            </div>
          </section>
        )}

        {/* 4. Spiritual Guides */}
        {spiritualGuides.length > 0 && (
          <section id="spiritual-guides" className="space-y-6 scroll-mt-24">
            <div className="text-center">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-gold-700 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-200 mb-1">
                <Sparkles className="w-3 h-3" />
                Religious Guidance
              </span>
              <h2 className="text-2xl font-serif font-bold text-forest-950 flex items-center justify-center gap-2">
                <Award className="w-5 h-5 text-gold-600" />
                Spiritual Guides &amp; Group Scholars
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Dedicated religious guides accompanying our groups for Umrah
                manasik, Ziyarat explanations, and spiritual discourses.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {spiritualGuides.map((member) => (
                <TeamProfileCard
                  key={member.id}
                  member={member}
                  packageMap={packageMap}
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. Operations & Support Team */}
        {operationsTeam.length > 0 && (
          <section id="operations-team" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold text-forest-950 flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-gold-600" />
                Operations &amp; Ground Logistics Team
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Makkah &amp; Madinah hotel contracting, airport assistance, and
                transport coordination.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {operationsTeam.map((member) => (
                <TeamProfileCard
                  key={member.id}
                  member={member}
                  packageMap={packageMap}
                />
              ))}
            </div>
          </section>
        )}

        {/* 6. Sales Team */}
        {salesTeam.length > 0 && (
          <section id="sales-team" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold text-forest-950 flex items-center justify-center gap-2">
                <Phone className="w-5 h-5 text-gold-600" />
                Sales &amp; Pilgrim Advisory Team
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Helping families choose the right package, departure schedule,
                and room sharing configuration.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {salesTeam.map((member) => (
                <TeamProfileCard
                  key={member.id}
                  member={member}
                  packageMap={packageMap}
                />
              ))}
            </div>
          </section>
        )}

        {/* 7. Accounts Team */}
        {accountsTeam.length > 0 && (
          <section id="accounts-team" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold text-forest-950 flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5 text-gold-600" />
                Accounts &amp; Billing Team
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Transparent invoicing, receipt verification, and financial
                records management.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {accountsTeam.map((member) => (
                <TeamProfileCard
                  key={member.id}
                  member={member}
                  packageMap={packageMap}
                />
              ))}
            </div>
          </section>
        )}

        {/* 8. Support & Other Staff / Custom Designations */}
        {supportAndOtherTeam.length > 0 && (
          <section id="support-team" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold text-forest-950 flex items-center justify-center gap-2">
                <Headphones className="w-5 h-5 text-gold-600" />
                Pilgrim Support &amp; Specialized Staff
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Dedicated specialists supporting documentation, visa processing,
                and pilgrim care.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportAndOtherTeam.map((member) => (
                <TeamProfileCard
                  key={member.id}
                  member={member}
                  packageMap={packageMap}
                />
              ))}
            </div>
          </section>
        )}

        {/* Office Location Banner */}
        <div className="bg-forest-950 text-white rounded-3xl p-8 sm:p-10 border border-gold-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">
              Head Office &amp; Registration Center
            </h3>
            <p className="text-xs text-emerald-200/80 max-w-md leading-relaxed">
              {address}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="bg-gold-400 hover:bg-gold-300 text-forest-950 font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-md whitespace-nowrap"
            >
              Submit Booking Enquiry
            </Link>
            <a
              href={`tel:${phone1.replace(/\s+/g, "")}`}
              className="bg-forest-900 hover:bg-forest-800 border border-gold-500/30 text-gold-300 font-bold px-6 py-3 rounded-xl text-xs transition-colors whitespace-nowrap"
            >
              Call Office: {phone1}
            </a>
          </div>
        </div>
      </div>

      {/* 9. Contact & Enquiry CTA */}
      <div className="mt-12">
        <LeadEnquiryForm
          packages={packages.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            type: p.type,
          }))}
          settings={settings}
          sourcePage="/about"
        />
      </div>
    </div>
  );
}
