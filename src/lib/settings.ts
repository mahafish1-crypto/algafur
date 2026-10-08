import prisma from "@/lib/db";

export const DEFAULT_SITE_SETTINGS: Record<string, string> = {
  company_name: "AL-GAFUR International Tours And Travels",
  company_short_name: "Al-Gafur Tours",
  company_tagline: "Your Sacred Journey, Handled With Care",
  company_phone_1: "+91 8793939393",
  company_phone_2: "+91 9890708013",
  company_phone_3: "+91 9764444044",
  whatsapp_number: "919890708013",
  company_email: "contact@algafurtours.com",
  company_address: "183, M.G. Road, 15 August Chowk, Khadda Market, Near Camp, Pune - 411001, Maharashtra, India.",
  working_hours: "Monday – Saturday: 10:00 AM – 8:30 PM (IST)",
  google_maps_url: "https://maps.google.com",
  
  // Logos
  site_logo: "",
  header_logo: "",
  footer_logo: "",
  favicon: "",

  // Header Management
  header_topbar_enabled: "true",
  header_announcement_text: "🕋 Bookings Open for 2026 Umrah & Hajj Fixed Departure Groups — Direct Flights & Near Haram Stays",
  header_cta_text: "Book Umrah 2026",
  header_cta_link: "/packages",

  // Footer Management
  footer_description: "Al-Gafur International Tours And Travels is dedicated to facilitating serene, spiritually uplifting, and meticulously organized Hajj & Umrah pilgrimages with authentic Indian hospitality.",
  footer_copyright: "© 2026 AL-GAFUR International Tours And Travels. All Rights Reserved. Govt. Approved Tour Operator.",
  social_facebook: "https://facebook.com",
  social_instagram: "https://instagram.com",
  social_youtube: "https://youtube.com",
  social_twitter: "https://twitter.com",
};

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const list = await prisma.siteSetting.findMany();
    const map: Record<string, string> = { ...DEFAULT_SITE_SETTINGS };
    list.forEach((s) => {
      if (s.value) {
        map[s.key] = s.value;
      }
    });
    return map;
  } catch (err) {
    console.error("Failed to query site settings from database:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

