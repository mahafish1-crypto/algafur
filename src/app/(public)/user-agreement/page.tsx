import React from "react";
import Link from "next/link";
import { ShieldCheck, FileText, ChevronRight, Phone, Mail, MapPin } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata = {
  title: "User Agreement & Terms of Service | Al-Gafur International Tours And Travels",
  description:
    "Official User Agreement, Pilgrim Responsibilities, and Terms of Service for Hajj & Umrah travel bookings with Al-Gafur International Tours And Travels.",
};

const AGREEMENT_VERSION = "v1.0";
const AGREEMENT_EFFECTIVE_DATE = "October 10, 2026";

export default async function UserAgreementPage() {
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
          <span className="text-forest-950 font-semibold">User Agreement &amp; Terms of Service</span>
        </div>

        {/* Document Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-neutral-200 shadow-sm space-y-8">
          <div className="border-b border-neutral-200 pb-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold">
              <FileText className="w-3.5 h-3.5 text-gold-600" />
              <span>Version {AGREEMENT_VERSION} • Effective {AGREEMENT_EFFECTIVE_DATE}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-forest-950">
              User Agreement &amp; Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Please read this User Agreement carefully before submitting an inquiry, creating a customer
              account, or reserving a Hajj or Umrah package with <strong>{companyName}</strong>.
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                1. Scope of Services
              </h2>
              <p>
                <strong>{companyName}</strong> (&ldquo;Al-Gafur&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) acts as a specialized
                pilgrimage travel organizer facilitating Hajj, Umrah, Ramadan Umrah, Ziyarat tours, visa
                processing coordination, airline ticketing, hotel accommodations in Makkah Al-Mukarramah and
                Madinah Al-Munawwarah, catering, and local ground transport in the Kingdom of Saudi Arabia.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                2. Package Pricing &amp; Seat Availability Disclaimer
              </h2>
              <p>
                Published package rates are calculated based on prevailing airline fares, Saudi hotel
                contracts, Ministry of Hajj &amp; Umrah portal fees, and foreign exchange rates (INR/SAR).
                Seats in each departure group are strictly limited and allocated on a first-come,
                first-served basis upon receipt of the required booking token advance and valid passport
                documents. Any extraordinary regulatory levy imposed by Indian or Saudi authorities prior to
                departure will be communicated transparently.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                3. Visa, Airline &amp; Hotel Third-Party Conditions
              </h2>
              <p>
                Issuance of Umrah and Hajj visas is at the sole sovereign discretion of the Ministry of Hajj
                &amp; Umrah and the Royal Embassy/Consulate of Saudi Arabia. Flight schedules, baggage
                allowances, and routing are governed by the respective airlines (e.g., Saudia, Air India,
                IndiGo). Hotel check-in and check-out times, room allocation, and walking distance estimates
                are subject to hotel management and Haram courtyard security regulations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                4. Pilgrim Responsibility for Document Accuracy
              </h2>
              <p>
                Pilgrims and family coordinators are responsible for ensuring that all submitted details
                match official travel documents:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Machine-readable Indian Passport with at least 6 months validity from the date of travel.</li>
                <li>Accurate full name spelling, date of birth, passport number, and expiry date.</li>
                <li>Required photographs, Aadhaar/PAN copies, and mandatory vaccination certificates.</li>
                <li>Fitness to travel and disclosure of any senior citizen or wheelchair assistance needs at booking time.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                5. Payment &amp; Advance Token Terms
              </h2>
              <p>
                A minimum advance booking token (typically ₹25,000 per pilgrim unless specified otherwise in
                the package) is required to lock group seats and initiate PNR/visa processing. Full balance
                settlement must be completed at least 21 days prior to departure (or immediately for late
                bookings) via official bank transfer (NEFT/RTGS), UPI, or authorized office receipt.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                6. Cancellation &amp; Refund Policy Reference
              </h2>
              <p>
                All cancellations, date changes, and refund requests are governed by our{" "}
                <Link href="/cancellation-policy" className="text-emerald-800 font-semibold underline">
                  Cancellation &amp; Refund Policy
                </Link>
                , which details non-refundable visa fees, airline PNR penalties, and hotel commitment charges.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                7. Privacy, Data Usage &amp; Communication Consent
              </h2>
              <p>
                By submitting an inquiry, creating an account, or booking a package, you consent to the
                collection and processing of your personal and passport data in accordance with our{" "}
                <Link href="/privacy-policy" className="text-emerald-800 font-semibold underline">
                  Privacy Policy
                </Link>
                . You also authorize {companyName} to contact you via Phone Call, WhatsApp, SMS, and Email
                regarding your inquiry, visa status, flight updates, payment reminders, and pre-departure
                pilgrimage guidance.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                8. Acceptable Website Use &amp; Account Security
              </h2>
              <p>
                Users must provide truthful contact information and must not submit automated spam,
                unauthorized scripts, or fraudulent payment references. Customers who register on the portal
                are responsible for maintaining the confidentiality of their login password.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                9. Governing Law &amp; Dispute Jurisdiction
              </h2>
              <p>
                This Agreement is governed by the laws of the Republic of India. Any dispute arising out of
                bookings or services rendered by {companyName} shall be subject to the exclusive jurisdiction
                of the competent courts in <strong>Pune, Maharashtra, India</strong>.
                {" "}<span className="text-neutral-500 text-[11px]">[Owner Review Required: Statutory GSTIN / Registration Number if applicable]</span>
              </p>
            </section>
          </div>

          {/* Contact Box */}
          <div className="bg-ivory-100/80 p-6 rounded-2xl border border-gold-500/30 space-y-2 text-xs">
            <h3 className="text-sm font-serif font-bold text-forest-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Official Contact &amp; Grievance Desk
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

