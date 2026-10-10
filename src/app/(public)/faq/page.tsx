import React from "react";
import FaqSection from "@/components/home/FaqSection";
import { MessageCircle, Phone } from "lucide-react";
import { getPublishedFaqs } from "@/lib/packages-data";
import { getSiteSettings } from "@/lib/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const revalidate = 60;

export const metadata = {
  title: "Frequently Asked Questions | Al-Gafur International Tours And Travels",
  description: "Answers to common questions regarding Umrah visas, flight bookings, Indian meals, and hotel proximity.",
};

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([
    getPublishedFaqs().catch(() => []),
    getSiteSettings(),
  ]);

  const phone1 = settings.company_phone_1 || "+91 8793939393";
  const whatsappNum = settings.whatsapp_number || "919890708013";
  const whatsappHref = buildWhatsAppLink(
    whatsappNum,
    "Assalamualaikum, I have a question about Umrah packages."
  );

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-12">
        <FaqSection faqs={faqs} />

        <div className="bg-white p-8 rounded-3xl border border-gold-500/30 text-center space-y-3">
          <h3 className="text-xl font-serif font-bold text-forest-950">
            Have a question not listed here?
          </h3>
          <p className="text-xs text-neutral-600 max-w-md mx-auto">
            Our Umrah consultants are available on phone and WhatsApp to guide you through any custom itinerary or special health accommodations.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
            <a
              href={`tel:${phone1.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-semibold py-2.5 px-5 rounded-xl text-xs"
            >
              <Phone className="w-4 h-4" />
              Call {phone1}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

