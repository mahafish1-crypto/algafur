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
  company_city: "Pune",
  company_state: "Maharashtra",
  company_country: "India",
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

  // About Page CMS
  about_badge: "About Al-Gafur Tours",
  about_title: "Serving the Guests of Allah with Honor and Care",
  about_subtitle: "A premier international Hajj & Umrah travel organization founded on devotion, transparency, and scholarly guidance.",
  about_mandate_title: "Our Spiritual Mandate",
  about_mandate_description_1: "At Al-Gafur International Tours And Travels, we believe embarking on Hajj or Umrah is not merely an itinerary — it is the milestone pilgrimage of a lifetime. Every detail, from selecting hotels with level walking pathways to the Haram courtyards, to preparing fresh Indian meals that nourish tired worshippers, is managed with intense responsibility.",
  about_mandate_description_2: "Our slogan reflects our devotion: \"एक सफर जिंदगी में तब्दीली लानेवाला... इन्शाअल्लाह\" — A journey destined to transform your heart and life.",
  about_image: "/brand/img2.jpeg",
  about_feature_1: "Ministry of Hajj & Umrah Recognized Operations",
  about_feature_2: "Over 1,500+ Satisfied Pilgrims Guided Across Maharashtra",
  about_feature_3: "Direct Mumbai Return Flights Guaranteed",
  about_leader_1_name: "Dr. Mudassir Rafique Sayyad",
  about_leader_1_role: "Managing Director",
  about_leader_1_desc: "Oversees institutional partnerships, airline charters, and pilgrim welfare.",
  about_leader_1_phone: "+91 8793939393",
  about_leader_2_name: "Hafiz Asrar Sahab (S.B.)",
  about_leader_2_role: "Religious Director & International Naat Khwan",
  about_leader_2_desc: "Leads spiritual discourses, lectures on Umrah virtues, and Madinah salam sessions.",
  about_leader_2_phone: "+91 9890708013",
  about_leader_3_name: "Zahir Ali Pathan",
  about_leader_3_role: "Director of Operations",
  about_leader_3_desc: "Directs hotel contracting in Makkah & Madinah and airport transfer operations.",
  about_leader_3_phone: "+91 9764444044",
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
