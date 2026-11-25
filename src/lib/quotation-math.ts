export type RoomSharingType = "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
export type DiscountType = "FLAT" | "PERCENT";

export interface QuotationCalcInput {
  roomType?: string;
  adultCount?: number;
  adultUnitPrice?: number;
  childWithBedCount?: number;
  childWithBedPrice?: number;
  childNoBedCount?: number;
  childNoBedPrice?: number;
  infantCount?: number;
  infantPrice?: number;
  discountType?: string;
  discountValue?: number;
  taxPercent?: number;
  additionalCharges?: number;
  advanceRequired?: number;
}

export interface QuotationLineItem {
  key: "ADULT" | "CHILD_WITH_BED" | "CHILD_NO_BED" | "INFANT";
  label: string;
  occupancy?: string;
  count: number;
  unitPrice: number;
  amount: number;
}

export interface QuotationLineItemsSnapshot {
  version: number;
  roomType: string;
  items: QuotationLineItem[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  discountReason?: string | null;
  taxPercent: number;
  gstAmount: number;
  additionalCharges: number;
  additionalChargesNote?: string | null;
  total: number;
  advanceRequired: number;
  balanceAmount: number;
}

export function safeNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function computeQuotationTotals(input: QuotationCalcInput & {
  discountReason?: string | null;
  additionalChargesNote?: string | null;
}) {
  const roomType = (input.roomType || "QUAD").toUpperCase();
  const adultCount = Math.max(0, Math.floor(safeNum(input.adultCount, 1)));
  const adultUnitPrice = safeNum(input.adultUnitPrice, 0);

  const childWithBedCount = Math.max(0, Math.floor(safeNum(input.childWithBedCount, 0)));
  const childWithBedPrice = safeNum(input.childWithBedPrice, 0);

  const childNoBedCount = Math.max(0, Math.floor(safeNum(input.childNoBedCount, 0)));
  const childNoBedPrice = safeNum(input.childNoBedPrice, 0);

  const infantCount = Math.max(0, Math.floor(safeNum(input.infantCount, 0)));
  const infantPrice = safeNum(input.infantPrice, 0);

  const adultTotal = Math.round(adultCount * adultUnitPrice);
  const childWithBedTotal = Math.round(childWithBedCount * childWithBedPrice);
  const childNoBedTotal = Math.round(childNoBedCount * childNoBedPrice);
  const infantTotal = Math.round(infantCount * infantPrice);

  const travellersCount = Math.max(
    1,
    adultCount + childWithBedCount + childNoBedCount + infantCount
  );

  const subtotal = adultTotal + childWithBedTotal + childNoBedTotal + infantTotal;

  const discountType: DiscountType =
    String(input.discountType || "FLAT").toUpperCase() === "PERCENT" ? "PERCENT" : "FLAT";
  const rawDiscountValue = safeNum(input.discountValue, 0);

  const rawDiscountAmount =
    discountType === "PERCENT"
      ? Math.round((subtotal * Math.min(100, rawDiscountValue)) / 100)
      : Math.round(rawDiscountValue);

  const discountAmount = Math.min(subtotal, Math.max(0, rawDiscountAmount));
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);

  const taxPercent = Math.min(100, safeNum(input.taxPercent, 0));
  const gstAmount = Math.round((taxableSubtotal * taxPercent) / 100);
  const additionalCharges = Math.round(safeNum(input.additionalCharges, 0));

  const total = Math.max(0, taxableSubtotal + gstAmount + additionalCharges);
  const advanceRequired = Math.min(total, Math.round(safeNum(input.advanceRequired, 0)));
  const balanceAmount = Math.max(0, total - advanceRequired);

  const items: QuotationLineItem[] = [
    {
      key: "ADULT",
      label: `Adults (${roomType} Sharing)`,
      occupancy: roomType,
      count: adultCount,
      unitPrice: adultUnitPrice,
      amount: adultTotal,
    },
    ...(childWithBedCount > 0
      ? [
          {
            key: "CHILD_WITH_BED" as const,
            label: "Child with Bed (2–11 yrs)",
            occupancy: "With Bed",
            count: childWithBedCount,
            unitPrice: childWithBedPrice,
            amount: childWithBedTotal,
          },
        ]
      : []),
    ...(childNoBedCount > 0
      ? [
          {
            key: "CHILD_NO_BED" as const,
            label: "Child without Bed (2–11 yrs)",
            occupancy: "No Bed",
            count: childNoBedCount,
            unitPrice: childNoBedPrice,
            amount: childNoBedTotal,
          },
        ]
      : []),
    ...(infantCount > 0
      ? [
          {
            key: "INFANT" as const,
            label: "Infant (0–2 yrs)",
            occupancy: "Infant",
            count: infantCount,
            unitPrice: infantPrice,
            amount: infantTotal,
          },
        ]
      : []),
  ];

