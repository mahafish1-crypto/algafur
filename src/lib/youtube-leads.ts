import prisma from "@/lib/db";

export type FormFieldType =
  | "SHORT_TEXT"
  | "PARAGRAPH"
  | "PHONE"
  | "EMAIL"
  | "RADIO"
  | "CHECKBOXES"
  | "DROPDOWN"
  | "DATE"
  | "NUMBER"
  | "YES_NO"
  | "CONSENT"
  | "LOCATION";

export type QuestionFieldRole =
  | "name"
  | "phone"
  | "whatsapp"
  | "email"
  | "city"
  | "location"
  | "address"
  | "state"
  | "postalCode"
  | "interestedIn"
  | "travelMonth"
  | "travelTimeline"
  | "travellersCount"
  | "notes"
  | "consent"
  | "custom";

export interface FormQuestionValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FormQuestion {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  options?: string[];
  fieldRole?: QuestionFieldRole;
  validation?: FormQuestionValidation;
  order?: number;
}

export interface SubmittedAnswerSnapshot {
  questionId: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  fieldRole?: QuestionFieldRole;
  value: string | string[] | boolean | number | Record<string, unknown> | null;
  displayValue: string;
}

export interface FormSettingsConfig {
  themeAccent?: string;
  bannerSubtitle?: string;
  autoAssignUserId?: string;
  enableWhatsAppQuickReply?: boolean;
  notifyOnSubmission?: boolean;
  redirectUrl?: string;
}

