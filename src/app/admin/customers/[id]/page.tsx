import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import {
  User,
  Phone,
  MessageCircle,
  FileText,
  Calendar,
  ShieldCheck,
  Building,
  CreditCard,
  ArrowLeft,
  Users,
} from "lucide-react";

export const revalidate = 0;

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const customer = await prisma.customer.findUnique({
    where: { id: resolvedParams.id },
    include: {
      familyMembers: true,
      bookings: {
        include: {
          package: true,
          payments: true,
          invoices: true,
          visaApplications: true,
          travellers: true,
        },
        orderBy: { createdAt: "desc" },
      },
      documents: true,
      visaApplications: true,
    },
  });

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
        <span className="font-mono text-xs font-bold text-gold-400">
          ID: {customer.customerCode}
        </span>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Personal Info (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-12 h-12 rounded-full bg-forest-900 text-gold-300 font-bold flex items-center justify-center text-sm">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-white">{customer.name}</h2>
              <span className="text-[11px] text-slate-400">{customer.city || "Pune"}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="font-semibold text-white">{customer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">WhatsApp:</span>
              <span>{customer.whatsapp || customer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span>{customer.email || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Passport Number:</span>
              <span className="font-mono text-gold-400 font-bold">
                {customer.passportNumber || "Pending"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nationality:</span>
              <span>{customer.nationality}</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-500 block text-[11px]">Address:</span>
              <p className="text-slate-300 text-[11px] mt-0.5">{customer.address || "N/A"}</p>
            </div>
          </div>

          {/* Family Members List */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Family Dependents ({customer.familyMembers.length})
            </h4>
            <div className="space-y-1.5">
              {customer.familyMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between"
                >
                  <span className="text-white font-medium">{m.name}</span>
                  <span className="text-slate-500 text-[10px]">{m.relationship}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Bookings History & Visas (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Bookings Section */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-serif font-bold text-white">
              Pilgrimage Booking History ({customer.bookings.length})
            </h3>

            <div className="space-y-4">
              {customer.bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="font-mono font-bold text-gold-400 block">{b.bookingNumber}</span>
                      <h4 className="text-sm font-serif font-bold text-white">{b.package.name}</h4>
                    </div>
                    <span className="bg-emerald-950 text-emerald-300 font-bold px-2.5 py-1 rounded text-[10px]">
                      {b.bookingStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Departure</span>
                      <span>{b.package.departureDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Pilgrims</span>
                      <span>{b.adults} Adults, {b.children} Kids</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Total Price</span>
                      <span className="font-bold text-white">₹{b.totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Paid Amount</span>
                      <span className="font-bold text-emerald-400">₹{b.paidAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">
                      Balance: <strong className="text-amber-400">₹{b.outstandingAmount.toLocaleString("en-IN")}</strong>
                    </span>
                    <Link
                      href={`/admin/bookings`}
                      className="text-gold-400 hover:underline font-semibold"
                    >
                      View Booking Logistics →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents & Visas Card */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-serif font-bold text-white">
              Documents &amp; Visas Archive
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customer.documents.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center"
                >
                  <div>
                    <span className="text-white font-semibold block">{d.fileName}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{d.type}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

