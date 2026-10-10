import React from "react";
import Link from "next/link";
import { ShieldCheck, AlertCircle, ChevronRight, Phone, Mail } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata = {
  title: "Cancellation & Refund Policy | Al-Gafur International Tours And Travels",
  description:
    "Transparent cancellation, rescheduling, and refund terms for Hajj and Umrah packages with Al-Gafur International Tours And Travels.",
};

export default async function CancellationPolicyPage() {
  const settings = await getSiteSettings();
  const companyName = settings.company_name || "Al-Gafur International Tours And Travels";
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
          <span className="text-forest-950 font-semibold">Cancellation &amp; Refund Policy</span>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-neutral-200 shadow-sm space-y-8">
          <div className="border-b border-neutral-200 pb-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-gold-600" />
              <span>Version v1.0 • Effective October 10, 2026</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-forest-950">
              Cancellation &amp; Refund Policy
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Because Hajj and Umrah group departures involve advance airline group block commitments, Saudi
              Ministry visa portal fees, and pre-contracted hotel inventory in Makkah and Madinah, the
              following cancellation and refund terms apply to all bookings with <strong>{companyName}</strong>.
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                1. Standard Cancellation Schedule
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>30+ Days Before Departure:</strong> Administrative charge of ₹5,000 per pilgrim plus
                  any actual non-refundable visa endorsement or airline seat block charges already incurred.
                </li>
                <li>
                  <strong>15 to 29 Days Before Departure:</strong> 50% of the total package cost is
                  non-refundable due to confirmed hotel rooming commitments and group flight ticketing.
                </li>
                <li>
                  <strong>Less than 15 Days Before Departure / No-Show:</strong> 100% of the package cost is
                  non-refundable once visas, flights, and Saudi ground vouchers are issued.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                2. Non-Refundable Components
              </h2>
              <p>
                Once an Umrah or Hajj visa is stamped/endorsed on the Saudi portal or a group airline ticket
                is issued under the pilgrim&apos;s name, the corresponding visa fee, insurance fee, and
                airline ticket fare are strictly non-refundable and non-transferable as per airline and
                Ministry regulations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                3. Date Change &amp; Batch Transfer Requests
              </h2>
              <p>
                If a pilgrim requests to shift to a later departure group at least 25 days before departure
                (and prior to visa/ticket issuance), we will make every effort to transfer the booking token
                subject to seat availability and any applicable airline date-change difference.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif font-bold text-forest-950">
                4. Refund Processing Timeline
              </h2>
              <p>
                Approved refunds are processed within <strong>10 to 14 working days</strong> via bank transfer
                (NEFT/RTGS) to the primary customer&apos;s bank account after deducting applicable cancellation
                charges.
              </p>
            </section>
          </div>

          <div className="bg-ivory-100/80 p-6 rounded-2xl border border-gold-500/30 space-y-2 text-xs">
            <h3 className="text-sm font-serif font-bold text-forest-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Need Assistance With a Booking Modification?
            </h3>
            <p className="text-neutral-600">
              Please reach out to our booking desk with your Booking Reference (<code>ALG-2026-XXXXX</code>):
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-neutral-800 font-semibold">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gold-600" /> {phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gold-600" /> {email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

