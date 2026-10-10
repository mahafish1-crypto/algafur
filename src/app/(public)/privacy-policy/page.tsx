import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, ChevronRight, Phone, Mail, MapPin } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata = {
  title: "Privacy Policy | Al-Gafur International Tours And Travels",
  description:
    "How Al-Gafur International Tours And Travels collects, protects, and processes pilgrim personal and passport information.",
};

const PRIVACY_VERSION = "v1.0";
const PRIVACY_EFFECTIVE_DATE = "October 10, 2026";

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const companyName = settings.company_name || "Al-Gafur International Tours And Travels";
  const address =
    settings.company_address ||
    "183, M.G. Road, 15 August Chowk, Khadda Market, Near Camp, Pune - 411001, Maharashtra, India.";
  const phone = settings.company_phone_1 || "+91 8793939393";
  const email = settings.company_email || "contact@algafurtours.com";

  return (
    <div className="bg-ivory-100/50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Link href="/" className="hover:text-forest-950">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-forest-950 font-semibold">Privacy Policy</span>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-neutral-200 shadow-sm space-y-8">
          <div className="border-b border-neutral-200 pb-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-gold-600" />
              <span>Version {PRIVACY_VERSION} • Effective {PRIVACY_EFFECTIVE_DATE}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-forest-950">
              Privacy Policy &amp; Data Protection
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              <strong>{companyName}</strong> respects the privacy and sanctity of every pilgrim&apos;s
              personal and travel documentation. This policy explains what data we collect, how we use it,
              and how we safeguard it.
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                1. Information We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Inquiry &amp; Contact Information:</strong> Full name, mobile number, WhatsApp
                  number, email address, city, travel preferences, and family group size.
                </li>
                <li>
                  <strong>Pilgrim Identity &amp; Visa Documents:</strong> Passport scans, passport numbers,
                  dates of birth, gender, white-background photographs, Aadhaar/PAN copies, and vaccination
                  certificates required for KSA visa endorsement and airline ticketing.
                </li>
                <li>
                  <strong>Booking &amp; Financial Records:</strong> Selected packages, room sharing
                  preferences, payment receipts, bank transfer/UPI reference numbers, and invoices.
                </li>
                <li>
                  <strong>Anonymous Website Analytics:</strong> Non-intrusive package view counts, language
                  preference, and funnel interaction events used strictly to improve our pilgrimage offerings.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                2. How We Use Your Information
              </h2>
              <p>We use your information exclusively for legitimate pilgrimage operations:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Responding to your package inquiries via Call, WhatsApp, or Email.</li>
                <li>Processing official Umrah / Hajj visa applications with the KSA Ministry of Hajj &amp; Umrah.</li>
                <li>Issuing airline tickets, group PNRs, hotel rooming lists, and transport manifests.</li>
                <li>Generating official payment receipts, GST/travel invoices, and customer portal updates.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                3. Data Sharing &amp; Third-Party Disclosure
              </h2>
              <p>
                We <strong>never sell or rent</strong> your personal data or phone number to third-party
                marketers. Your travel data is shared strictly on a need-to-know basis with authorized
                entities required to fulfill your journey: airlines, Saudi Muassasah / visa authorities,
                contracted hotels in Makkah and Madinah, and travel insurance providers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                4. Data Security &amp; Access Control
              </h2>
              <p>
                Customer records, uploaded documents, and booking histories are stored in encrypted databases
                with role-based access control (RBAC) restricted to authorized Al-Gafur staff and the
                authenticated customer. Passwords are encrypted using industry-standard cryptographic hashing.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                5. Your Rights &amp; Contact Information
              </h2>
              <p>
                You may request access to, correction of, or deletion of your inquiry data at any time
                (subject to statutory accounting and travel record retention requirements) by contacting our
                data desk:
              </p>
            </section>
          </div>

          <div className="bg-ivory-100/80 p-6 rounded-2xl border border-gold-500/30 space-y-2 text-xs">
            <h3 className="text-sm font-serif font-bold text-forest-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Data Protection &amp; Support Desk
            </h3>
            <p className="flex items-start gap-2 text-neutral-700">
              <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
              <span>{address}</span>
            </p>
            <p className="flex items-center gap-2 text-neutral-700">
              <Phone className="w-4 h-4 text-gold-600 flex-shrink-0" />
              <span>{phone}</span>
            </p>
            <p className="flex items-center gap-2 text-neutral-700">
              <Mail className="w-4 h-4 text-gold-600 flex-shrink-0" />
              <span>{email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

