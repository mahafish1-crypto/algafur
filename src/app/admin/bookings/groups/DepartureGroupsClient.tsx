"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plane,
  Building,
  ShieldCheck,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
} from "lucide-react";

interface DepartureGroupsClientProps {
  initialGroups: any[];
}

export default function DepartureGroupsClient({ initialGroups }: DepartureGroupsClientProps) {
  const [selectedGroup, setSelectedGroup] = useState<any | null>(initialGroups[0] || null);

  const exportManifestCSV = () => {
    if (!selectedGroup) return;

    let csv = "BookingRef,CustomerName,Phone,TravellerName,PassportNumber,Gender,RoomType,VisaStatus\n";

    selectedGroup.bookings.forEach((b: any) => {
      b.travellers.forEach((t: any) => {
        csv += `"${b.bookingNumber}","${b.customer.name}","${b.customer.phone}","${t.fullName}","${t.passportNumber || "PENDING"}","${t.gender}","${t.roomType}","${t.visaStatus}"\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Manifest_${selectedGroup.groupName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Departure Groups &amp; Manifests</h1>
          <p className="text-xs text-slate-400">
            Organize pilgrim departure groups, room manifests, and airline passenger lists.
          </p>
        </div>

        {selectedGroup && (
          <button
            onClick={exportManifestCSV}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Group Manifest (CSV)</span>
          </button>
        )}
      </div>

      {/* Groups Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialGroups.map((g) => (
          <div
            key={g.id}
            onClick={() => setSelectedGroup(g)}
            className={`p-6 rounded-3xl border cursor-pointer transition-all space-y-3 ${
              selectedGroup?.id === g.id
                ? "bg-slate-950 border-gold-500/50 ring-2 ring-gold-500/20"
                : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gold-400 uppercase tracking-wide">
                {g.departureDate}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {g.status}
              </span>
            </div>

            <h3 className="text-base font-serif font-bold text-white">{g.groupName}</h3>
            <p className="text-xs text-slate-400">{g.package.name}</p>

            <div className="grid grid-cols-3 gap-2 pt-2 text-xs border-t border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">Capacity</span>
                <span className="font-bold text-white">{g.totalCapacity} Pax</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Confirmed</span>
                <span className="font-bold text-emerald-400">{g.confirmedTravellers} Booked</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Seats Open</span>
                <span className="font-bold text-gold-400">
                  {g.totalCapacity - g.confirmedTravellers} Left
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manifest Viewer for Selected Group */}
      {selectedGroup && (
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-gold-400 uppercase">Passenger Manifest</span>
              <h2 className="text-lg font-serif font-bold text-white">
                {selectedGroup.groupName}
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Flight: {selectedGroup.flight?.airline || "Saudia Direct (SV-771)"} • PNR: {selectedGroup.flight?.pnr || "ALG9872"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Booking</th>
                  <th className="py-3 px-4">Pilgrim Full Name</th>
                  <th className="py-3 px-4">Passport No</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Room Type</th>
                  <th className="py-3 px-4">Visa Status</th>
                  <th className="py-3 px-4 text-right">Lead Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {selectedGroup.bookings.flatMap((b: any) =>
                  b.travellers.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-900/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">
                        {b.bookingNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{t.fullName}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">
                        {t.passportNumber || "PENDING"}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{t.gender}</td>
                      <td className="py-3 px-4 font-medium text-slate-300">{t.roomType}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {t.visaStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {b.customer.name} ({b.customer.phone})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

