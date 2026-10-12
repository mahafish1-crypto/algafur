"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Award,
  ExternalLink,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import type { TeamMemberProfile, TeamCategory } from "@/lib/team-data";

interface PackageItem {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface AdminTeamClientProps {
  initialMembers: TeamMemberProfile[];
  allPackages: PackageItem[];
}

const CATEGORIES: Array<{ id: TeamCategory | "ALL"; label: string }> = [
  { id: "ALL", label: "All Categories" },
  { id: "DIRECTOR", label: "Directors & Leadership" },
  { id: "SPIRITUAL_GUIDE", label: "Spiritual Guides" },
  { id: "OPERATIONS", label: "Operations Team" },
  { id: "SALES", label: "Sales Team" },
  { id: "ACCOUNTS", label: "Accounts Team" },
  { id: "SUPPORT", label: "Customer Support" },
  { id: "OTHER", label: "Other / Custom Designation" },
];

const emptyMemberForm: Omit<TeamMemberProfile, "id"> & { id?: string } = {
  name: "",
  designation: "",
  category: "SPIRITUAL_GUIDE",
  photo: "",
  bio: "",
  languages: "",
  services: "",
  phone: "",
  email: "",
  displayOrder: 10,
  isActive: true,
  packageIds: [],
};

export default function AdminTeamClient({
  initialMembers,
  allPackages,
}: AdminTeamClientProps) {
  const [members, setMembers] = useState<TeamMemberProfile[]>(initialMembers);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<
    Omit<TeamMemberProfile, "id"> & { id?: string }
  >(emptyMemberForm);

  const openAddModal = () => {
    setErrorMsg(null);
    setForm({
      ...emptyMemberForm,
      displayOrder: members.length + 1,
      packageIds: allPackages.map((p) => p.id),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMemberProfile) => {
    setErrorMsg(null);
    setForm({
      ...member,
      photo: member.photo || "",
      bio: member.bio || "",
      languages: member.languages || "",
      services: member.services || "",
      phone: member.phone || "",
      email: member.email || "",
      packageIds: member.packageIds || [],
    });
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member: form }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || "Failed to save profile.");
        return;
      }

      setMembers(json.members || []);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error saving profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (member: TeamMemberProfile) => {
    try {
      const updated = { ...member, isActive: !member.isActive };
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member: updated }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMembers(json.members || []);
      }
    } catch {
      alert("Failed to update visibility.");
    }
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= members.length) return;
    const copy = [...members];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    const reindexed = copy.map((m, i) => ({ ...m, displayOrder: i + 1 }));
    setMembers(reindexed);

    try {
      await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: reindexed }),
      });
    } catch {
      // ignore
    }
  };

  const handleDeleteMember = async (member: TeamMemberProfile) => {
    if (
      !window.confirm(
        `Remove "${member.name}" from Team & Spiritual Guides?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/team?id=${encodeURIComponent(member.id)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (res.ok && json.success) {
        setMembers(json.members || []);
      } else {
        alert(json.error || "Failed to delete profile.");
      }
    } catch {
      alert("Error deleting profile.");
    }
  };

  const togglePackageLink = (pkgId: string) => {
    setForm((prev) => {
      const current = prev.packageIds || [];
      const exists = current.includes(pkgId);
      return {
        ...prev,
        packageIds: exists
          ? current.filter((id) => id !== pkgId)
          : [...current, pkgId],
      };
    });
  };

  const filtered = members.filter((m) =>
    categoryFilter === "ALL" ? true : m.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-700" />
            Team &amp; Spiritual Guides Manager
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage Directors, Spiritual Guides, Operations, Sales, Accounts, and
            Support staff displayed on the About Us page and Package pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Public About Us Page
          </Link>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Team Member / Guide
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              categoryFilter === c.id
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((m, idx) => {
          const initials = m.name
            .split(" ")
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between space-y-4 ${
                m.isActive
                  ? "border-slate-200"
                  : "border-slate-200 opacity-65 bg-slate-50"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {m.photo ? (
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                        <Image
                          src={m.photo}
                          alt={m.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-emerald-900 text-amber-300 font-bold flex items-center justify-center text-base shrink-0">
                        {initials}
                      </div>
                    )}
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                        {m.category.replace("_", " ")}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {m.name}
                      </h3>
                      <p className="text-xs font-semibold text-amber-700">
                        {m.designation}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(m)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      m.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                    title="Toggle Public Visibility"
                  >
                    {m.isActive ? (
                      <>
                        <Eye className="w-3 h-3" /> Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> Hidden
                      </>
                    )}
                  </button>
                </div>

                {m.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.bio}
                  </p>
                )}

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                  {m.languages && (
                    <p>
                      <strong className="text-slate-800">Languages:</strong>{" "}
                      {m.languages}
                    </p>
                  )}
                  {m.services && (
                    <p>
                      <strong className="text-slate-800">Services:</strong>{" "}
                      {m.services}
                    </p>
                  )}
                  {m.phone && (
                    <p>
                      <strong className="text-slate-800">Phone:</strong>{" "}
                      {m.phone}
                    </p>
                  )}
                  {m.category === "SPIRITUAL_GUIDE" && (
                    <p className="text-[11px] text-emerald-800 font-semibold pt-1">
                      <Award className="w-3.5 h-3.5 inline mr-1" />
                      Linked to {(m.packageIds || []).length} package(s)
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, 1)}
                    disabled={idx === filtered.length - 1}
                    className="p-1.5 rounded border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(m)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(m)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 px-2.5 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {form.id
                    ? `Edit Profile: ${form.name}`
                    : "Add Team Member / Spiritual Guide"}
                </h3>
                <p className="text-xs text-emerald-200">
                  Manage public profile details, designation, and package
                  assignments
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveMember}
              className="p-6 space-y-4 max-h-[82vh] overflow-y-auto"
            >
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hafiz Asrar Sahab"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Department / Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as TeamCategory,
                      })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  >
                    <option value="DIRECTOR">Directors &amp; Leadership</option>
                    <option value="SPIRITUAL_GUIDE">Spiritual Guide</option>
                    <option value="OPERATIONS">Operations Team</option>
                    <option value="SALES">Sales Team</option>
                    <option value="ACCOUNTS">Accounts Team</option>
                    <option value="SUPPORT">Customer Support</option>
                    <option value="OTHER">Other / Custom Designation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Role / Designation Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Spiritual Guide / Sales Manager"
                    value={form.designation}
                    onChange={(e) =>
                      setForm({ ...form, designation: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Visibility Status
                  </label>
                  <select
                    value={form.isActive ? "ACTIVE" : "HIDDEN"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isActive: e.target.value === "ACTIVE",
                      })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  >
                    <option value="ACTIVE">Active (Visible on Website)</option>
                    <option value="HIDDEN">Hidden (Draft / Internal)</option>
                  </select>
                </div>
              </div>

              {/* Profile Photo */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Profile Photograph (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Upload / Select Photo
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Photo URL (leave blank to show initials)"
                    value={form.photo || ""}
                    onChange={(e) =>
                      setForm({ ...form, photo: e.target.value })
                    }
                    className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                  {form.photo && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-300 shrink-0 bg-slate-900">
                      <Image
                        src={form.photo}
                        alt="Preview"
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Short Biography / Experience Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe their role, responsibilities, or spiritual guidance..."
                  value={form.bio || ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Languages Spoken (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Urdu, Hindi, Arabic, Marathi"
                    value={form.languages || ""}
                    onChange={(e) =>
                      setForm({ ...form, languages: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Guidance / Services Provided (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Umrah Manasik, Ziyarat Explanations"
                    value={form.services || ""}
                    onChange={(e) =>
                      setForm({ ...form, services: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9890708013"
                    value={form.phone || ""}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@algafur.com"
                    value={form.email || ""}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Link to Packages (for Spiritual Guides) */}
              {form.category === "SPIRITUAL_GUIDE" && allPackages.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Link Spiritual Guide to Packages
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pt-1">
                    {allPackages.map((pkg) => {
                      const checked = (form.packageIds || []).includes(pkg.id);
                      return (
                        <label
                          key={pkg.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                            checked
                              ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePackageLink(pkg.id)}
                            className="rounded text-emerald-800"
                          />
                          <span className="truncate">{pkg.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-bold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submitting ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Team / Spiritual Guide Photo"
        onSelect={(url) => {
          setForm((prev) => ({ ...prev, photo: url }));
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
}

