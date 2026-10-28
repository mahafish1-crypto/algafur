/**
 * AL GAFUR Lead Quality & Priority Scoring Engine
 * 
 * Implements an explainable, objective, 0-100 score with 3 distinct priority tiers:
 * - Hot Lead — First Priority (70–100)
 * - Warm Lead — Second Priority (40–69)
 * - Cold Lead — Lower Priority (0–39)
 * 
 * Safeguards:
 * - NO sensitive attributes (religion, ethnicity, gender, disability, etc.) used.
 * - Missing optional info does not automatically disqualify.
 * - Human override is preserved with an audit reason.
 */

export type LeadPriorityTier = "HOT" | "WARM" | "COLD";

export interface LeadScoreInput {
  travelTimeline?: string | null;
  travelMonth?: string | null;
  interestedIn?: string | null;
  notes?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  travellersCount?: number | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  postalCode?: string | null;
  locationSource?: string | null;
  createdAt?: Date | string | null;
  followUpDate?: string | null;
  status?: string | null;
  priorityOverride?: string | null;
  priorityOverrideReason?: string | null;
}

export interface LeadScoreResult {
  score: number; // 0-100
  priority: LeadPriorityTier;
  priorityLabel: string;
  isOverridden: boolean;
  overrideTier?: LeadPriorityTier;
  overrideReason?: string;
  explanation: string;
  breakdown: {
    urgencyPoints: number;
    engagementPoints: number;
    freshnessPoints: number;
    qualificationPoints: number;
  };
  isOverdue: boolean;
  approxDepartureWindow: string;
  recommendedFollowUpDate: string; // ISO date string YYYY-MM-DD
}

export const TRAVEL_TIMELINE_OPTIONS = [
  "Immediately / As soon as possible",
  "Within 1 month",
  "Within 3 months",
  "Within 6 months",
  "Within 1 year",
  "Flexible / Not decided yet",
] as const;

export type TravelTimelineOption = (typeof TRAVEL_TIMELINE_OPTIONS)[number];

export const PRIORITY_TIER_META: Record<
  LeadPriorityTier,
  {
    label: string;
    shortLabel: string;
    minScore: number;
    maxScore: number;
    badgeBg: string;
    badgeText: string;
    border: string;
    icon: string;
  }
> = {
  HOT: {
    label: "Hot Lead — First Priority",
    shortLabel: "Hot (P1)",
    minScore: 70,
    maxScore: 100,
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    border: "border-rose-200",
    icon: "🔥",
  },
  WARM: {
    label: "Warm Lead — Second Priority",
    shortLabel: "Warm (P2)",
    minScore: 40,
    maxScore: 69,
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    border: "border-amber-200",
    icon: "☀️",
  },
  COLD: {
    label: "Cold Lead — Lower Priority",
    shortLabel: "Cold (P3)",
    minScore: 0,
    maxScore: 39,
    badgeBg: "bg-slate-50",
    badgeText: "text-slate-700",
    border: "border-slate-200",
    icon: "❄️",
  },
};

/**
 * Calculates lead quality score (0-100) and priority category with an explainable breakdown.
 */