export const YOUTUBE_LEAD_STATUSES = [
  {
    key: "NEW",
    value: "NEW",
    label: "New",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    key: "CONTACTED",
    value: "CONTACTED",
    label: "Contacted",
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    key: "FOLLOW_UP",
    value: "FOLLOW_UP",
    label: "Follow-up",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    key: "INTERESTED",
    value: "INTERESTED",
    label: "Interested",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    key: "CONVERTED",
    value: "CONVERTED",
    label: "Converted",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    key: "CLOSED",
    value: "CLOSED",
    label: "Closed",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
] as const;

export type YouTubeLeadStatusKey = (typeof YOUTUBE_LEAD_STATUSES)[number]["key"];

export const FIELD_TYPE_META: Array<{
  type: FormFieldType;
  label: string;
  description: string;
  hasOptions: boolean;
}> = [
  {
    type: "SHORT_TEXT",
    label: "Short Answer",
    description: "Single-line text input (names, city, travel month)",
    hasOptions: false,
  },
  {
    type: "PARAGRAPH",
    label: "Paragraph / Long Answer",
    description: "Multi-line text box for questions or special requests",
    hasOptions: false,
  },
  {
    type: "PHONE",
    label: "Phone Number",
    description: "Validated 10 to 15 digit mobile or WhatsApp number",
    hasOptions: false,
  },
  {
    type: "EMAIL",
    label: "Email Address",
    description: "Validated email input field",
    hasOptions: false,
  },
  {
    type: "RADIO",
    label: "Single-Choice Radio Buttons",
    description: "Customer selects one option from visible radio buttons",
    hasOptions: true,
  },
  {
    type: "CHECKBOXES",
    label: "Multiple-Choice Checkboxes",
    description: "Customer can select one or more options",
    hasOptions: true,
  },
  {
    type: "DROPDOWN",
    label: "Dropdown Select",
    description: "Compact dropdown menu with selectable options",
    hasOptions: true,
  },
  {
    type: "DATE",
    label: "Date Picker",
    description: "Calendar date selection",
    hasOptions: false,
  },
  {
    type: "NUMBER",
    label: "Number",
    description: "Numeric input (e.g. number of travellers)",
    hasOptions: false,
  },
  {
    type: "YES_NO",
    label: "Yes / No",
    description: "Simple Yes or No toggle choice",
    hasOptions: false,
  },
  {
    type: "CONSENT",
    label: "Consent Checkbox",
    description: "Agreement checkbox for callback / WhatsApp communication",
    hasOptions: false,
  },
  {
    type: "LOCATION",
    label: "GPS & Address Location",
    description: "One-click 'Detect My Location' with address breakdown and manual editing",
    hasOptions: false,
  },
];

export const DEFAULT_YOUTUBE_FORM_QUESTIONS: FormQuestion[] = [
  {
    id: "q_full_name",
    label: "Full Name",
    type: "SHORT_TEXT",
    required: true,
    placeholder: "Enter your full name",
    helperText: "As per your official ID or family group head",
    fieldRole: "name",
    validation: { minLength: 2, maxLength: 100 },
  },
  {
    id: "q_mobile_number",
    label: "Mobile Number",
    type: "PHONE",
    required: true,
    placeholder: "+91 98XXXXXXXX",
    helperText: "Our Umrah & Hajj advisor will call you on this number",
    fieldRole: "phone",
  },
  {
    id: "q_whatsapp_number",
    label: "WhatsApp Number",
    type: "PHONE",
    required: false,
    placeholder: "Same as mobile or enter WhatsApp number",
    helperText: "Optional — for receiving package brochures & hotel photos on WhatsApp",
    fieldRole: "whatsapp",
  },
  {
    id: "q_email",
    label: "Email",
    type: "EMAIL",
    required: false,
    placeholder: "yourname@example.com",
    helperText: "Optional — if you would also like itinerary details by email",
    fieldRole: "email",
  },
  {
    id: "q_location",
    label: "Your City / Current Location",
    type: "LOCATION",
    required: true,
    placeholder: "Click 'Detect My Location' or type your city/district",
    helperText: "Helps us arrange nearest airport departure & regional guidance",
    fieldRole: "location",
  },
  {
    id: "q_interested_in",
    label: "Interested In",
    type: "RADIO",
    required: true,
    options: ["Hajj", "Umrah", "Ramadan Umrah", "Group Package", "Other"],
    helperText: "Select the sacred journey you are planning",
    fieldRole: "interestedIn",
  },
  {
    id: "q_travel_timeline",
    label: "Preferred Travel Timeline",
    type: "RADIO",
    required: true,
    options: [
      "Immediately / As soon as possible",
      "Within 1 month",
      "Within 3 months",
      "Within 6 months",
      "Within 1 year",
      "Flexible / Not decided yet",
    ],
    helperText: "Select when you and your family plan to perform the pilgrimage",
    fieldRole: "travelTimeline",
  },
  {
    id: "q_travel_month",
    label: "Approximate Travel Month / Season",
    type: "SHORT_TEXT",
    required: false,
    placeholder: "e.g. October 2026 / Ramadan 2027 / Winter Break",
    helperText: "Optional — specific month or Islamic holiday you prefer",
    fieldRole: "travelMonth",
    validation: { maxLength: 80 },
  },
  {
    id: "q_travellers_count",
    label: "Number of Travellers",
    type: "NUMBER",
    required: false,
    placeholder: "e.g. 2",
    helperText: "Total family members or pilgrims travelling together",
    fieldRole: "travellersCount",
    validation: { min: 1, max: 100 },
  },
  {
    id: "q_message",
    label: "Message or Questions",
    type: "PARAGRAPH",
    required: false,
    placeholder: "Share any questions about hotels near Haram, flights, wheelchair assistance, or room sharing...",
    helperText: "Optional — tell us how we can best assist your family",
    fieldRole: "notes",
    validation: { maxLength: 1000 },
  },
  {
    id: "q_consent",
    label: "I agree to be contacted by Al-Gafur Hajj & Umrah Tours via Phone/WhatsApp regarding my enquiry.",
    type: "CONSENT",
    required: true,
    helperText: "Your contact details are kept strictly confidential and never shared with third parties.",
    fieldRole: "consent",
  },
];

export function parseFormQuestions(rawJson: string | null | undefined): FormQuestion[] {
  if (!rawJson) return DEFAULT_YOUTUBE_FORM_QUESTIONS;
  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_YOUTUBE_FORM_QUESTIONS;
    }
    return parsed.map((q: any, idx: number) => ({
      id: String(q.id || `q_${idx + 1}`),
      label: String(q.label || `Question ${idx + 1}`).trim(),
      type: (q.type as FormFieldType) || "SHORT_TEXT",
      required: Boolean(q.required),
      placeholder: q.placeholder ? String(q.placeholder) : "",
      helperText: q.helperText ? String(q.helperText) : "",
      options: Array.isArray(q.options)
        ? q.options.map((o: unknown) => String(o).trim()).filter(Boolean)
        : undefined,
      fieldRole: q.fieldRole || "custom",
      validation: q.validation && typeof q.validation === "object" ? q.validation : undefined,
    }));
  } catch {
    return DEFAULT_YOUTUBE_FORM_QUESTIONS;
  }
}