  const lineItemsJson: QuotationLineItemsSnapshot = {
    version: 1,
    roomType,
    items,
    subtotal,
    discountType,
    discountValue: rawDiscountValue,
    discountAmount,
    discountReason: input.discountReason || null,
    taxPercent,
    gstAmount,
    additionalCharges,
    additionalChargesNote: input.additionalChargesNote || null,
    total,
    advanceRequired,
    balanceAmount,
  };

  return {
    roomType,
    travellersCount,
    adultCount,
    adultUnitPrice,
    adultTotal,
    childWithBedCount,
    childWithBedPrice,
    childWithBedTotal,
    childNoBedCount,
    childNoBedPrice,
    childNoBedTotal,
    infantCount,
    infantPrice,
    infantTotal,
    subtotal,
    discountType,
    discountValue: rawDiscountValue,
    discountAmount,
    taxPercent,
    gstAmount,
    additionalCharges,
    total,
    advanceRequired,
    balanceAmount,
    lineItemsJson,
  };
}

export function buildQuotationWhatsAppMessage(q: {
  quotationNumber: string;
  customerName?: string | null;
  customer?: { name?: string | null } | null;
  lead?: { name?: string | null } | null;
  package?: { name?: string | null; durationDays?: number | null } | null;
  roomType?: string | null;
  adultCount?: number | null;
  childWithBedCount?: number | null;
  childNoBedCount?: number | null;
  infantCount?: number | null;
  travellersCount?: number | null;
  subtotal?: number | null;
  discountAmount?: number | null;
  discount?: number | null;
  discountReason?: string | null;
  gstAmount?: number | null;
  tax?: number | null;
  additionalCharges?: number | null;
  total: number;
  advanceRequired?: number | null;
  departureDate?: string | null;
  departureCity?: string | null;
  validUntil?: string | Date | null;
}): string {
  const clientName =
    q.customerName || q.customer?.name || q.lead?.name || "Respected Pilgrim";
  const pkgName = q.package?.name || "Hajj / Umrah Package";

  const adults = q.adultCount || q.travellersCount || 1;
  const cwb = q.childWithBedCount || 0;
  const cnb = q.childNoBedCount || 0;
  const inf = q.infantCount || 0;

  const paxParts = [`${adults} Adult${adults > 1 ? "s" : ""} (${q.roomType || "QUAD"})`];
  if (cwb > 0) paxParts.push(`${cwb} Child w/ Bed`);
  if (cnb > 0) paxParts.push(`${cnb} Child No Bed`);
  if (inf > 0) paxParts.push(`${inf} Infant`);

  const disc = q.discountAmount ?? q.discount ?? 0;
  const gst = q.gstAmount ?? q.tax ?? 0;
  const addChg = q.additionalCharges ?? 0;

  const lines = [
    `Assalamu Alaikum ${clientName},`,
    `Here is your official tour quotation from *AL GAFUR INTERNATIONAL TOURS AND TRAVELS*.`,
    ``,
    `*Quote Ref:* ${q.quotationNumber}`,
    `*Package:* ${pkgName}${q.package?.durationDays ? ` (${q.package.durationDays} Days)` : ""}`,
    q.departureDate ? `*Travel Date:* ${q.departureDate}` : null,
    q.departureCity ? `*Departure City:* ${q.departureCity}` : null,
    `*Passengers:* ${paxParts.join(", ")}`,
    ``,
    q.subtotal ? `Subtotal: ₹${Number(q.subtotal).toLocaleString("en-IN")}` : null,
    disc > 0
      ? `Discount${q.discountReason ? ` (${q.discountReason})` : ""}: -₹${Number(disc).toLocaleString("en-IN")}`
      : null,
    gst > 0 ? `GST / Tax: +₹${Number(gst).toLocaleString("en-IN")}` : null,
    addChg > 0 ? `Add-on Services: +₹${Number(addChg).toLocaleString("en-IN")}` : null,
    `*Grand Total Payable:* ₹${Number(q.total).toLocaleString("en-IN")}`,
    q.advanceRequired && q.advanceRequired > 0
      ? `*Token Advance to Confirm:* ₹${Number(q.advanceRequired).toLocaleString("en-IN")}`
      : null,
    q.validUntil
      ? `*Valid Until:* ${new Date(q.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
      : null,
    ``,
    `Please reply here or call us to confirm your seats!`,
  ].filter(Boolean);

  return lines.join("\n");
}
