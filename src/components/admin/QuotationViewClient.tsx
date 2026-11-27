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
  Receipt,
  Loader2,
} from "lucide-react";
import {
  buildQuotationWhatsAppMessage,
  QuotationLineItemsSnapshot,
} from "@/lib/quotation-math";
import AlGafurDocumentTemplate, {
  DocumentQuotationRow,
} from "@/components/print/AlGafurDocumentTemplate";

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
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
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
    quotation.customerWhatsapp || quotation.customer?.whatsapp || clientPhone;
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

  const rawItems = snapshot?.items?.length
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

  const quotationRows: DocumentQuotationRow[] = rawItems.map((item, idx) => ({
    srNo: idx + 1,
    description: item.label,
    occupancy: item.occupancy,
    count: item.count,
    rate: item.unitPrice,
    amount: item.amount,
  }));

  const discountAmt = quotation.discountAmount || quotation.discount || 0;
  const gstAmt = quotation.gstAmount || quotation.tax || 0;
  const addChargesAmt = quotation.additionalCharges || 0;

  const whatsappText = buildQuotationWhatsAppMessage(quotation);
  const cleanWaPhone = clientWhatsapp.replace(/[^0-9]/g, "");
  const whatsappHref = cleanWaPhone
    ? `https://wa.me/${
        cleanWaPhone.length === 10 ? `91${cleanWaPhone}` : cleanWaPhone
      }?text=${encodeURIComponent(whatsappText)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const res = await fetch(
        `/api/admin/quotations/${quotation.id}/convert-to-invoice`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not generate invoice.");
      }
      router.push(`/admin/invoices/${data.invoice.id}`);
    } catch (err: any) {
      alert(err.message || "Error generating invoice.");
    } finally {
      setGeneratingInvoice(false);
    }
  };

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

  const staySplit =
    quotation.package?.makkahNights || quotation.package?.madinahNights
      ? `${quotation.package?.makkahNights || 0}N Makkah / ${
          quotation.package?.madinahNights || 0
        }N Madinah`
      : null;

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-16">
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
            <p className="text-xs text-slate-500">
              Official AL-GAFUR Quotation Proposal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/quotations/${quotation.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 text-xs font-bold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Download PDF
          </button>

          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={generatingInvoice}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A2240] hover:bg-[#10305a] text-[#F3D57F] text-xs font-bold shadow-xs disabled:opacity-50"
          >
            {generatingInvoice ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Receipt className="w-3.5 h-3.5" />
            )}
            Generate Invoice / Receipt
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>

          {quotation.status !== "ACCEPTED" && !convertSuccess ? (
            <button
              type="button"
              onClick={handleConvertToBooking}
              disabled={converting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest-950 hover:bg-forest-900 text-gold-300 text-xs font-bold disabled:opacity-50"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {convertSuccess ? `Booked (${convertSuccess})` : "Booked"}
            </Link>
          )}
        </div>
      </div>

      {/* Branded Printable Official AL-GAFUR Quotation Sheet */}
      <AlGafurDocumentTemplate
        mode="QUOTATION"
        documentNumber={quotation.quotationNumber}
        dateLabel={new Date(quotation.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
        validUntilLabel={
          quotation.validUntil
            ? new Date(quotation.validUntil).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : null
        }
        customerName={clientName}
        customerPhone={clientPhone}
        customerCity={clientCity}
        packageName={quotation.package?.name || "Umrah Package"}
        staySplit={staySplit}
        airlines={quotation.package?.airline || "Saudi / Air India"}
        departure={
          quotation.departureCity ||
          quotation.package?.departureCity ||
          "Mumbai (BOM)"
        }
        arrival={quotation.package?.arrivalAirport || "Jeddah (JED) / Madinah"}
        days={quotation.package?.durationDays || 15}
        paymentMode="BANK_TRANSFER"
        quotationRows={quotationRows}
        subtotal={quotation.subtotal}
        discountAmount={discountAmt}
        discountReason={quotation.discountReason}
        gstAmount={gstAmt}
        additionalCharges={addChargesAmt}
        additionalChargesNote={quotation.additionalChargesNote}
        totalBillAmount={quotation.total}
        advanceAmount={quotation.advanceRequired || 0}
        remainingAmount={quotation.balanceAmount ?? quotation.total}
        specialNotes={quotation.specialNotes}
        terms={quotation.terms}
        siteSettings={siteSettings}
      />
    </div>
  );
}
