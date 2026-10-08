"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Filter,
  Users,
  CreditCard,
  Calendar,
  CheckCircle2,
  Printer,
  FileText,
} from "lucide-react";

interface BookingsListClientProps {
  initialBookings: any[];
}

export default function BookingsListClient({ initialBookings }: BookingsListClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bookings] = useState(initialBookings);

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer.phone.includes(searchTerm) ||
      b.package.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">All Pilgrimage Bookings</h1>
          <p className="text-xs text-slate-400">
            Monitor confirmed reservations, room configurations, and payment clearance status.
          </p>
        </div>

        <Link
          href="/admin/bookings/groups"
          className="inline-flex items-center gap-1.5 bg-forest-900 hover:bg-forest-950 text-gold-300 border border-gold-500/30 font-bold px-4 py-2.5 rounded-xl text-xs"
        >
          <Users className="w-4 h-4" />
          <span>Manage Departure Groups →</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search booking ref, customer, package..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
          >
            <option value="ALL">All Bookings ({bookings.length})</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Departure</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Pilgrims</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/60">
                  <td className="py-3.5 px-4 font-mono font-bold text-gold-400">
                    {b.bookingNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div>{b.customer.name}</div>
                    <span className="text-[10px] text-slate-400">{b.customer.phone}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-[150px] truncate">
                    {b.package.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{b.package.departureDate}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-300">{b.roomType}</td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {b.adults} Adults, {b.children} Kids
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ₹{b.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    ₹{b.paidAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        b.paymentStatus === "PAID"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : b.paymentStatus === "PARTIALLY_PAID"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-red-950 text-red-300 border border-red-800"
                      }`}
                    >
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/invoices?bookingId=${b.id}`}
                      className="text-gold-400 hover:underline font-semibold"
                    >
                      Invoice →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

