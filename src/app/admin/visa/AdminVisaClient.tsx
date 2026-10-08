"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Plus,
  Send,
  Calendar,
  User,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

interface VisaApp {
  id: string;
  customerId: string;
  bookingId?: string | null;
  passportNumber: string;
  applicationNumber?: string | null;
  visaNumber?: string | null;
  status: string;
  submissionDate?: string | null;
  approvalDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    whatsapp?: string | null;
    passportNumber?: string | null;
    passportExpiry?: string | null;
  };
  booking?: {
    id: string;
    bookingNumber: string;
    journeyType: string;
    package?: {
      id: string;
      name: string;
      departureDate: string;
    } | null;
  } | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Props {
  initialApplications: VisaApp[];
  customers: Array<{ id: string; name: string; phone: string; passportNumber?: string | null }>;
  bookings: Array<{ id: string; bookingNumber: string; customerId: string }>;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: any }
> = {
  NOT_STARTED: {
    label: "Not Started",
    color: "text-slate-700",
    bg: "bg-slate-100",
    border: "border-slate-300",
    icon: Clock,
  },
  DOCUMENTS_PENDING: {
    label: "Docs Pending",
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertCircle,
  },
  SUBMITTED: {
    label: "Submitted",
    color: "text-blue-800",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Send,
  },
  PROCESSING: {
    label: "In Processing",
    color: "text-indigo-800",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: RefreshCw,
  },
  APPROVED: {
    label: "Visa Approved",
    color: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-rose-800",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: XCircle,
  },
  EXPIRED: {
    label: "Expired",
    color: "text-stone-700",
    bg: "bg-stone-100",
    border: "border-stone-300",
    icon: Clock,
  },
};

