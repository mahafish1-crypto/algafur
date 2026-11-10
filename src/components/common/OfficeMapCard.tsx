import React from "react";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building,
} from "lucide-react";

interface OfficeMapCardProps {
  settings?: Record<string, string>;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function OfficeMapCard({
  settings = {},
  title = "Visit Our Main Head Office & Booking Center",
  subtitle = "Walk in for face-to-face pilgrimage consultations, passport submissions, and personalized Umrah & Hajj bookings.",
  className = "",
}: OfficeMapCardProps) {
  const officeAddress =
    settings.officeAddress ||
    settings.company_address ||
    "183, M.G. Road, 15 August Chowk, Khadda Market, Near Camp, Pune - 411001, Maharashtra, India.";

  const directionsUrl =
    settings.googleMapDirectionsUrl ||
    settings.google_maps_url ||
    "https://maps.google.com/?q=183+M.G.+Road+15+August+Chowk+Khadda+Market+Camp+Pune+411001";

  const embedUrl =
    settings.googleMapEmbedUrl ||
    settings.google_map_embed_url ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.2486716075677!2d73.8744573!3d18.5176589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c0500742d4f9%3A0x6730a005086ee50a!2sCamp%2C%20Pune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";

  const phone = settings.officePhone || settings.company_phone_1 || "+91 8793939393";
  const coordinator = settings.coordinatorName || settings.coordinator_name || "Dr. Mudassir Sayyad";
  const workingHours = settings.working_hours || "Monday – Saturday: 10:00 AM – 8:30 PM";

  return (
    <section className={`w-full ${className}`}>
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200/60">
                <Building className="w-3.5 h-3.5 text-gold-600" />
                <span>Govt. Approved Head Office</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Address & Office Info */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-forest-950 text-gold-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Official Street Address
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-forest-950 mt-0.5 leading-relaxed">
                    {officeAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-forest-950 text-gold-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Coordinator &amp; Office Contact
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-forest-950 mt-0.5">
                    {coordinator} &bull;{" "}
                    <a
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="text-emerald-800 hover:text-emerald-950 hover:underline"
                    >
                      {phone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-forest-950 text-gold-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Consultation Hours
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-forest-950 mt-0.5">
                    {workingHours}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Navigation CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 hover:from-forest-900 hover:to-forest-850 text-gold-300 hover:text-white text-xs sm:text-sm font-bold shadow-gold transition-all group"
              >
                <Navigation className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                <span>📍 Get Live Directions</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-75" />
              </a>

              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-neutral-300 hover:border-gold-500 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-bold transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Call Desk</span>
              </a>
            </div>
          </div>

          {/* Right Interactive Google Map Embed */}
          <div className="lg:col-span-7">
            <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[440px] rounded-2xl overflow-hidden border-2 border-neutral-200/90 shadow-md bg-neutral-100">
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AL GAFUR INTERNATIONAL Office Location Map"
                className="w-full h-full"
              />

              {/* Float badge */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-forest-950">
                <MapPin className="w-3.5 h-3.5 text-gold-600" />
                <span>Camp, Pune Head Office</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
