"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Printer,
  MessageCircle,
  CheckCircle2,
  Building2,
  Plane,
  Utensils,
  Sparkles,
  Calendar,
  MapPin,
  CreditCard,
  Loader2,
  CheckCircle,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import {
  buildQuotationWhatsAppMessage,
  QuotationLineItemsSnapshot,
} from "@/lib/quotation-math";

interface QuotationViewClientProps {
  quotation: any;
  siteSettings?: Record<string, string>;
}

export default function QuotationViewClient({
  quotation,
  siteSettings = {},
}: QuotationViewClientProps) {
  const router = useRouter();
  const [converting, setConverting] = useState(false);
  const [convertSuccess, setConvertSuccess] = useState<string | null>(null);

  const clientName =
    quotation.customerName ||
    quotation.customer?.name ||
    quotation.lead?.name ||
    "Respected Pilgrim";
  const clientPhone =
    quotation.customerPhone ||
    quotation.customer?.phone ||
    quotation.lead?.mobile ||
    "";
  const clientWhatsapp =
    quotation.customerWhatsapp ||
    quotation.customer?.whatsapp ||
    clientPhone;
  const clientEmail =
    quotation.customerEmail ||
    quotation.customer?.email ||
    quotation.lead?.email ||
    "";
  const clientCity =
    quotation.customerCity ||
    quotation.customer?.city ||
    quotation.lead?.city ||
    "";

  const snapshot = quotation.lineItemsJson as QuotationLineItemsSnapshot | null;

  const adultCount = quotation.adultCount || quotation.travellersCount || 1;
  const adultUnitPrice =
    quotation.adultUnitPrice > 0
      ? quotation.adultUnitPrice
      : Math.round(quotation.subtotal / Math.max(1, adultCount));

  const items = snapshot?.items?.length
    ? snapshot.items
    : [
        {
          key: "ADULT",
          label: `Adults (${quotation.roomType || "QUAD"} Sharing)`,
          occupancy: quotation.roomType || "QUAD",
          count: adultCount,
          unitPrice: adultUnitPrice,
          amount: adultCount * adultUnitPrice,
        },
        ...(quotation.childWithBedCount > 0
          ? [
              {
                key: "CHILD_WITH_BED",
                label: "Child with Bed (2–11 yrs)",
                occupancy: "With Bed",
                count: quotation.childWithBedCount,
                unitPrice: quotation.childWithBedPrice || 0,
                amount: quotation.childWithBedCount * (quotation.childWithBedPrice || 0),
              },
            ]
          : []),
        ...(quotation.childNoBedCount > 0
          ? [
              {
                key: "CHILD_NO_BED",
                label: "Child without Bed (2–11 yrs)",
                occupancy: "No Bed",
                count: quotation.childNoBedCount,
                unitPrice: quotation.childNoBedPrice || 0,
                amount: quotation.childNoBedCount * (quotation.childNoBedPrice || 0),
              },
            ]
          : []),
        ...(quotation.infantCount > 0
          ? [
              {
                key: "INFANT",
                label: "Infant (0–2 yrs)",
                occupancy: "Infant",
                count: quotation.infantCount,
                unitPrice: quotation.infantPrice || 0,
                amount: quotation.infantCount * (quotation.infantPrice || 0),
              },
            ]
          : []),
      ];

  const discountAmt = quotation.discountAmount || quotation.discount || 0;
  const gstAmt = quotation.gstAmount || quotation.tax || 0;
  const addChargesAmt = quotation.additionalCharges || 0;

  const whatsappText = buildQuotationWhatsAppMessage(quotation);
  const cleanWaPhone = clientWhatsapp.replace(/[^0-9]/g, "");
  const whatsappHref = cleanWaPhone
    ? `https://wa.me/${cleanWaPhone.length === 10 ? `91${cleanWaPhone}` : cleanWaPhone}?text=${encodeURIComponent(
        whatsappText
      )}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  const handleConvertToBooking = async () => {
    if (
      !confirm(
        `Convert Quotation ${quotation.quotationNumber} (₹${Number(
          quotation.total
        ).toLocaleString("en-IN")}) directly into a Confirmed Booking?`
      )
    ) {
      return;
    }

    setConverting(true);
    try {
      const res = await fetch(`/api/admin/quotations/${quotation.id}/convert`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Conversion failed");
      }
      setConvertSuccess(data.booking?.bookingNumber || "CONFIRMED");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Could not convert quotation to booking.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/quotations"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-emerald-900">
                {quotation.quotationNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  quotation.status === "ACCEPTED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {quotation.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">Official Hajj &amp; Umrah Quotation Proposal</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/quotations/${quotation.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Quotation
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 text-xs font-bold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Download PDF
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Send on WhatsApp
          </a>

          {quotation.status !== "ACCEPTED" && !convertSuccess ? (
            <button
              type="button"
              onClick={handleConvertToBooking}
              disabled={converting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-950 hover:bg-forest-900 text-gold-300 text-xs font-bold disabled:opacity-50"
            >
              {converting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Convert to Booking
            </button>
          ) : (
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {convertSuccess ? `Booked (${convertSuccess})` : "Converted to Booking"}
            </Link>
          )}
        </div>
      </div>

      {/* Printable Official Quotation Sheet */}
      <div className="print-area bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-slate-900">
        {/* Agency Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-emerald-900/20 pb-5">
          <div className="space-y-1">
            <BrandLogo
              variant="light"
              size="md"
              customLogoUrl={siteSettings.site_logo || siteSettings.header_logo || ""}
            />
            <p className="text-sm font-bold text-forest-950 pt-1">
              {siteSettings.company_name || "AL GAFUR INTERNATIONAL TOURS AND TRAVELS"}
            </p>
            <p className="text-xs text-slate-600 max-w-md">
              {siteSettings.company_address ||
                "Head Office: Pune / Mumbai, Maharashtra, India"}
            </p>
            <p className="text-xs text-slate-600">
              Helpline: <strong>{siteSettings.company_phone_1 || "+91 8793939393"}</strong>
              {siteSettings.company_phone_2 ? ` / ${siteSettings.company_phone_2}` : " / Dr. Mudassir Sayyad"}
              {" | "}
              Email: {siteSettings.company_email || "contact@algafurtours.com"}
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider">
              Official Tour Estimate
            </span>
            <p className="font-mono font-bold text-lg text-emerald-950 pt-1">
              {quotation.quotationNumber}
            </p>
            <p className="text-xs text-slate-600">
              Issue Date:{" "}
              <strong>
                {new Date(quotation.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </strong>
            </p>
            {quotation.validUntil && (
              <p className="text-xs text-rose-700 font-semibold">
                Valid Until:{" "}
                {new Date(quotation.validUntil).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Pilgrim & Trip Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Quotation Prepared For
            </p>
            <p className="text-base font-bold text-slate-900">{clientName}</p>
            {clientPhone && (
              <p className="text-slate-700">
                Mobile / WhatsApp: <strong>{clientPhone}</strong>
              </p>
            )}
            {clientEmail && <p className="text-slate-600">Email: {clientEmail}</p>}
            {clientCity && <p className="text-slate-600">City: {clientCity}</p>}
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Tour &amp; Departure Snapshot
            </p>
            <p className="text-base font-bold text-emerald-900">
              {quotation.package?.name}
            </p>
            <p className="text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                <strong>{quotation.package?.durationDays} Days</strong> &bull; Travel:{" "}
                {quotation.departureDate || quotation.package?.departureDate || "Upcoming Group"}
              </span>
            </p>
            <p className="text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                Departure City:{" "}
                <strong>
                  {quotation.departureCity || quotation.package?.departureCity || "Mumbai (BOM)"}
                </strong>
              </span>
            </p>
          </div>
        </div>

        {/* Hotels, Flight & Meal Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="border border-slate-200 rounded-xl p-3.5 bg-ivory-50/50 space-y-1">
            <p className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Makkah Hotel ({quotation.package?.makkahNights || 8} Nights)
            </p>
            <p className="font-semibold text-slate-900">
              {quotation.package?.makkahHotelName || "Diyafa Jamal or similar"}
            </p>
            <p className="text-slate-600 text-[11px]">
              Distance: {quotation.package?.makkahDistance || "500m walking"}
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-3.5 bg-ivory-50/50 space-y-1">
            <p className="font-bold text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Madinah Hotel ({quotation.package?.madinahNights || 7} Nights)
            </p>
            <p className="font-semibold text-slate-900">
              {quotation.package?.madinahHotelName || "Ilaf Kuba or similar"}
            </p>
            <p className="text-slate-600 text-[11px]">
              Distance: {quotation.package?.madinahDistance || "400m walking"}
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-3.5 bg-ivory-50/50 space-y-1">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-emerald-700" />
              Flight &amp; Meals
            </p>
            <p className="font-semibold text-slate-900">
              {quotation.package?.airline || "Saudi / Air India"} (
              {quotation.package?.flightType || "DIRECT"})
            </p>
            <p className="text-slate-600 text-[11px] flex items-center gap-1">
              <Utensils className="w-3 h-3 text-emerald-700" />
              {quotation.package?.makkahMealPlan || "Indian Buffet Meals (3x Daily)"}
            </p>
          </div>
        </div>

        {/* Itemized Cost Breakdown Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-emerald-900 text-white font-semibold">
              <tr>
                <th className="px-4 py-3">Passenger / Service Description</th>
                <th className="px-4 py-3">Occupancy / Type</th>
                <th className="px-4 py-3 text-center">Pax</th>
                <th className="px-4 py-3 text-right">Rate / Pax (₹)</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-semibold">{item.label}</td>
                  <td className="px-4 py-3 text-slate-600">{item.occupancy || "-"}</td>
                  <td className="px-4 py-3 text-center font-bold">{item.count}</td>
                  <td className="px-4 py-3 text-right">
                    ₹{Number(item.unitPrice).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ₹{Number(item.amount).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}

              <tr className="bg-slate-50 font-semibold">
                <td colSpan={4} className="px-4 py-2.5 text-right text-slate-700">
                  Passenger Subtotal ({quotation.travellersCount} Travellers):
                </td>
                <td className="px-4 py-2.5 text-right text-slate-900">
                  ₹{Number(quotation.subtotal).toLocaleString("en-IN")}
                </td>
              </tr>

              {discountAmt > 0 && (
                <tr className="bg-emerald-50 text-emerald-800 font-semibold">
                  <td colSpan={4} className="px-4 py-2.5 text-right">
                    Discount
                    {quotation.discountReason ? ` (${quotation.discountReason})` : ""}
                    {quotation.discountType === "PERCENT" && quotation.discountValue > 0
                      ? ` [${quotation.discountValue}%]`
                      : ""}
                    :
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold">
                    -₹{Number(discountAmt).toLocaleString("en-IN")}
                  </td>
                </tr>
              )}

              {gstAmt > 0 && (
                <tr className="text-slate-700">
                  <td colSpan={4} className="px-4 py-2 text-right">
                    GST / Tour Compliance Tax
                    {quotation.taxPercent > 0 ? ` (${quotation.taxPercent}%)` : ""}:
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    +₹{Number(gstAmt).toLocaleString("en-IN")}
                  </td>
                </tr>
              )}

              {addChargesAmt > 0 && (
                <tr className="text-slate-700">
                  <td colSpan={4} className="px-4 py-2 text-right">
                    Additional Services
                    {quotation.additionalChargesNote
                      ? ` (${quotation.additionalChargesNote})`
                      : ""}
                    :
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    +₹{Number(addChargesAmt).toLocaleString("en-IN")}
                  </td>
                </tr>
              )}

              <tr className="bg-emerald-950 text-white font-bold text-sm">
                <td colSpan={4} className="px-4 py-3.5 text-right uppercase tracking-wider text-xs text-gold-300">
                  Grand Total Payable:
                </td>
                <td className="px-4 py-3.5 text-right text-lg text-white">
                  ₹{Number(quotation.total).toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Schedule & Agency Bank Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-1.5">
            <p className="font-bold text-amber-950 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Payment Schedule
            </p>
            <div className="flex justify-between">
              <span className="text-amber-900">Token Advance to Confirm:</span>
              <span className="font-bold text-amber-950">
                ₹{Number(quotation.advanceRequired || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-900">Balance Payable:</span>
              <span className="font-bold text-amber-950">
                ₹{Number(quotation.balanceAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
            {quotation.balanceDueDate && (
              <div className="flex justify-between">
                <span className="text-amber-900">Balance Due By:</span>
                <span className="font-semibold text-amber-950">
                  {new Date(quotation.balanceDueDate).toLocaleDateString("en-IN")}
                </span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
              Agency Bank &amp; UPI Details
            </p>
            <p className="text-slate-700">
              Account Name:{" "}
              <strong>
                {siteSettings.bank_account_name || "AL GAFUR INTERNATIONAL TOURS AND TRAVELS"}
              </strong>
            </p>
            <p className="text-slate-600">
              Bank / UPI:{" "}
              {siteSettings.bank_details ||
                "Contact accounts desk (+91 8793939393) for official NEFT / RTGS / UPI QR."}
            </p>
          </div>
        </div>

        {/* Special Notes & Inclusions */}
        {quotation.specialNotes && (
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 text-xs text-slate-800">
            <span className="font-bold text-emerald-900">Special Requests / Notes: </span>
            {quotation.specialNotes}
          </div>
        )}

        {/* Footer Terms & Signature */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-md text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              Terms &amp; Validity:
            </p>
            <p>{quotation.terms || "Prices subject to flight fare and visa slot availability."}</p>
          </div>
          <div className="text-center sm:text-right">
            <div className="w-40 border-b border-slate-400 mb-1 sm:ml-auto"></div>
            <p className="text-xs font-bold text-slate-800">Authorized Signatory</p>
            <p className="text-[10px] text-slate-500">
              AL GAFUR INTERNATIONAL TOURS AND TRAVELS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
