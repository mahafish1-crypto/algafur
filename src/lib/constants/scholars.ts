export interface ScholarPreset {
  id: string;
  name: string;
  role: string;
  bio: string;
  languages: string;
  avatarUrl?: string;
}

export const DEFAULT_SCHOLARS: ScholarPreset[] = [
  {
    id: "team-guide-1",
    name: "Hafiz Asrar Sahab (S.B.)",
    role: "Religious Director & International Naat Khwan",
    bio: "Leads spiritual discourses, step-by-step Umrah guidance, lectures on Umrah virtues, and Madinah salam sessions.",
    languages: "Urdu, Hindi, Marathi, Arabic",
    avatarUrl: "",
  },
  {
    id: "team-guide-2",
    name: "Hafiz Sameer Madani",
    role: "Senior Spiritual Guide & Ziyarat Scholar",
    bio: "Guides pilgrims through the rites of Umrah and provides historical explanations at holy landmarks in Makkah, Madinah, Badr, Uhud, and Taif.",
    languages: "Urdu, Hindi, Arabic",
    avatarUrl: "",
  },
];

export function parseAssignedGuides(raw: any): ScholarPreset[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item, idx) => {
      if (typeof item === "string") {
        const found = DEFAULT_SCHOLARS.find(
          (s) => s.id === item || s.name.toLowerCase() === item.toLowerCase()
        );
        return (
          found || {
            id: `scholar-${idx + 1}`,
            name: item,
            role: "Spiritual Guide",
            bio: "",
            languages: "",
            avatarUrl: "",
          }
        );
      }
      return {
        id: item.id || `scholar-${idx + 1}`,
        name: item.name || "Islamic Scholar",
        role: item.role || item.designation || "Spiritual Guide",
        bio: item.bio || "",
        languages: item.languages || "",
        avatarUrl: item.avatarUrl || item.photo || "",
      };
    });
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parseAssignedGuides(parsed);
    } catch {
      // If comma-separated or single string
      const trimmed = raw.trim();
      if (trimmed.length > 0) {
        return trimmed.split(",").map((name: string, idx: number) => ({
          id: `scholar-${idx + 1}`,
          name: name.trim(),
          role: "Spiritual Guide",
          bio: "",
          languages: "",
          avatarUrl: "",
        }));
      }
      return [];
    }
  }
  return [];
}