export default function AdminVisaClient({
  initialApplications,
  customers,
  bookings,
}: Props) {
  const [applications, setApplications] = useState<VisaApp[]>(initialApplications);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [editingApp, setEditingApp] = useState<VisaApp | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Application Form State
  const [newForm, setNewForm] = useState({
    customerId: customers[0]?.id || "",
    bookingId: "",
    passportNumber: "",
    applicationNumber: "",
    notes: "",
  });

  // Edit Status Form State
  const [editForm, setEditForm] = useState({
    status: "PROCESSING",
    visaNumber: "",
    applicationNumber: "",
    approvalDate: "",
    expiryDate: "",
    notes: "",
  });

  const openEditModal = (app: VisaApp) => {
    setEditingApp(app);
    setEditForm({
      status: app.status,
      visaNumber: app.visaNumber || "",
      applicationNumber: app.applicationNumber || "",
      approvalDate: app.approvalDate ? app.approvalDate.substring(0, 10) : "",
      expiryDate: app.expiryDate ? app.expiryDate.substring(0, 10) : "",
      notes: app.notes || "",
    });
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/visa/${editingApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const json = await res.json();
        setApplications((prev) =>
          prev.map((a) => (a.id === editingApp.id ? { ...a, ...json.application } : a))
        );
        setEditingApp(null);
      } else {
        alert("Failed to update visa application.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating visa record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.customerId || !newForm.passportNumber) {
      alert("Please select a customer and enter passport number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/visa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });

      if (res.ok) {
        const json = await res.json();
        setApplications((prev) => [json.application, ...prev]);
        setIsNewModalOpen(false);
        setNewForm({
          customerId: customers[0]?.id || "",
          bookingId: "",
          passportNumber: "",
          applicationNumber: "",
          notes: "",
        });
      } else {
        alert("Failed to create visa application.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating visa record.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesTab =
      activeTab === "ALL"
        ? true
        : activeTab === "PENDING"
        ? ["DOCUMENTS_PENDING", "NOT_STARTED"].includes(app.status)
        : activeTab === "PROCESSING"
        ? ["SUBMITTED", "PROCESSING"].includes(app.status)
        : activeTab === "APPROVED"
        ? app.status === "APPROVED"
        : app.status === activeTab;

    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      app.customer?.name?.toLowerCase().includes(term) ||
      app.passportNumber?.toLowerCase().includes(term) ||
      app.visaNumber?.toLowerCase().includes(term) ||
      app.applicationNumber?.toLowerCase().includes(term) ||
      app.booking?.bookingNumber?.toLowerCase().includes(term);

    return matchesTab && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pendingDocs: applications.filter((a) =>
      ["DOCUMENTS_PENDING", "NOT_STARTED"].includes(a.status)
    ).length,
    inProcess: applications.filter((a) =>
      ["SUBMITTED", "PROCESSING"].includes(a.status)
    ).length,
    approved: applications.filter((a) => a.status === "APPROVED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-700" />
            Saudi Visa Management & MOFA Pipeline
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track Umrah and Hajj tourist/evisa applications, MOFA approvals, and passport compliance.
          </p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Visa Application
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Applications
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Docs Pending
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingDocs}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              In MOFA / Processing
            </p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.inProcess}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Visas Approved
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.approved}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: "ALL", label: "All" },
            { id: "PENDING", label: "Docs Pending" },
            { id: "PROCESSING", label: "In Processing" },
            { id: "APPROVED", label: "Approved" },
            { id: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pilgrim, passport, visa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Pilgrim / Customer</th>
                <th className="px-5 py-3.5">Passport Details</th>
                <th className="px-5 py-3.5">Booking & Package</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Visa No. / MOFA Ref</th>
                <th className="px-5 py-3.5">Validity</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No visa applications found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.NOT_STARTED;
                  const StatusIcon = cfg.icon;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{app.customer?.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{app.customer?.phone}</span>
                          {app.customer?.whatsapp && (
                            <a
                              href={`https://wa.me/${app.customer.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Assalamu Alaikum ${app.customer.name}, update regarding your Umrah Visa (${app.passportNumber}): Current status is ${cfg.label}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700"
                              title="Send WhatsApp Update"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-semibold text-slate-900">
                          {app.passportNumber}
                        </div>
                        {app.customer?.passportExpiry && (
                          <div className="text-xs text-slate-500">
                            Exp: {new Date(app.customer.passportExpiry).toLocaleDateString("en-IN")}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {app.booking ? (
                          <div>
                            <span className="font-mono text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {app.booking.bookingNumber}
                            </span>
                            <div className="text-xs text-slate-700 mt-1 max-w-[200px] truncate">
                              {app.booking.package?.name || app.booking.journeyType}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Direct / No Tour Linked</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {app.visaNumber ? (
                          <div className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50/80 px-2 py-0.5 rounded inline-block border border-emerald-200">
                            {app.visaNumber}
                          </div>
                        ) : app.applicationNumber ? (
                          <div className="font-mono text-xs text-slate-600">
                            MOFA: {app.applicationNumber}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {app.approvalDate ? (
                          <div className="text-xs">
                            <span className="text-slate-500">Issued: </span>
                            <span className="font-medium text-slate-800">
                              {new Date(app.approvalDate).toLocaleDateString("en-IN")}
                            </span>
                            {app.expiryDate && (
                              <div className="text-slate-500 mt-0.5">
                                Exp:{" "}
                                <span className="font-medium text-slate-800">
                                  {new Date(app.expiryDate).toLocaleDateString("en-IN")}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Not issued</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openEditModal(app)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium text-xs border border-emerald-200 transition-colors"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Update Visa Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Update Visa Record</h3>
                <p className="text-xs text-emerald-200">
                  {editingApp.customer?.name} &bull; Passport: {editingApp.passportNumber}
                </p>
              </div>
              <button
                onClick={() => setEditingApp(null)}
                className="text-emerald-200 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Visa Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="DOCUMENTS_PENDING">Documents Pending</option>
                  <option value="SUBMITTED">Submitted to MOFA / Enjaz</option>
                  <option value="PROCESSING">Under Processing</option>
                  <option value="APPROVED">Approved (Visa Issued)</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Visa Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6009876543"
                    value={editForm.visaNumber}
                    onChange={(e) => setEditForm({ ...editForm, visaNumber: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    MOFA / App No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MOFA-897654"
                    value={editForm.applicationNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, applicationNumber: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Approval / Issue Date
                  </label>
                  <input
                    type="date"
                    value={editForm.approvalDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, approvalDate: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={editForm.expiryDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, expiryDate: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Internal Notes / Remark
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Biometrics verified at VFS, sent for stamping."
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Visa Application Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">New Visa Application</h3>
                <p className="text-xs text-emerald-200">
                  Register pilgrim in Saudi Visa processing pipeline
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-emerald-200 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Select Customer *
                </label>
                <select
                  value={newForm.customerId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const cust = customers.find((c) => c.id === cId);
                    setNewForm({
                      ...newForm,
                      customerId: cId,
                      passportNumber: cust?.passportNumber || newForm.passportNumber,
                    });
                  }}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Passport Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Z1234567"
                  value={newForm.passportNumber}
                  onChange={(e) => setNewForm({ ...newForm, passportNumber: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono uppercase bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Link to Booking (Optional)
                </label>
                <select
                  value={newForm.bookingId}
                  onChange={(e) => setNewForm({ ...newForm, bookingId: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="">No linked booking</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  MOFA / Application Ref (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MOFA-1234567"
                  value={newForm.applicationNumber}
                  onChange={(e) =>
                    setNewForm({ ...newForm, applicationNumber: e.target.value })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or remarks..."
                  value={newForm.notes}
                  onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

