import React from "react";
import LeadEnquiryForm from "@/components/home/LeadEnquiryForm";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { getPublishedPackagesCatalog } from "@/lib/packages-data";

export const revalidate = 60;

export const metadata = {
  title: "Contact Us & Booking Offices | Al-Gafur International Tours And Travels",
  description: "Get in touch with Al-Gafur offices in Pune, Mumbai, Aurangabad, and Ahmednagar.",
};

export default async function ContactPage() {
  const [settings, allPackages] = await Promise.all([
    getSiteSettings(),
    getPublishedPackagesCatalog().catch(() => []),
  ]);

  const phone1 = settings.company_phone_1 || "+91 8793939393";
  const phone2 = settings.company_phone_2 || "+91 9890708013";
  const phone3 = settings.company_phone_3 || "+91 9764444044";
  const whatsapp = settings.whatsapp_number || "919890708013";
  const email = settings.company_email || "contact@algafurtours.com";
  const address =
    settings.company_address ||
    "183, M.G. Road, 15 August Chowk, Khadda Market, Near Camp, Pune - 411001, Maharashtra, India.";
  const workingHours = settings.working_hours || "10:00 AM – 8:30 PM";

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Reach Out to Us
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            Contact Al-Gafur Tours Desk
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Visit our regional booking offices or speak directly with our senior directors and scholars.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Head Office / Booking Office */}
          <div className="bg-white p-7 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-900 text-gold-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-forest-950">Head Office Address</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {address}
            </p>
            <div className="pt-2 text-xs space-y-1">
              <p className="text-neutral-500">
                <strong>Coordinator:</strong> Haji Nizam Tamboli
              </p>
              <p className="text-emerald-800 font-semibold">
                Tel: +91 9422032786 / +91 8888890830
              </p>
            </div>
          </div>

          {/* Direct Leadership Contacts */}
          <div className="bg-white p-7 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-900 text-gold-400 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-forest-950">Direct Advisor Helplines</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Reach our management and scholars directly for group inquiries and private itineraries:
            </p>
            <div className="pt-2 text-xs space-y-1.5">
              <p className="text-neutral-800">
                <strong>Dr. Mudassir Sayyad:</strong> {phone1}
              </p>
              <p className="text-neutral-800">
                <strong>Hafiz Asrar Sahab:</strong> {phone2}
              </p>
              {phone3 && (
                <p className="text-neutral-800">
                  <strong>Zahir Ali Pathan:</strong> {phone3}
                </p>
              )}
            </div>
          </div>

          {/* WhatsApp & Email Desk */}
          <div className="bg-white p-7 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-forest-950">Instant WhatsApp Desk</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Available 7 days a week for immediate brochure PDFs, seat confirmations, and visa updates.
            </p>
            <div className="pt-2 text-xs space-y-1.5">
              <a
                href={`https://wa.me/${whatsapp}?text=Assalamualaikum`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-bold hover:underline block"
              >
                WhatsApp: +{whatsapp}
              </a>
              {email && <p className="text-neutral-500">Email: {email}</p>}
              <p className="text-neutral-500">Working Hours: {workingHours}</p>
            </div>
          </div>
        </div>

        {/* Lead Form directly hooked into CRM */}
        <LeadEnquiryForm
          packages={allPackages.map((p) => ({ id: p.id, name: p.name, slug: p.slug, type: p.type }))}
          settings={settings}
          sourcePage="/contact"
        />
      </div>
    </div>
  );
}
