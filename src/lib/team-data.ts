import { cache } from "react";
import { getSiteSettings } from "@/lib/settings";

export type TeamCategory =
  | "DIRECTOR"
  | "SPIRITUAL_GUIDE"
  | "OPERATIONS"
  | "SALES"
  | "ACCOUNTS"
  | "SUPPORT"
  | "OTHER";

export interface TeamMemberProfile {
  id: string;
  name: string;
  photo: string;
  category: TeamCategory;
  designation: string;
  bio: string;
  qualifications?: string;
  languages?: string;
  services?: string;
  phone?: string;
  email?: string;
  packageIds: string[];
  displayOrder: number;
  isActive: boolean;
}

export const TEAM_SETTING_KEY = "team_directory_json";

export function buildDefaultTeamFromSettings(
  settings: Record<string, string>,
  defaultPackageIds: string[] = ["07e24084-0e04-42d7-9a56-dd406ef3b9a5"]
): TeamMemberProfile[] {
  const profiles: TeamMemberProfile[] = [];

  const leader1Name = settings.about_leader_1_name || "Dr. Mudassir Rafique Sayyad";
  const leader1Role = settings.about_leader_1_role || "Managing Director";
  const leader1Desc =
    settings.about_leader_1_desc ||
    "Oversees institutional partnerships, airline charters, and overall pilgrim welfare.";

  profiles.push({
    id: "team-director-1",
    name: leader1Name,
    photo: settings.about_leader_1_photo || "",
    category: "DIRECTOR",
    designation: leader1Role,
    bio: leader1Desc,
    qualifications: "",
    languages: "English, Hindi, Marathi, Urdu",
    services: "Executive Leadership, Airline Charters & Pilgrim Welfare",
    packageIds: [],
    displayOrder: 1,
    isActive: true,
  });

  const leader3Name = settings.about_leader_3_name || "Zahir Ali Pathan";
  const leader3Role = settings.about_leader_3_role || "Director of Operations";
  const leader3Desc =
    settings.about_leader_3_desc ||
    "Directs hotel contracting in Makkah & Madinah and airport transfer operations.";

  profiles.push({
    id: "team-director-2",
    name: leader3Name,
    photo: settings.about_leader_3_photo || "",
    category: "DIRECTOR",
    designation: leader3Role,
    bio: leader3Desc,
    qualifications: "",
    languages: "English, Hindi, Marathi, Urdu",
    services: "Makkah & Madinah Hotel Contracting, Ground Transport & Logistics",
    packageIds: [],
    displayOrder: 2,
    isActive: true,
  });

  const leader2Name = settings.about_leader_2_name || "Hafiz Asrar Sahab (S.B.)";
  const leader2Role =
    settings.about_leader_2_role || "Religious Director & Spiritual Guide";
  const leader2Desc =
    settings.about_leader_2_desc ||
    "Leads spiritual discourses, step-by-step Umrah guidance, lectures on Umrah virtues, and Madinah salam sessions.";

  profiles.push({
    id: "team-guide-1",
    name: leader2Name,
    photo: settings.about_leader_2_photo || "",
    category: "SPIRITUAL_GUIDE",
    designation: leader2Role,
    bio: leader2Desc,
    qualifications: "Hafiz-e-Quran & Islamic Scholar",
    languages: "Urdu, Hindi, Marathi, Arabic",
    services: "Umrah Arkan Guidance, Daily Spiritual Bayans & Ziyarat Commentary",
    packageIds: defaultPackageIds,
    displayOrder: 3,
    isActive: true,
  });

  profiles.push({
    id: "team-guide-2",
    name: "Hafiz Sameer Madani",
    photo: "",
    category: "SPIRITUAL_GUIDE",
    designation: "Senior Spiritual Guide & Ziyarat Scholar",
    bio: "Guides pilgrims through the rites of Umrah and provides historical explanations at holy landmarks in Makkah, Madinah, Badr, Uhud, and Taif.",
    qualifications: "Hafiz-e-Quran & Ziyarat Guide",
    languages: "Urdu, Hindi, Arabic",
    services: "Step-by-Step Umrah Rites & Historical Ziyarat Guidance",
    packageIds: defaultPackageIds,
    displayOrder: 4,
    isActive: true,
  });

  return profiles;
}

export function parseTeamProfilesFromSettings(
  settings: Record<string, string>,
  defaultPackageIds: string[] = ["07e24084-0e04-42d7-9a56-dd406ef3b9a5"]
): TeamMemberProfile[] {
  const raw = settings[TEAM_SETTING_KEY];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item, idx) => ({
            id: String(item.id || `team-${idx + 1}`),
            name: String(item.name || "").trim(),
            photo: String(item.photo || "").trim(),
            category: (item.category as TeamCategory) || "OTHER",
            designation: String(item.designation || "").trim(),
            bio: String(item.bio || "").trim(),
            qualifications: item.qualifications ? String(item.qualifications).trim() : "",
            languages: item.languages ? String(item.languages).trim() : "",
            services: item.services ? String(item.services).trim() : "",
            phone: item.phone ? String(item.phone).trim() : "",
            email: item.email ? String(item.email).trim() : "",
            packageIds: Array.isArray(item.packageIds)
              ? item.packageIds.map((id: unknown) => String(id))
              : [],
            displayOrder: Number.isFinite(Number(item.displayOrder))
              ? Number(item.displayOrder)
              : idx + 1,
            isActive: item.isActive !== false,
          }))
          .filter((p) => p.name.length > 0)
          .sort((a, b) => a.displayOrder - b.displayOrder);
      }
    } catch {
      // fallback to default
    }
  }
  return buildDefaultTeamFromSettings(settings, defaultPackageIds);
}

export const getPublicTeamProfiles = cache(async () => {
  const settings = await getSiteSettings();
  const all = parseTeamProfilesFromSettings(settings);
  return all.filter((p) => p.isActive);
});

export const getSpiritualGuidesForPackage = cache(
  async (packageId?: string | null) => {
    const publicProfiles = await getPublicTeamProfiles();
    const guides = publicProfiles.filter((p) => p.category === "SPIRITUAL_GUIDE");
    if (!packageId) return guides;
    const linked = guides.filter(
      (g) => g.packageIds.includes(packageId) || g.packageIds.includes("ALL")
    );
    return linked.length > 0 ? linked : guides;
  }
);
