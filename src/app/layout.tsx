import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Al-Gafur International Tours And Travels | Premium Hajj & Umrah Operating System",
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
  openGraph: {
    title: "Al-Gafur International Tours And Travels",
    description: "Your Sacred Journey, Handled With Care. Premium Hajj & Umrah Packages.",
    url: "https://algafurtours.com",
    siteName: "Al-Gafur Tours",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Al-Gafur International Tours And Travels",
    image: "https://algafurtours.com/brand/poster.jpg",
    telephone: "+91-8793939393",
    email: "contact@algafurtours.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "183, M.G. Road, 15 August Chowk, Khadda Market, Camp",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      postalCode: "411001",
      addressCountry: "IN",
    },
    priceRange: "₹85,000 - ₹5,00,000",
    openingHours: "Mo,Tu,We,Th,Fr,Sa 10:00-20:30",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-gold-500/20 selection:text-gold-900">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

