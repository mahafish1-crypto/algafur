"use client";

import React from "react";
import { MapPin, Check } from "lucide-react";

export interface DocumentPilgrimRow {
  srNo: number;
  name: string;
  passportNo?: string;
  contactNo?: string;
  amount?: number | string;
}

export interface DocumentQuotationRow {
  srNo: number;
  description: string;
  occupancy?: string;
  count: number;
  rate: number;
  amount: number;
}

export interface AlGafurDocumentProps {
  mode: "QUOTATION" | "INVOICE";
  documentNumber: string;
  dateLabel: string;
  validUntilLabel?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerCity?: string | null;
  packageName: string;
  staySplit?: string | null;
  airlines?: string | null;
  departure?: string | null;
  arrival?: string | null;
  days?: number | string | null;
  paymentMode?: string | null; // "BANK_TRANSFER" | "CASH" | "MIXED"
  pilgrimRows?: DocumentPilgrimRow[];
  quotationRows?: DocumentQuotationRow[];
  subtotal: number;
  discountAmount?: number;
  discountReason?: string | null;
  gstAmount?: number;
  additionalCharges?: number;
  additionalChargesNote?: string | null;
  totalBillAmount: number;
  advanceAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  specialNotes?: string | null;
  terms?: string | null;
  siteSettings?: Record<string, string>;
}

const DEFAULT_OFFICE_ADDRESS =
  "Anand Heights, Opp Bank of Maharashtra, Parner-Supa Road Parner, Dist. Ahilyanagar, Maharashtra (India) 414302";

