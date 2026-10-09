"use client";

import React from "react";
import Link from "next/link";
import BrandLogo from "../brand/BrandLogo";
import { useLanguage } from "@/context/LanguageContext";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
} from "lucide-react";

interface FooterProps {
  settings?: Record<string, string>;
}

export default function Footer({ settings = {} }: FooterProps) {
  const { t } = useLanguage();

  const logoUrl = settings.footer_logo || settings.site_logo || "";
  const companyName = settings.company_name || "Al-Gafur International Tours And Travels";
  const footerDesc =
    settings.footer_description ||
    "Al-Gafur International Tours And Travels is dedicated to facilitating serene, spiritually uplifting, and meticulously organized Hajj & Umrah pilgrimages. With experienced guides, walking distance hotels in holy cities, and authentic Indian hospitality.";
  const phone1 = settings.company_phone_1 || "+91 8793939393";
  const phone2 = settings.company_phone_2 || "+91 9890708013";
  const phone3 = settings.company_phone_3 || "+91 9764444044";
  const whatsapp = settings.whatsapp_number || "919890708013";
  const email = settings.company_email || "contact@algafurtours.com";
  const address =
    settings.company_address ||
    "183, M.G. Road, 15 August Chowk, Khadda Market, Camp, Pune - 411001";
  const workingHours = settings.working_hours || "Mon – Sat: 10:00 AM – 8:30 PM";
  const copyright =
    settings.footer_copyright ||
    `© ${new Date().getFullYear()} ${companyName}. ${t("footer_rights")}`;

  return (
    <footer className="bg-forest-950 text-emerald-100/80 border-t border-gold-500/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/60">
          {/* Column 1: Brand Info & Accreditation */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo
              variant="light"
              size="md"
              showTagline={true}
              customLogoUrl={logoUrl}
              companyName={companyName}
            />
            <p className="text-xs leading-relaxed text-emerald-200/70 max-w-sm mt-3">
              {footerDesc}
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 text-xs text-gold-300 bg-forest-900/80 border border-gold-500/20 px-3 py-1.5 rounded-md w-fit">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>Govt. Approved Tour Operator | 1448 Hijri</span>
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Dedicated Scholar Assistance (Hafiz Asrar & Hafiz Sameer Madani)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-gold-300 uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-gold-300 transition-colors">
                  {t("nav_home")}
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-gold-300 transition-colors">
                  All Umrah Packages
                </Link>
              </li>
              <li>
                <Link href="/hajj" className="hover:text-gold-300 transition-colors">
                  Hajj 2027 Registration
                </Link>
              </li>
              <li>
                <Link href="/ramadan-umrah" className="hover:text-gold-300 transition-colors">
                  Ramadan Umrah Special
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-gold-300 transition-colors">
                  Makkah & Madinah Hotels
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-gold-300 transition-colors">
                  Holy Sites & Ziyarat
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-300 transition-colors">
                  Pilgrim Guidance Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Tracking */}
          <div>
            <h4 className="text-sm font-bold text-gold-300 uppercase tracking-wider mb-4">
              Portals & Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track-booking" className="hover:text-gold-300 transition-colors text-amber-300 font-medium">
                  → Track Booking Status
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-gold-300 transition-colors text-gold-400 font-medium">
                  → Online Seat Reservation
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gold-300 transition-colors">
                  Customer Portal Login
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gold-300 transition-colors">
                  Authorized Agent Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gold-300 transition-colors">
                  Staff CRM & Admin Portal
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold-300 transition-colors">
                  Umrah Visa FAQs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-300 transition-colors">
                  About Leadership & Scholars
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Booking Offices */}
          <div>
            <h4 className="text-sm font-bold text-gold-300 uppercase tracking-wider mb-4">
              Contact & Offices
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Head Office Address:</strong>
                  <br />
                  {address}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <a href={`tel:${phone1.replace(/\s+/g, "")}`} className="hover:text-gold-300 block">
                    {phone1} (Dr. Mudassir)
                  </a>
                  <a href={`tel:${phone2.replace(/\s+/g, "")}`} className="hover:text-gold-300 block">
                    {phone2} (Hafiz Asrar)
                  </a>
                  {phone3 && (
                    <a href={`tel:${phone3.replace(/\s+/g, "")}`} className="hover:text-gold-300 block">
                      {phone3} (Zahir Ali)
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href={`https://wa.me/${whatsapp}?text=Assalamualaikum`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-300 hover:underline"
                >
                  WhatsApp: +{whatsapp}
                </a>
              </div>

              {email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-gold-300">
                    {email}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>{workingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/60">
          <p>{copyright}</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/about" className="hover:text-gold-300">
              Terms & Conditions
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/about" className="hover:text-gold-300">
              Privacy Policy
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/about" className="hover:text-gold-300">
              Cancellation & Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
