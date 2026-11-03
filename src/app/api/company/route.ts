import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";
import { buildCanonicalUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSiteSettings();

    const companyInfo = {
      name: settings.company_name || "AL GAFUR INTERNATIONAL TOURS AND TRAVELS",
      shortName: settings.company_short_name || "AL GAFUR",
      tagline: settings.company_tagline || "Your Sacred Journey, Handled With Care",
      slogan: "एक सफर जिंदगी में तब्दीली लानेवाला... इन्शाअल्लाह",
      contactNumbers: [
        settings.company_phone_1 || "+91 8793939393",
        settings.company_phone_2 || "+91 9890708013",
        settings.company_phone_3 || "+91 9764444044",
      ].filter(Boolean),
      whatsappNumber: settings.whatsapp_number
        ? (settings.whatsapp_number.startsWith("+")
            ? settings.whatsapp_number
            : `+${settings.whatsapp_number}`)
        : "+91 98907 08013",
      email: settings.company_email || "contact@algafurtours.com",
      address: {
        headOffice:
          settings.company_address ||
          "183, M.G. Road, 15 August Chowk, Khadda Market, Near Camp, Pune - 411001, Maharashtra, India.",
        city: settings.company_city || "Pune",
        state: settings.company_state || "Maharashtra",
        country: settings.company_country || "India",
        workingHours:
          settings.working_hours ||
          "Monday – Saturday: 10:00 AM – 8:30 PM (IST)",
        googleMapsUrl: settings.google_maps_url || "https://maps.google.com",
      },
      branding: {
        website: buildCanonicalUrl("/"),
        logo: settings.site_logo || settings.header_logo || "/brand/logo.png",
        aboutPage: buildCanonicalUrl("/about"),
        packagesPage: buildCanonicalUrl("/packages"),
      },
      socialLinks: {
        facebook: settings.social_facebook || "https://facebook.com",
        instagram: settings.social_instagram || "https://instagram.com",
        youtube: settings.social_youtube || "https://youtube.com",
        twitter: settings.social_twitter || "https://twitter.com",
      },
      officialCredentials: {
        license: settings.company_license || "Govt. Approved Hajj & Umrah Tour Operator",
        gstin: settings.company_gstin || "27ABCDE1234F1Z5",
        pan: settings.company_pan || "ABCDE1234F",
      },
      bankingRemittance: {
        bankName: settings.bank_name || "HDFC Bank / State Bank of India",
        accountHolder: settings.bank_account_name || "AL GAFUR INTERNATIONAL TOURS AND TRAVELS",
        accountNumber: settings.bank_account_number || "502000XXXXXXXX",
        ifsc: settings.bank_ifsc || "HDFC000XXXX",
        upiVpa: settings.bank_upi || "algafur@upi",
      },
      directors: [
        {
          name: settings.about_leader_1_name || "Dr. Mudassir Rafique Sayyad",
          role: settings.about_leader_1_role || "Managing Director",
          phone: settings.about_leader_1_phone || "+91 8793939393",
        },
        {
          name: settings.about_leader_2_name || "Hafiz Asrar Sahab (S.B.)",
          role: settings.about_leader_2_role || "Religious Director & International Naat Khwan",
          phone: settings.about_leader_2_phone || "+91 9890708013",
        },
        {
          name: settings.about_leader_3_name || "Zahir Ali Pathan",
          role: settings.about_leader_3_role || "Director of Operations",
          phone: settings.about_leader_3_phone || "+91 9764444044",
        },
      ],
    };

    return NextResponse.json(
      {
        success: true,
        company: companyInfo,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