export default function AlGafurDocumentTemplate({
  mode,
  documentNumber,
  dateLabel,
  validUntilLabel,
  customerName,
  customerPhone,
  customerCity,
  packageName,
  staySplit,
  airlines,
  departure,
  arrival,
  days,
  paymentMode,
  pilgrimRows = [],
  quotationRows = [],
  subtotal,
  discountAmount = 0,
  discountReason,
  gstAmount = 0,
  additionalCharges = 0,
  additionalChargesNote,
  totalBillAmount,
  advanceAmount = 0,
  paidAmount = 0,
  remainingAmount = 0,
  specialNotes,
  terms,
  siteSettings = {},
}: AlGafurDocumentProps) {
  const isInvoice = mode === "INVOICE";

  const isBankSelected =
    paymentMode === "BANK_TRANSFER" || paymentMode === "MIXED";
  const isCashSelected = paymentMode === "CASH" || paymentMode === "MIXED";

  // Ensure minimum 8 clean rows for Invoice / Booking Receipt
  const paddedPilgrims: DocumentPilgrimRow[] = Array.from(
    { length: Math.max(8, pilgrimRows.length) },
    (_, i) =>
      pilgrimRows[i] || {
        srNo: i + 1,
        name: "",
        passportNo: "",
        contactNo: "",
        amount: "",
      }
  );

  const bankAccountName =
    siteSettings.bank_account_name ||
    siteSettings.company_name ||
    "AL GAFUR INTERNATIONAL TOURS AND TRAVELS";
  const bankName = siteSettings.bank_name || "HDFC Bank Limited";
  const bankAccountNumber = siteSettings.bank_account_number || "50200088991234";
  const bankIfsc = siteSettings.bank_ifsc || "HDFC0000123";
  const bankBranch = siteSettings.bank_branch || "Parner Branch, Ahilyanagar";
  const bankUpi = siteSettings.bank_upi || "algafurtours@hdfcbank";

  const officeAddress =
    siteSettings.office_address ||
    siteSettings.company_address ||
    DEFAULT_OFFICE_ADDRESS;

  return (
    <div
      id="printable-document"
      className="print-area relative mx-auto max-w-[820px] overflow-hidden shadow-xl border-2 border-[#C89D3C]"
      style={{
        backgroundColor: "#FAF3E0",
        color: "#0A2240",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      {/* Ornamental Gold Double Inner Border */}
      <div className="m-2 border border-[#C89D3C]/80 relative">
        {/* Corner Filigree Accents */}
        <div className="pointer-events-none absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-[#C89D3C]" />
        <div className="pointer-events-none absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-[#C89D3C]" />
        <div className="pointer-events-none absolute bottom-12 left-0 w-7 h-7 border-b-4 border-l-4 border-[#C89D3C]" />
        <div className="pointer-events-none absolute bottom-12 right-0 w-7 h-7 border-b-4 border-r-4 border-[#C89D3C]" />

        {/* TOP HEADER */}
        <div className="px-6 pt-3 pb-3 text-center space-y-1.5">
          {/* Navy Top Tagline Pill */}
          <div className="flex justify-center">
            <div
              className="px-6 py-1 rounded-full text-[11px] font-semibold tracking-wide text-[#F3D57F] shadow-xs border border-[#C89D3C]/60"
              style={{ backgroundColor: "#0A2240" }}
            >
              एक सफर जिंदगी में तबदीली लानेवाला... इंशाअल्लाह
            </div>
          </div>

          {/* Gold Metallic AL-GAFUR Branding */}
          <div className="pt-1">
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-[0.18em] uppercase"
              style={{
                background: "linear-gradient(180deg, #9A6E18 0%, #E5C158 50%, #8C6214 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "Georgia, serif",
              }}
            >
              AL-GAFUR
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#0A2240] uppercase">
              &mdash; International Tours And Travels &mdash;
            </p>
          </div>

          {/* Document Title with Flanking Gold Lines */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="h-[1.5px] flex-1 max-w-[140px] bg-gradient-to-r from-transparent via-[#C89D3C] to-[#C89D3C]" />
            <h2
              className="text-sm sm:text-base font-extrabold tracking-[0.2em] uppercase px-3 py-0.5 border border-[#C89D3C]/60 rounded"
              style={{ color: "#0A2240", backgroundColor: "#F5E9C9" }}
            >
              {isInvoice ? "BOOKING RECEIPT / INVOICE" : "QUOTATION / ESTIMATE"}
            </h2>
            <div className="h-[1.5px] flex-1 max-w-[140px] bg-gradient-to-l from-transparent via-[#C89D3C] to-[#C89D3C]" />
          </div>
        </div>

        {/* META & PAYMENT MODE BLOCK */}
        <div
          className="mx-5 mb-3 rounded-lg border border-[#C89D3C] px-4 py-3 text-xs"
          style={{ backgroundColor: "#FDF9EE", fontFamily: "system-ui, sans-serif" }}
        >
          <div className="flex items-center justify-between border-b border-[#C89D3C]/40 pb-1.5 mb-2">
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-[#0A2240]">
              {isInvoice ? "Booking Details" : "Quotation Details"}
            </span>
            <span className="font-mono font-bold text-xs text-[#0A2240]">
              {isInvoice ? "Receipt / Invoice No:" : "Quote Ref:"}{" "}
              <span className="text-[#8C6214]">{documentNumber}</span>
            </span>
          </div>

          <div className="grid grid-cols-12 gap-x-4 gap-y-1.5 text-[11.5px]">
            {/* Left Column */}
            <div className="col-span-7 space-y-1">
              <div className="flex gap-2">
                <span className="font-bold text-[#0A2240] w-28 shrink-0">
                  {isInvoice ? "Booking Date :" : "Quote Date :"}
                </span>
                <span className="text-slate-800 font-medium">
                  {dateLabel}
                  {!isInvoice && validUntilLabel ? ` (Valid Until: ${validUntilLabel})` : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-[#0A2240] w-28 shrink-0">
                  Pilgrim / Client :
                </span>
                <span className="text-slate-900 font-bold">
                  {customerName}
                  {customerPhone ? ` (${customerPhone})` : ""}
                  {customerCity ? ` — ${customerCity}` : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-[#0A2240] w-28 shrink-0">Package :</span>
                <span className="text-slate-900 font-semibold">
                  {packageName}
                  {staySplit ? ` (${staySplit})` : ""}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-[#0A2240] w-28 shrink-0">Airlines :</span>
                <span className="text-slate-800">{airlines || "Saudi / Air India (Direct)"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-[#0A2240] w-28 shrink-0">
                  Departure / Arr :
                </span>
                <span className="text-slate-800">
                  {departure || "Mumbai (BOM)"} &rarr; {arrival || "Jeddah / Madinah"}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-5 space-y-1.5 border-l border-[#C89D3C]/40 pl-3">
              <div className="flex justify-between">
                <span className="font-bold text-[#0A2240]">Total Days :</span>
                <span className="font-extrabold text-[#0A2240]">
                  {days ? `${days} Days` : "15 Days"}
                </span>
              </div>

              <div className="pt-1">
                <span className="font-bold text-[#0A2240] block mb-1">
                  Payment Mode :
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-xs border border-[#0A2240] flex items-center justify-center bg-white"
                    >
                      {isBankSelected && <Check className="w-3 h-3 text-[#0A2240] stroke-[3]" />}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-800">
                      Bank Account Transfer
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-xs border border-[#0A2240] flex items-center justify-center bg-white"
                    >
                      {isCashSelected && <Check className="w-3 h-3 text-[#0A2240] stroke-[3]" />}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-800">Cash</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STRUCTURED DATA TABLE */}
        <div className="mx-5 mb-3 overflow-hidden rounded-lg border border-[#0A2240]">
          {isInvoice ? (
            <table
              className="w-full text-[11.5px] border-collapse"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              <thead>
                <tr style={{ backgroundColor: "#0A2240", color: "#FFFFFF" }}>
                  <th className="py-2 px-2.5 text-center border-r border-[#C89D3C]/40 w-14">
                    Sr. No.
                  </th>
                  <th className="py-2 px-3 text-left border-r border-[#C89D3C]/40">
                    Name of Haji (Pilgrim)
                  </th>
                  <th className="py-2 px-3 text-center border-r border-[#C89D3C]/40 w-32">
                    Passport No
                  </th>
                  <th className="py-2 px-3 text-center border-r border-[#C89D3C]/40 w-32">
                    Contact No
                  </th>
                  <th className="py-2 px-3 text-right w-28">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {paddedPilgrims.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-[#C89D3C]/50"
                    style={{ backgroundColor: idx % 2 === 0 ? "#FDF9EE" : "#FAF3E0" }}
                  >
                    <td className="py-1.5 px-2.5 text-center font-semibold border-r border-[#C89D3C]/40 h-7">
                      {row.srNo}
                    </td>
                    <td className="py-1.5 px-3 font-semibold text-[#0A2240] border-r border-[#C89D3C]/40">
                      {row.name}
                    </td>
                    <td className="py-1.5 px-3 text-center font-mono text-slate-800 border-r border-[#C89D3C]/40">
                      {row.passportNo || ""}
                    </td>
                    <td className="py-1.5 px-3 text-center font-mono text-slate-800 border-r border-[#C89D3C]/40">
                      {row.contactNo || ""}
                    </td>
                    <td className="py-1.5 px-3 text-right font-semibold text-[#0A2240]">
                      {row.amount !== "" && row.amount !== undefined && Number(row.amount) > 0
                        ? `₹${Number(row.amount).toLocaleString("en-IN")}`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table
              className="w-full text-[11.5px] border-collapse"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              <thead>
                <tr style={{ backgroundColor: "#0A2240", color: "#FFFFFF" }}>
                  <th className="py-2 px-2.5 text-center border-r border-[#C89D3C]/40 w-14">
                    Sr. No.
                  </th>
                  <th className="py-2 px-3 text-left border-r border-[#C89D3C]/40">
                    Particulars / Pilgrim Category
                  </th>
                  <th className="py-2 px-3 text-center border-r border-[#C89D3C]/40 w-24">
                    Pax Count
                  </th>
                  <th className="py-2 px-3 text-right border-r border-[#C89D3C]/40 w-28">
                    Rate (₹)
                  </th>
                  <th className="py-2 px-3 text-right w-32">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {quotationRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-[#C89D3C]/50"
                    style={{ backgroundColor: idx % 2 === 0 ? "#FDF9EE" : "#FAF3E0" }}
                  >
                    <td className="py-2 px-2.5 text-center font-semibold border-r border-[#C89D3C]/40">
                      {row.srNo}
                    </td>
                    <td className="py-2 px-3 font-semibold text-[#0A2240] border-r border-[#C89D3C]/40">
                      {row.description}
                      {row.occupancy ? (
                        <span className="ml-1.5 text-[10px] font-normal text-slate-600">
                          ({row.occupancy})
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 px-3 text-center font-bold border-r border-[#C89D3C]/40">
                      {row.count}
                    </td>
                    <td className="py-2 px-3 text-right border-r border-[#C89D3C]/40">
                      ₹{Number(row.rate).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-[#0A2240]">
                      ₹{Number(row.amount).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* FINANCIAL SUMMARY + BANKING BOX + SIGNATURE FOOTER */}
        <div
          className="mx-5 mb-4 grid grid-cols-12 gap-3 items-stretch text-[11px]"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {/* Left Financial Totals */}
          <div
            className="col-span-5 rounded-lg border border-[#C89D3C] p-3 flex flex-col justify-between space-y-1.5"
            style={{ backgroundColor: "#FDF9EE" }}
          >
            <div className="space-y-1">
              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-slate-700">
                    <span>Gross Subtotal :</span>
                    <span className="font-semibold">
                      ₹{Number(subtotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>
                      Discount{discountReason ? ` (${discountReason})` : ""} :
                    </span>
                    <span>-₹{Number(discountAmount).toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}
              {gstAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>GST / Compliance Tax :</span>
                  <span className="font-semibold">
                    +₹{Number(gstAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {additionalCharges > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>
                    Add-on{additionalChargesNote ? ` (${additionalChargesNote})` : ""} :
                  </span>
                  <span className="font-semibold">
                    +₹{Number(additionalCharges).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-[#C89D3C]/40 font-extrabold text-xs text-[#0A2240]">
                <span>Total Bill Amount :</span>
                <span>₹{Number(totalBillAmount).toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-slate-800">
                <span className="font-semibold">
                  {isInvoice ? "Advance Amount :" : "Token Advance Req. :"}
                </span>
                <span className="font-bold">
                  ₹{Number(advanceAmount).toLocaleString("en-IN")}
                </span>
              </div>

              {isInvoice && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Paid Amount :</span>
                  <span>₹{Number(paidAmount).toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-[#C89D3C]/40 font-extrabold text-xs text-rose-800">
                <span>Remaining Amount :</span>
                <span>₹{Number(remainingAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Center Agency Banking Box */}
          <div
            className="col-span-4 rounded-lg border border-[#C89D3C] p-3 space-y-1 text-[10px]"
            style={{ backgroundColor: "#FDF9EE" }}
          >
            <p className="font-extrabold uppercase tracking-wider text-[#0A2240] border-b border-[#C89D3C]/40 pb-1">
              Official Bank Details
            </p>
            <p className="font-bold text-[#0A2240] leading-tight">{bankAccountName}</p>
            <p className="text-slate-700">
              <strong>Bank:</strong> {bankName}
            </p>
            <p className="text-slate-700 font-mono">
              <strong>A/C:</strong> {bankAccountNumber}
            </p>
            <p className="text-slate-700 font-mono">
              <strong>IFSC:</strong> {bankIfsc}
            </p>
            <p className="text-slate-700">
              <strong>Branch:</strong> {bankBranch}
            </p>
            <p className="text-slate-800 font-mono">
              <strong>UPI:</strong> {bankUpi}
            </p>
          </div>

          {/* Right Signature Block */}
          <div className="col-span-3 flex flex-col justify-between items-center text-center p-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C6214] border border-[#C89D3C]/70 rounded-full px-2.5 py-0.5 bg-[#F5E9C9]">
              AL-GAFUR
            </div>
            <div className="w-full pt-5">
              <div className="border-b border-[#0A2240] mb-1" />
              <p className="text-[10px] text-slate-600">Authorised Signature</p>
              <p className="text-[10.5px] font-extrabold text-[#0A2240] leading-tight mt-0.5">
                DR. MUDASSEER RAFIK SAYYED
              </p>
              <p className="text-[11px] font-extrabold font-mono text-[#8C6214]">
                8793939393
              </p>
            </div>
          </div>
        </div>

        {/* Optional Notes & Terms Line */}
        {(specialNotes || terms) && (
          <div
            className="mx-5 mb-3 px-3 py-1.5 rounded border border-[#C89D3C]/40 text-[10px] text-slate-700"
            style={{ backgroundColor: "#FDF9EE", fontFamily: "system-ui, sans-serif" }}
          >
            {specialNotes && (
              <p>
                <strong>Notes:</strong> {specialNotes}
              </p>
            )}
            {terms && (
              <p>
                <strong>Terms:</strong> {terms}
              </p>
            )}
          </div>
        )}

        {/* BOTTOM NAVY CURVED ADDRESS BAR */}
        <div
          className="px-6 py-2.5 text-center text-white flex items-center justify-center gap-2 rounded-t-2xl mx-2"
          style={{ backgroundColor: "#0A2240", fontFamily: "system-ui, sans-serif" }}
        >
          <MapPin className="w-3.5 h-3.5 text-[#F3D57F] shrink-0" />
          <span className="text-[10.5px] font-medium tracking-wide text-[#FAF3E0]">
            {officeAddress}
          </span>
        </div>
      </div>
    </div>
  );
}