export function parseSubmittedAnswers(
  rawJson: string | null | undefined
): SubmittedAnswerSnapshot[] {
  if (!rawJson) return [];
  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((a: any, idx: number) => ({
      questionId: String(a.questionId || `q_${idx + 1}`),
      label: String(a.label || `Question ${idx + 1}`),
      type: (a.type as FormFieldType) || "SHORT_TEXT",
      required: Boolean(a.required),
      fieldRole: a.fieldRole,
      value: a.value ?? null,
      displayValue:
        typeof a.displayValue === "string"
          ? a.displayValue
          : Array.isArray(a.value)
          ? a.value.join(", ")
          : a.value === true
          ? "Yes (Agreed)"
          : a.value === false
          ? "No"
          : String(a.value ?? "—"),
    }));
  } catch {
    return [];
  }
}

export function sanitizeTextValue(raw: unknown, maxLen = 1000): string {
  if (raw === null || raw === undefined) return "";
  return String(raw)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLen);
}

export function normalizeIndianOrIntlPhone(raw: string): string {
  const trimmed = sanitizeTextValue(raw, 30);
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2)}`;
  }
  return trimmed;
}

export function validateAndSanitizeSubmission(
  questions: FormQuestion[],
  rawAnswers: Record<string, unknown>
): {
  valid: boolean;
  errors: Record<string, string>;
  firstErrorMessage?: string;
  snapshots: SubmittedAnswerSnapshot[];
  extracted: {
    name: string;
    fullName?: string;
    phone: string;
    whatsapp: string | null;
    email: string | null;
    city: string | null;
    district: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    locationSource: string | null;
    interestedIn: string | null;
    travelMonth: string | null;
    travelTimeline: string | null;
    travellersCount: number;
    notes: string | null;
  };
} {
  const errors: Record<string, string> = {};
  const snapshots: SubmittedAnswerSnapshot[] = [];

  let extractedName = "";
  let extractedPhone = "";
  let extractedWhatsapp: string | null = null;
  let extractedEmail: string | null = null;
  let extractedCity: string | null = null;
  let extractedDistrict: string | null = null;
  let extractedState: string | null = null;
  let extractedPostalCode: string | null = null;
  let extractedCountry: string | null = "India";
  let extractedAddress: string | null = null;
  let extractedLatitude: number | null = null;
  let extractedLongitude: number | null = null;
  let extractedLocationSource: string | null = null;
  let extractedInterestedIn: string | null = null;
  let extractedTravelMonth: string | null = null;
  let extractedTravelTimeline: string | null = null;
  let extractedTravellersCount = 1;
  const extraNotesParts: string[] = [];

  for (const q of questions) {
    const rawVal = rawAnswers[q.id];
    const labelLower = q.label.toLowerCase();

    if (q.type === "LOCATION") {
      let locationData: {
        address?: string;
        city?: string;
        district?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
        locationSource?: "GPS" | "MANUAL";
      } = {};

      if (rawVal && typeof rawVal === "object" && !Array.isArray(rawVal)) {
        const obj = rawVal as Record<string, unknown>;
        locationData = {
          address: sanitizeTextValue(obj.address, 300),
          city: sanitizeTextValue(obj.city, 100),
          district: sanitizeTextValue(obj.district, 100),
          state: sanitizeTextValue(obj.state, 100),
          postalCode: sanitizeTextValue(obj.postalCode, 20),
          country: sanitizeTextValue(obj.country, 100) || "India",
          latitude: Number.isFinite(Number(obj.latitude))
            ? Number(obj.latitude)
            : undefined,
          longitude: Number.isFinite(Number(obj.longitude))
            ? Number(obj.longitude)
            : undefined,
          locationSource:
            obj.locationSource === "GPS" || obj.source === "GPS"
              ? "GPS"
              : "MANUAL",
        };
      } else if (rawVal && typeof rawVal === "string") {
        const cleanStr = sanitizeTextValue(rawVal, 300);
        locationData = {
          address: cleanStr,
          city: cleanStr.split(",")[0]?.trim() || cleanStr,
          country: "India",
          locationSource: "MANUAL",
        };
      }

      const primaryLocality =
        locationData.city || locationData.address || locationData.state || "";
      if (q.required && !primaryLocality) {
        errors[q.id] = `"${q.label}" is required. Please detect your location or enter your city.`;
      }

      const displayString = [
        locationData.address || locationData.city,
        locationData.state,
        locationData.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      snapshots.push({
        questionId: q.id,
        label: q.label,
        type: q.type,
        required: q.required,
        fieldRole: q.fieldRole,
        value: locationData,
        displayValue:
          displayString ||
          (locationData.locationSource === "GPS" ? "GPS Detected Location" : "—"),
      });

      if (locationData.city) extractedCity = locationData.city;
      if (locationData.district) extractedDistrict = locationData.district;
      if (locationData.state) extractedState = locationData.state;
      if (locationData.postalCode) extractedPostalCode = locationData.postalCode;
      if (locationData.country) extractedCountry = locationData.country;
      if (locationData.address) extractedAddress = locationData.address;
      if (locationData.latitude !== undefined)
        extractedLatitude = locationData.latitude;
      if (locationData.longitude !== undefined)
        extractedLongitude = locationData.longitude;
      if (locationData.locationSource)
        extractedLocationSource = locationData.locationSource;
      continue;
    }

    if (q.type === "CONSENT") {
      const agreed =
        rawVal === true ||
        rawVal === "true" ||
        rawVal === "yes" ||
        rawVal === "on" ||
        rawVal === 1;
      if (q.required && !agreed) {
        errors[q.id] = `Please check "${q.label}" to proceed.`;
      }
      snapshots.push({
        questionId: q.id,
        label: q.label,
        type: q.type,
        required: q.required,
        fieldRole: q.fieldRole,
        value: agreed,
        displayValue: agreed ? "Agreed / Consented" : "Not Checked",
      });
      continue;
    }

    if (q.type === "CHECKBOXES") {
      const arr = Array.isArray(rawVal)
        ? rawVal.map((item) => sanitizeTextValue(item, 150)).filter(Boolean)
        : typeof rawVal === "string" && rawVal.trim()
        ? [sanitizeTextValue(rawVal, 150)]
        : [];

      if (q.required && arr.length === 0) {
        errors[q.id] = `"${q.label}" is required. Please select at least one option.`;
      } else if (arr.length > 0 && q.options && q.options.length > 0) {
        const invalidOpt = arr.find((v) => !q.options!.includes(v));
        if (invalidOpt) {
          errors[q.id] = `Invalid option selected for "${q.label}".`;
        }
      }

      const display = arr.join(", ");
      snapshots.push({
        questionId: q.id,
        label: q.label,
        type: q.type,
        required: q.required,
        fieldRole: q.fieldRole,
        value: arr,
        displayValue: display || "—",
      });

      if (
        q.fieldRole === "interestedIn" ||
        labelLower.includes("interest") ||
        labelLower.includes("package")
      ) {
        if (display) extractedInterestedIn = display;
      }
      continue;
    }

    if (q.type === "YES_NO") {
      const strVal = sanitizeTextValue(rawVal, 20);
      if (q.required && !strVal) {
        errors[q.id] = `Please select Yes or No for "${q.label}".`;
      } else if (strVal && !["Yes", "No", "yes", "no", "true", "false"].includes(strVal)) {
        errors[q.id] = `Invalid choice for "${q.label}".`;
      }
      const normalizedYesNo =
        strVal.toLowerCase() === "yes" || strVal.toLowerCase() === "true"
          ? "Yes"
          : strVal.toLowerCase() === "no" || strVal.toLowerCase() === "false"
          ? "No"
          : "";
      snapshots.push({
        questionId: q.id,
        label: q.label,
        type: q.type,
        required: q.required,
        fieldRole: q.fieldRole,
        value: normalizedYesNo || null,
        displayValue: normalizedYesNo || "—",
      });
      continue;
    }

    if (q.type === "NUMBER") {
      const strVal = sanitizeTextValue(rawVal, 30);
      if (!strVal) {
        if (q.required) {
          errors[q.id] = `"${q.label}" is required.`;
        }
        snapshots.push({
          questionId: q.id,
          label: q.label,
          type: q.type,
          required: q.required,
          fieldRole: q.fieldRole,
          value: null,
          displayValue: "—",
        });
      } else {
        const num = Number(strVal);
        if (!Number.isFinite(num)) {
          errors[q.id] = `Please enter a valid number for "${q.label}".`;
        } else {
          if (q.validation?.min !== undefined && num < q.validation.min) {
            errors[q.id] = `"${q.label}" must be at least ${q.validation.min}.`;
          }
          if (q.validation?.max !== undefined && num > q.validation.max) {
            errors[q.id] = `"${q.label}" must be at most ${q.validation.max}.`;
          }
        }
        snapshots.push({
          questionId: q.id,
          label: q.label,
          type: q.type,
          required: q.required,
          fieldRole: q.fieldRole,
          value: Number.isFinite(num) ? num : strVal,
          displayValue: String(Number.isFinite(num) ? num : strVal),
        });
        if (
          Number.isFinite(num) &&
          (q.fieldRole === "travellersCount" ||
            labelLower.includes("traveller") ||
            labelLower.includes("traveler") ||
            labelLower.includes("pilgrim") ||
            labelLower.includes("person") ||
            labelLower.includes("pax"))
        ) {
          extractedTravellersCount = Math.max(1, Math.round(num));
        }
      }
      continue;
    }

    // String-based types: SHORT_TEXT, PARAGRAPH, PHONE, EMAIL, RADIO, DROPDOWN, DATE
    const maxAllowed =
      q.validation?.maxLength || (q.type === "PARAGRAPH" ? 2000 : 250);
    const strVal = sanitizeTextValue(rawVal, maxAllowed);

    if (q.required && !strVal) {
      errors[q.id] = `"${q.label}" is required.`;
    } else if (strVal) {
      if (q.validation?.minLength && strVal.length < q.validation.minLength) {
        errors[q.id] = `"${q.label}" must be at least ${q.validation.minLength} characters.`;
      }
      if (q.type === "PHONE") {
        const digits = strVal.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 15) {
          errors[q.id] = `Please enter a valid 10 to 15 digit phone number for "${q.label}".`;
        }
      } else if (q.type === "EMAIL") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
          errors[q.id] = `Please enter a valid email address for "${q.label}".`;
        }
      } else if (
        (q.type === "RADIO" || q.type === "DROPDOWN") &&
        q.options &&
        q.options.length > 0
      ) {
        if (!q.options.includes(strVal)) {
          errors[q.id] = `Please select a valid option for "${q.label}".`;
        }
      } else if (q.type === "DATE") {
        const ts = Date.parse(strVal);
        if (Number.isNaN(ts)) {
          errors[q.id] = `Please select a valid date for "${q.label}".`;
        }
      }
    }

    const finalValue =
      q.type === "PHONE" && strVal ? normalizeIndianOrIntlPhone(strVal) : strVal;

    snapshots.push({
      questionId: q.id,
      label: q.label,
      type: q.type,
      required: q.required,
      fieldRole: q.fieldRole,
      value: finalValue || null,
      displayValue: finalValue || "—",
    });

    if (!finalValue) continue;

    // Map to primary CRM fields
    if (
      q.fieldRole === "name" ||
      (!extractedName &&
        (labelLower.includes("full name") ||
          labelLower === "name" ||
          labelLower.includes("your name") ||
          labelLower.includes("pilgrim name")))
    ) {
      extractedName = finalValue;
    } else if (
      q.fieldRole === "phone" ||
      (!extractedPhone &&
        (q.type === "PHONE" ||
          labelLower.includes("mobile") ||
          labelLower.includes("phone") ||
          labelLower.includes("contact number")))
    ) {
      extractedPhone = normalizeIndianOrIntlPhone(finalValue);
    } else if (
      q.fieldRole === "whatsapp" ||
      (!extractedWhatsapp && labelLower.includes("whatsapp"))
    ) {
      extractedWhatsapp = normalizeIndianOrIntlPhone(finalValue);
    } else if (
      q.fieldRole === "email" ||
      (!extractedEmail && (q.type === "EMAIL" || labelLower.includes("email")))
    ) {
      extractedEmail = finalValue.toLowerCase();
    } else if (
      q.fieldRole === "city" ||
      (!extractedCity && (labelLower.includes("city") || labelLower.includes("location")))
    ) {
      extractedCity = finalValue;
    } else if (
      q.fieldRole === "interestedIn" ||
      (!extractedInterestedIn &&
        (labelLower.includes("interested") ||
          labelLower.includes("journey") ||
          labelLower.includes("package")))
    ) {
      extractedInterestedIn = finalValue;
    } else if (
      q.fieldRole === "travelTimeline" ||
      (!extractedTravelTimeline &&
        (labelLower.includes("timeline") ||
          labelLower.includes("urgency") ||
          labelLower.includes("planning to perform") ||
          labelLower.includes("travel timeline")))
    ) {
      extractedTravelTimeline = finalValue;
    } else if (
      q.fieldRole === "travelMonth" ||
      (!extractedTravelMonth &&
        (labelLower.includes("month") ||
          labelLower.includes("travel date") ||
          labelLower.includes("departure")))
    ) {
      extractedTravelMonth = finalValue;
    } else if (
      q.fieldRole === "notes" ||
      labelLower.includes("message") ||
      labelLower.includes("question") ||
      labelLower.includes("note")
    ) {
      extraNotesParts.push(finalValue);
    } else if (q.fieldRole === "custom") {
      extraNotesParts.push(`${q.label}: ${finalValue}`);
    }
  }

  // Fallback if custom form had no explicit name/phone role
  if (!extractedName) {
    const firstText = snapshots.find(
      (s) =>
        (s.type === "SHORT_TEXT" || s.type === "PARAGRAPH") &&
        typeof s.value === "string" &&
        s.value.trim().length > 0
    );
    extractedName = firstText ? String(firstText.value) : "YouTube Pilgrim Lead";
  }

  if (!extractedPhone) {
    const firstPhone = snapshots.find(
      (s) => s.type === "PHONE" && typeof s.value === "string" && s.value.trim().length > 0
    );
    extractedPhone = firstPhone ? String(firstPhone.value) : "";
  }

  const errorKeys = Object.keys(errors);
  return {
    valid: errorKeys.length === 0,
    errors,
    firstErrorMessage: errorKeys.length > 0 ? errors[errorKeys[0]] : undefined,
    snapshots,
    extracted: {
      fullName: extractedName,
      name: extractedName,
      phone: extractedPhone,
      whatsapp: extractedWhatsapp || extractedPhone || null,
      email: extractedEmail,
      city: extractedCity,
      district: extractedDistrict,
      state: extractedState,
      postalCode: extractedPostalCode,
      country: extractedCountry,
      address: extractedAddress,
      latitude: extractedLatitude,
      longitude: extractedLongitude,
      locationSource: extractedLocationSource,
      interestedIn: extractedInterestedIn,
      travelMonth: extractedTravelMonth,
      travelTimeline: extractedTravelTimeline,
      travellersCount: extractedTravellersCount,
      notes: extraNotesParts.length > 0 ? extraNotesParts.join(" | ") : null,
    },
  };
}

/**
 * Extracts YouTube video ID and URL ONLY when genuinely present in query params or referrer.
 * Never fabricates a video ID or claims YouTube source if unknown.
 */
export function extractYouTubeAttribution(input: {
  videoId?: string | null;
  videoUrl?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
  explicitSource?: string | null;
}) {
  let cleanVideoId: string | null = null;
  let cleanVideoUrl: string | null = null;

  const rawVideoParam = sanitizeTextValue(input.videoId || input.videoUrl || "", 300);
  if (rawVideoParam) {
    // Check if it's a full URL or an 11-char ID
    const ytMatch =
      rawVideoParam.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,20})/) ||
      null;
    if (ytMatch && ytMatch[1]) {
      cleanVideoId = ytMatch[1];
      cleanVideoUrl = rawVideoParam.startsWith("http")
        ? rawVideoParam
        : `https://www.youtube.com/watch?v=${cleanVideoId}`;
    } else if (/^[a-zA-Z0-9_-]{6,20}$/.test(rawVideoParam)) {
      cleanVideoId = rawVideoParam;
      cleanVideoUrl = `https://www.youtube.com/watch?v=${cleanVideoId}`;
    } else if (rawVideoParam.startsWith("http")) {
      cleanVideoUrl = rawVideoParam;
    }
  }

  // Also check referrer if it's a YouTube watch URL and no video param was passed
  const cleanReferrer = sanitizeTextValue(input.referrer, 500) || null;
  if (!cleanVideoId && cleanReferrer) {
    const refMatch = cleanReferrer.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,20})/
    );
    if (refMatch && refMatch[1]) {
      cleanVideoId = refMatch[1];
      cleanVideoUrl = cleanReferrer;
    }
  }

  const utmSource = sanitizeTextValue(input.utmSource, 100) || null;
  const utmMedium = sanitizeTextValue(input.utmMedium, 100) || null;
  const utmCampaign = sanitizeTextValue(input.utmCampaign, 150) || null;
  const utmContent = sanitizeTextValue(input.utmContent, 150) || null;
  const utmTerm = sanitizeTextValue(input.utmTerm, 150) || null;
  const landingPage = sanitizeTextValue(input.landingPage, 500) || null;

  // Determine truthful leadSource without fabricating "YouTube" when unknown
  let leadSource = sanitizeTextValue(input.explicitSource, 100);
  if (!leadSource) {
    if (utmSource) {
      leadSource = utmSource;
    } else if (cleanVideoId || (cleanReferrer && /youtube\.com|youtu\.be/i.test(cleanReferrer))) {
      leadSource = "youtube";
    } else if (cleanReferrer) {
      try {
        const refHost = new URL(cleanReferrer).hostname.replace(/^www\./, "");
        leadSource = refHost || "Referral";
      } catch {
        leadSource = "Direct Form";
      }
    } else {
      leadSource = "Direct Form";
    }
  }

  return {
    leadSource,
    videoId: cleanVideoId,
    videoUrl: cleanVideoUrl,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    landingPage,
    referrer: cleanReferrer,
  };
}

