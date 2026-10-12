import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { getSiteSettings } from "@/lib/settings";
import { CANONICAL_SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_URL),
  title: {
    default:
      "Al-Gafur International Tours And Travels | Premium Hajj & Umrah Packages",
    template: "%s | Al-Gafur International Tours And Travels",
  },
  description:
    "Official website of Al-Gafur International Tours And Travels. Premium Hajj & Umrah packages with scholarly guidance, walking distance hotels in Makkah & Madinah, direct flights, and complete pilgrim care.",
  keywords: [
    "Al-Gafur Tours",
    "Umrah Packages 2026",
    "Hajj 1448",
    "Umrah Mumbai Pune Maharashtra",
    "Diyafa Jamal Makkah",
    "Ilaf Kuba Madinah",
    "Hafiz Asrar Sahab Umrah",
    "Direct Flight Umrah",
  ],
  authors: [{ name: "Al-Gafur International Tours And Travels" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Al-Gafur International Tours And Travels",
    description:
      "Your Sacred Journey, Handled With Care. Premium Hajj & Umrah Packages.",
    url: CANONICAL_SITE_URL,
    siteName: "Al-Gafur Tours",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/brand/poster.jpg",
        alt: "Al-Gafur International Tours And Travels",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const faviconUrl = settings.favicon || "/favicon.ico";
  const companyTitle =
    settings.company_name || "Al-Gafur International Tours And Travels";
  const phone = settings.company_phone_1 || "+91-8793939393";
  const email = settings.company_email || "contact@algafurtours.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: companyTitle,
    url: CANONICAL_SITE_URL,
    image: `${CANONICAL_SITE_URL}/brand/poster.jpg`,
    telephone: phone,
    email: email,
    address: {
      "@type": "PostalAddress",
      streetAddress:
        settings.company_address ||
        "183, M.G. Road, 15 August Chowk, Khadda Market, Camp",
      addressLocality: settings.company_city || "Pune",
      addressRegion: settings.company_state || "Maharashtra",
      postalCode: "411001",
      addressCountry: "IN",
    },
    priceRange: "₹85,000 - ₹5,00,000",
    openingHours: "Mo,Tu,We,Th,Fr,Sa 10:00-20:30",
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={faviconUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-gold-500/20 selection:text-gold-900">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
