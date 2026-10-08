"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  FileText,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  User,
} from "lucide-react";

interface CustomersClientProps {
  initialCustomers: any[];
}

export default function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers] = useState(initialCustomers);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Pilgrim Customer Base</h1>
          <p className="text-xs text-slate-400">
            Comprehensive pilgrim registry, passport archives, and multi-tour booking records.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, customer code..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-600"
          />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} Total Customers</span>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Pilgrim Name</th>
                <th className="py-3 px-4">Phone / WhatsApp</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Passport</th>
                <th className="py-3 px-4">Family Members</th>
                <th className="py-3 px-4">Total Bookings</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/60">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{c.customerCode}</td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    <Link href={`/admin/customers/${c.id}`} className="hover:text-gold-300">
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{c.phone}</td>
                  <td className="py-3.5 px-4 text-slate-300">{c.city || "Pune"}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400">
                    {c.passportNumber || "Pending"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {c.familyMembers?.length || 0} Members
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gold-300">
                    {c.bookings?.length || 0} Tours
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="text-gold-400 hover:underline font-semibold"
                    >
                      View Profile →
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