/**
 * Ensures the default editable YouTube Lead Form ("youtube-lead") exists in the database.
 */
export async function ensureDefaultYouTubeForm() {
  const existingDefault = await prisma.leadForm.findFirst({
    where: {
      OR: [{ slug: "youtube-lead" }, { isDefault: true }],
    },
    orderBy: { createdAt: "asc" },
  });

  if (existingDefault) {
    try {
      const qList = parseFormQuestions(existingDefault.questionsJson);
      let needsUpdate = false;
      const hasTimeline = qList.some(
        (q) => q.fieldRole === "travelTimeline" || q.id === "q_travel_timeline"
      );
      const hasLocation = qList.some(
        (q) => q.type === "LOCATION" || q.fieldRole === "location"
      );

      const updatedList = [...qList];
      if (!hasLocation) {
        const cityIdx = updatedList.findIndex(
          (q) => q.id === "q_city" || q.fieldRole === "city"
        );
        const locationQuestion: FormQuestion = {
          id: "q_location",
          label: "Your City / Current Location",
          type: "LOCATION",
          required: true,
          placeholder: "Click 'Detect My Location' or type your city/district",
          helperText:
            "Helps us arrange nearest airport departure & regional guidance",
          fieldRole: "location",
        };
        if (cityIdx >= 0) {
          updatedList[cityIdx] = locationQuestion;
        } else {
          updatedList.splice(3, 0, locationQuestion);
        }
        needsUpdate = true;
      }

      if (!hasTimeline) {
        const timelineQuestion: FormQuestion = {
          id: "q_travel_timeline",
          label: "Preferred Travel Timeline",
          type: "RADIO",
          required: true,
          options: [
            "Immediately / As soon as possible",
            "Within 1 month",
            "Within 3 months",
            "Within 6 months",
            "Within 1 year",
            "Flexible / Not decided yet",
          ],
          helperText:
            "Select when you and your family plan to perform the pilgrimage",
          fieldRole: "travelTimeline",
        };
        const interestIdx = updatedList.findIndex(
          (q) => q.fieldRole === "interestedIn"
        );
        if (interestIdx >= 0) {
          updatedList.splice(interestIdx + 1, 0, timelineQuestion);
        } else {
          updatedList.push(timelineQuestion);
        }
        needsUpdate = true;
      }

      if (needsUpdate) {
        const updated = await prisma.leadForm.update({
          where: { id: existingDefault.id },
          data: {
            questionsJson: JSON.stringify(updatedList),
          },
        });
        return updated;
      }
    } catch {
      // ignore
    }
    return existingDefault;
  }

  return prisma.leadForm.create({
    data: {
      slug: "youtube-lead",
      title: "Al-Gafur Hajj & Umrah — Pilgrim Callback & Brochure Form",
      description:
        "Assalamu Alaikum! Fill in your details below to receive complete 2026–2027 Hajj, Umrah & Ramadan package pricing, Makkah & Madinah hotel details, and a personal callback from our advisor.",
      campaignName: "YouTube General Enquiries",
      successTitle: "Jazakallah Khair! Your Enquiry Has Been Received.",
      successMessage:
        "Our Hajj & Umrah specialist will contact you shortly on your mobile/WhatsApp number with complete package & hotel details.",
      submitButtonText: "Request Callback & Package Details",
      showLogo: true,
      status: "PUBLISHED",
      isActive: true,
      isDefault: true,
      version: 1,
      questionsJson: JSON.stringify(DEFAULT_YOUTUBE_FORM_QUESTIONS),
      settingsJson: JSON.stringify({
        themeAccent: "emerald",
        notifyOnSubmission: true,
        enableWhatsAppQuickReply: true,
      } satisfies FormSettingsConfig),
    },
  });
}