export function calculateLeadScore(input: LeadScoreInput): LeadScoreResult {
  const explanationParts: string[] = [];

  // --- 1. TRAVEL URGENCY (Max 40 points) ---
  let urgencyPoints = 5; // Default fallback for flexible / undecided
  const timeline = (input.travelTimeline || "").trim().toLowerCase();
  const travelMonth = (input.travelMonth || "").trim().toLowerCase();

  let approxDepartureWindow = "Flexible / To Be Decided";
  let followUpDaysOffset = 3;

  if (
    timeline.includes("immediately") ||
    timeline.includes("asap") ||
    timeline.includes("as soon as possible") ||
    travelMonth.includes("immediately") ||
    travelMonth.includes("asap")
  ) {
    urgencyPoints = 40;
    approxDepartureWindow = "Immediate (Within 1-2 weeks)";
    followUpDaysOffset = 0; // Same-day / immediate follow-up
    explanationParts.push("Immediate travel (+40)");
  } else if (
    timeline.includes("1 month") ||
    timeline.includes("one month") ||
    travelMonth.includes("1 month")
  ) {
    urgencyPoints = 35;
    approxDepartureWindow = "Within next 30 days";
    followUpDaysOffset = 1;
    explanationParts.push("Travel within 1 month (+35)");
  } else if (
    timeline.includes("3 months") ||
    timeline.includes("three months") ||
    travelMonth.includes("3 months")
  ) {
    urgencyPoints = 25;
    approxDepartureWindow = "Within 3 months";
    followUpDaysOffset = 2;
    explanationParts.push("Travel within 3 months (+25)");
  } else if (
    timeline.includes("6 months") ||
    timeline.includes("six months") ||
    travelMonth.includes("6 months")
  ) {
    urgencyPoints = 15;
    approxDepartureWindow = "Within 6 months";
    followUpDaysOffset = 4;
    explanationParts.push("Travel within 6 months (+15)");
  } else if (
    timeline.includes("1 year") ||
    timeline.includes("one year") ||
    timeline.includes("12 months") ||
    travelMonth.includes("1 year")
  ) {
    urgencyPoints = 10;
    approxDepartureWindow = "Within 1 year";
    followUpDaysOffset = 7;
    explanationParts.push("Travel within 1 year (+10)");
  } else {
    urgencyPoints = 5;
    approxDepartureWindow = "Flexible / Open Dates";
    followUpDaysOffset = 3;
    explanationParts.push("Flexible travel timeline (+5)");
  }

  // --- 2. ENGAGEMENT (Max 25 points) ---
  let engagementPoints = 0;

  // Specific package or interest (+10 points)
  const interest = (input.interestedIn || "").trim().toLowerCase();
  if (
    interest &&
    !interest.includes("other") &&
    interest !== "general" &&
    interest.length > 2
  ) {
    engagementPoints += 10;
    explanationParts.push(`Selected package/interest (+10)`);
  } else if (interest) {
    engagementPoints += 5;
    explanationParts.push(`General pilgrimage enquiry (+5)`);
  }

  // Meaningful message / notes (+10 points for >15 chars, +5 for short)
  const notes = (input.notes || "").trim();
  if (notes.length > 15) {
    engagementPoints += 10;
    explanationParts.push("Provided detailed message (+10)");
  } else if (notes.length > 0) {
    engagementPoints += 5;
    explanationParts.push("Provided brief message (+5)");
  }

  // Complete contact channels (+5 points)
  const hasPhone = Boolean(input.phone && input.phone.trim().length >= 10);
  const hasAltContact = Boolean(
    (input.whatsapp && input.whatsapp.trim().length >= 10 && input.whatsapp !== input.phone) ||
      (input.email && input.email.includes("@"))
  );
  if (hasPhone && hasAltContact) {
    engagementPoints += 5;
    explanationParts.push("Multiple verified contact channels (+5)");
  } else if (hasPhone) {
    engagementPoints += 3;
    explanationParts.push("Phone provided (+3)");
  }
  engagementPoints = Math.min(25, engagementPoints);

  // --- 3. FOLLOW-UP AND FRESHNESS (Max 20 points) ---
  let freshnessPoints = 0;
  const createdDate = input.createdAt ? new Date(input.createdAt) : new Date();
  const ageInHours = Math.max(0, (Date.now() - createdDate.getTime()) / (1000 * 60 * 60));

  if (ageInHours <= 24) {
    freshnessPoints += 15;
    explanationParts.push("Submitted within 24h (+15)");
  } else if (ageInHours <= 48) {
    freshnessPoints += 10;
    explanationParts.push("Submitted within 48h (+10)");
  } else if (ageInHours <= 168) {
    // 7 days
    freshnessPoints += 5;
    explanationParts.push("Submitted within 7 days (+5)");
  } else {
    freshnessPoints += 2;
    explanationParts.push("Historical lead (+2)");
  }

  // Check Overdue follow-up
  let isOverdue = false;
  if (input.followUpDate) {
    const todayStr = new Date().toISOString().split("T")[0];
    if (input.followUpDate < todayStr && input.status !== "CONVERTED" && input.status !== "CLOSED") {
      isOverdue = true;
      freshnessPoints += 5; // Operational urgency boost
      explanationParts.push("Follow-up overdue priority boost (+5)");
    } else if (input.followUpDate === todayStr) {
      freshnessPoints += 3;
      explanationParts.push("Follow-up due today (+3)");
    }
  }
  freshnessPoints = Math.min(20, freshnessPoints);

  // --- 4. ADDITIONAL QUALIFICATION (Max 15 points) ---
  let qualificationPoints = 0;
  const pax = Number(input.travellersCount || 1);

  if (pax >= 4) {
    qualificationPoints += 10;
    explanationParts.push(`Group/Large Family (${pax} pax) (+10)`);
  } else if (pax >= 2) {
    qualificationPoints += 7;
    explanationParts.push(`Family/Couple (${pax} pax) (+7)`);
  } else {
    qualificationPoints += 3;
    explanationParts.push("Individual pilgrim (+3)");
  }

  // Verified Location Signal (GPS or valid postal code) (+5 points)
  const hasGps =
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude) &&
    input.locationSource === "GPS";
  const hasPostal = Boolean(input.postalCode && /^\d{5,6}$/.test(input.postalCode.trim()));

  if (hasGps) {
    qualificationPoints += 5;
    explanationParts.push("Verified GPS location (+5)");
  } else if (hasPostal) {
    qualificationPoints += 3;
    explanationParts.push("Verified postal code (+3)");
  }
  qualificationPoints = Math.min(15, qualificationPoints);

  // --- TOTAL CALCULATED SCORE ---
  const totalRaw =
    urgencyPoints + engagementPoints + freshnessPoints + qualificationPoints;
  const clampedScore = Math.min(100, Math.max(0, totalRaw));

  // Determine calculated tier
  let calculatedTier: LeadPriorityTier = "COLD";
  if (clampedScore >= 70) {
    calculatedTier = "HOT";
  } else if (clampedScore >= 40) {
    calculatedTier = "WARM";
  }

  // Check manual override
  const overrideRaw = (input.priorityOverride || "").toUpperCase().trim();
  const isOverridden =
    overrideRaw === "HOT" || overrideRaw === "WARM" || overrideRaw === "COLD";
  const finalTier: LeadPriorityTier = isOverridden
    ? (overrideRaw as LeadPriorityTier)
    : calculatedTier;

  // Calculate recommended follow-up date
  const baseTime = input.createdAt ? new Date(input.createdAt).getTime() : Date.now();
  const targetFollowUp = new Date(baseTime + followUpDaysOffset * 24 * 60 * 60 * 1000);
  const recommendedFollowUpDate = targetFollowUp.toISOString().split("T")[0];

  const fullExplanation = isOverridden
    ? `Manually overridden to ${finalTier}${input.priorityOverrideReason ? ` (${input.priorityOverrideReason})` : ""} • Algorithmic factors: ${explanationParts.join(" • ")} = ${clampedScore}/100`
    : `${explanationParts.join(" • ")} = ${clampedScore}/100`;

  return {
    score: clampedScore,
    priority: finalTier,
    priorityLabel: PRIORITY_TIER_META[finalTier].label,
    isOverridden,
    overrideTier: isOverridden ? (overrideRaw as LeadPriorityTier) : undefined,
    overrideReason: input.priorityOverrideReason || undefined,
    explanation: fullExplanation,
    breakdown: {
      urgencyPoints,
      engagementPoints,
      freshnessPoints,
      qualificationPoints,
    },
    isOverdue,
    approxDepartureWindow,
    recommendedFollowUpDate,
  };
}
