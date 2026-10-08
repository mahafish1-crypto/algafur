"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Wallet,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  Building,
  Plane,
  ArrowUpRight,
} from "lucide-react";

interface ReportData {
  metrics: {
    totalRevenue: number;
    totalCollected: number;
    outstandingDue: number;
    totalBookings: number;
    totalPilgrims: number;
    totalLeads: number;
    conversionRate: number;
  };
  packagesPerformance: Array<{
    id: string;
    name: string;
    bookedSeats: number;
    totalSeats: number;
    revenue: number;
    type: string;
  }>;
  methodBreakdown: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  recentTransactions: Array<{
    receiptNumber: string;
    amount: number;
    method: string;
    customerName: string;
    date: string;
  }>;
}

interface Props {
  data: ReportData;
}

export default function AdminReportsClient({ data }: Props) {
  const [dateRange, setDateRange] = useState("ALL_TIME");

  const exportCSV = () => {
    let csv = "Package Name,Type,Booked Seats,Total Capacity,Revenue (INR)\n";
    data.packagesPerformance.forEach((p) => {
      csv += `"${p.name}","${p.type}",${p.bookedSeats},${p.totalSeats},${p.revenue}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AlGafur_Revenue_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-700" />
            Executive Financial Analytics & Growth Reports
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time business performance, collection realization, seat load factors, and CRM funnel conversion.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV Report
        </button>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Gross Contracted Value</span>
            <Wallet className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ₹{data.metrics.totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Across {data.metrics.totalBookings} registered bookings
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Realized Collections</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            ₹{data.metrics.totalCollected.toLocaleString("en-IN")}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{
                width: `${
                  data.metrics.totalRevenue > 0
                    ? Math.min(100, (data.metrics.totalCollected / data.metrics.totalRevenue) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Receivables</span>
            <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold">
              DUE
            </span>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            ₹{data.metrics.outstandingDue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 mt-1">Due before departures</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>CRM Conversion Rate</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-2">
            {data.metrics.conversionRate}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {data.metrics.totalBookings} booked from {data.metrics.totalLeads} total leads
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Package Revenue & Load Factor Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Package Seat Load Factor & Revenue</h2>
              <p className="text-xs text-slate-500">Live booking density and total contracted revenue</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Tour Package</th>
                  <th className="py-3 px-3">Occupancy</th>
                  <th className="py-3 px-3">Load %</th>
                  <th className="py-3 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.packagesPerformance.map((pkg) => {
                  const percent = Math.round((pkg.bookedSeats / pkg.totalSeats) * 100);
                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block">{pkg.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{pkg.type}</span>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {pkg.bookedSeats} / {pkg.totalSeats} seats
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-emerald-700 h-2 rounded-full"
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-800">{percent}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ₹{pkg.revenue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3 border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Collections by Channel</h2>
            <p className="text-xs text-slate-500">Breakdown of payment modes received</p>
          </div>

          <div className="space-y-3">
            {data.methodBreakdown.map((m) => {
              const totalAmount = data.metrics.totalCollected || 1;
              const pct = Math.round((m.amount / totalAmount) * 100);

              return (
                <div key={m.method} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{m.method.replace("_", " ")}</span>
                    <span className="font-mono font-bold text-emerald-800">
                      ₹{m.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>{m.count} transactions</span>
                    <span>{pct}% of total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

