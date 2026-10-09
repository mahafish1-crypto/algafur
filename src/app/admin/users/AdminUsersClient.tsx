"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Shield,
  Key,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  X,
  CheckCircle,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  status: string;
  lastLogin?: string | null;
  createdAt: string;
}

interface Props {
  initialUsers: UserItem[];
}

export default function AdminUsersClient({ initialUsers }: Props) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES_EXECUTIVE",
    phone: "",
  });

  const roles = [
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "SALES_EXECUTIVE",
    "ACCOUNTS",
    "VISA_TEAM",
    "OPERATIONS",
    "MARKETING",
    "AGENT",
  ];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const json = await res.json();
        setUsers((prev) => [json.user, ...prev]);
        setIsCreateOpen(false);
        setForm({
          name: "",
          email: "",
          password: "",
          role: "SALES_EXECUTIVE",
          phone: "",
        });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating staff user");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "ALL" ? true : u.role === roleFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term);

    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-emerald-700" />
            Staff & RBAC Role-Based Access Control
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage agency team members, permissions, departments, and access credentials.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {["ALL", "SUPER_ADMIN", "ADMIN", "SALES_EXECUTIVE", "ACCOUNTS", "VISA_TEAM"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                roleFilter === r
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Staff Name & Contact</th>
                <th className="px-5 py-3.5">Role / Department</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Login</th>
                <th className="px-5 py-3.5">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                      <span>{user.email}</span>
                      {user.phone && <span>&bull; {user.phone}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Never"}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Add Staff User</h3>
                <p className="text-xs text-emerald-200">Create new user credentials with RBAC role</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Khan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. tariq@algafurtours.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 font-mono bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  RBAC Role *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 98900 00000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Staff User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

