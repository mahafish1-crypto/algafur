"use client";

import React, { useState, useMemo } from "react";
import {
  Shield,
  Search,
  Plus,
  Key,
  UserCheck,
  UserX,
  X,
  CheckCircle2,
  Sliders,
  Lock,
  Trash2,
  Edit3,
  Layers,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
  Ban,
} from "lucide-react";
import {
  MODULES_CONFIG,
  ActionKey,
  ALL_GRANULAR_PERMISSIONS,
  parsePermissionKey,
} from "@/lib/rbac";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId?: string | null;
  roleName: string;
  phone?: string | null;
  status: string;
  permissions: string[];
  lastLogin?: string | null;
  createdAt: string;
}

export interface CustomRoleItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  initialUsers: UserItem[];
  initialRoles: CustomRoleItem[];
  currentUserId: string;
}

const ACTION_LABELS: Record<ActionKey, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  approve: "Approve / Verify",
  export: "Export",
  manage: "Full Manage",
};

export default function AdminUsersClient({
  initialUsers,
  initialRoles,
  currentUserId,
}: Props) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [roles, setRoles] = useState<CustomRoleItem[]>(initialRoles);
  const [activeTab, setActiveTab] = useState<"USERS" | "ROLES">("USERS");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotice = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // --- CREATE USER MODAL STATE ---
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roleMode, setRoleMode] = useState<"EXISTING" | "NEW" | "SUPER_ADMIN">("EXISTING");
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "ACTIVE",
    roleId: initialRoles[0]?.id || "",
    newRoleName: "",
    newRoleDescription: "",
    permissions: initialRoles[0]?.permissions || ([] as string[]),
  });

  // --- EDIT USER MODAL STATE ---
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "ACTIVE",
    isSuperAdmin: false,
    roleId: "" as string | null,
    role: "",
    permissions: [] as string[],
  });

  // --- RESET PASSWORD MODAL STATE ---
  const [passwordTargetUser, setPasswordTargetUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // --- CREATE / EDIT ROLE MODAL STATE ---
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRoleItem | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    syncAssignedUsers: true,
  });

  // Helper: summarize which modules a permission list grants view access to
  const getAllowedModuleLabels = (perms: string[], roleCode?: string) => {
    if (roleCode === "SUPER_ADMIN" || perms.includes("*")) {
      return MODULES_CONFIG.map((m) => m.label);
    }
    const modSet = new Set<string>();
    for (const p of perms) {
      const parsed = parsePermissionKey(p);
      if (parsed) modSet.add(parsed.module);
    }
    return MODULES_CONFIG.filter((m) => modSet.has(m.key)).map((m) => m.label);
  };

  // Toggle a single permission in a list (auto-checks `:view` when enabling another action in that module; removes other actions if unchecking `:view`)
  const togglePermissionInArray = (
    current: string[],
    moduleKey: string,
    action: ActionKey
  ): string[] => {
    const key = `${moduleKey}:${action}`;
    const exists = current.includes(key);
    let next = exists ? current.filter((p) => p !== key) : [...current, key];

    if (!exists && action !== "view") {
      // Ensure view is enabled when enabling create/edit/delete/approve/export/manage
      if (!next.includes(`${moduleKey}:view`)) {
        next.push(`${moduleKey}:view`);
      }
    } else if (exists && action === "view") {
      // If unchecking view, clear all actions for this module
      next = next.filter((p) => !p.startsWith(`${moduleKey}:`));
    }
    return next;
  };

  // Toggle all actions for a single module
  const toggleModuleAllActions = (
    current: string[],
    moduleKey: string,
    actions: ActionKey[]
  ): string[] => {
    const modPerms = actions.map((a) => `${moduleKey}:${a}`);
    const allSelected = modPerms.every((p) => current.includes(p));
    if (allSelected) {
      return current.filter((p) => !p.startsWith(`${moduleKey}:`));
    } else {
      const set = new Set([...current, ...modPerms]);
      return Array.from(set);
    }
  };

  const openCreateUserModal = () => {
    setRoleMode("NEW");
    setUserForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      status: "ACTIVE",
      roleId: roles[0]?.id || "",
      newRoleName: "",
      newRoleDescription: "",
      permissions: [], // Do not grant every permission by default
    });
    setIsCreateUserOpen(true);
  };

  const handleSelectExistingRoleInCreate = (selectedRoleId: string) => {
    const found = roles.find((r) => r.id === selectedRoleId);
    setUserForm((prev) => ({
      ...prev,
      roleId: selectedRoleId,
      permissions: found ? [...found.permissions] : [],
    }));
  };

  const generateStrongPassword = (setter: (pw: string) => void) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
    let out = "Algafur@";
    for (let i = 0; i < 6; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setter(out);
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roleMode === "NEW" && !userForm.newRoleName.trim()) {
      showNotice("error", "Please enter a Custom Role name in Step 2.");
      return;
    }
    if (roleMode !== "SUPER_ADMIN" && userForm.permissions.length === 0) {
      showNotice(
        "error",
        "Please select at least one module permission in Step 3."
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        password: userForm.password,
        status: userForm.status,
        role: roleMode === "SUPER_ADMIN" ? "SUPER_ADMIN" : undefined,
        roleId: roleMode === "EXISTING" ? userForm.roleId : null,
        createNewRole: roleMode === "NEW",
        newRoleName: roleMode === "NEW" ? userForm.newRoleName : undefined,
        newRoleDescription:
          roleMode === "NEW" ? userForm.newRoleDescription : undefined,
        permissions:
          roleMode === "SUPER_ADMIN"
            ? ALL_GRANULAR_PERMISSIONS
            : userForm.permissions,
      };

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setUsers((prev) => [data.user, ...prev]);
      if (data.createdCustomRole) {
        setRoles((prev) => [
          ...prev,
          {
            ...data.createdCustomRole,
            isSystem: false,
            userCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
      setIsCreateUserOpen(false);
      showNotice(
        "success",
        `Staff user "${data.user.name}" created with ${
          data.user.role === "SUPER_ADMIN"
            ? "full Super Admin"
            : `${data.user.permissions.length} granular`
        } permissions.`
      );
    } catch (err: unknown) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Error creating user"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditUserModal = (user: UserItem) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      status: user.status,
      isSuperAdmin: user.role === "SUPER_ADMIN",
      roleId: user.roleId || "",
      role: user.role,
      permissions:
        user.role === "SUPER_ADMIN"
          ? [...ALL_GRANULAR_PERMISSIONS]
          : user.permissions.filter((p) => p !== "*"),
    });
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const payload = {
        name: editUserForm.name,
        email: editUserForm.email,
        phone: editUserForm.phone,
        status: editUserForm.status,
        role: editUserForm.isSuperAdmin ? "SUPER_ADMIN" : editUserForm.role,
        roleId: editUserForm.isSuperAdmin ? null : editUserForm.roleId || null,
        permissions: editUserForm.isSuperAdmin
          ? ALL_GRANULAR_PERMISSIONS
          : editUserForm.permissions,
      };

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? data.user : u))
      );
      setEditingUser(null);
      showNotice(
        "success",
        `Updated permissions & profile for ${data.user.name}.`
      );
    } catch (err: unknown) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Failed to update user"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (user: UserItem) => {
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change account status");
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)));
      showNotice(
        "success",
        `Account ${user.name} is now ${nextStatus}.`
      );
    } catch (err: unknown) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Could not change status"
      );
    }
  };

  const handleRevokeUserAccess = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revokeAccess: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to revoke access");
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)));
      showNotice(
        "success",
        `All module permissions revoked and account deactivated for ${user.name}.`
      );
    } catch (err: unknown) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Could not revoke access"
      );
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${passwordTargetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }
      setPasswordTargetUser(null);
      setNewPassword("");
      showNotice(
        "success",
        `Password securely updated for ${passwordTargetUser.name}.`
      );
    } catch (err: unknown) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Failed to reset password"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- CUSTOM ROLE CRUD HANDLERS ---
  const openCreateRoleModal = () => {
    setEditingRole(null);
    setRoleForm({
      name: "",
      description: "",
      permissions: [],
      syncAssignedUsers: true,
    });
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role: CustomRoleItem) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || "",
      permissions: [...role.permissions],
      syncAssignedUsers: true,
    });
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      showNotice("error", "Role name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
      const method = editingRole ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save custom role");
      }

      if (editingRole) {
        setRoles((prev) =>
          prev.map((r) => (r.id === editingRole.id ? data.role : r))
        );
        if (roleForm.syncAssignedUsers) {
          setUsers((prev) =>
            prev.map((u) =>
              u.roleId === editingRole.id && u.role !== "SUPER_ADMIN"
                ? {
                    ...u,
                    roleName: data.role.name,
                    permissions: data.role.permissions,
                  }
                : u
            )
          );
        }
        showNotice("success", `Custom role "${data.role.name}" updated.`);
      } else {
        setRoles((prev) => [...prev, data.role]);
        showNotice("success", `Custom role "${data.role.name}" created.`);
      }
      setIsRoleModalOpen(false);
    } catch (err: unknown) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Failed to save role"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: CustomRoleItem) => {
    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete role");
      }
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      showNotice("success", `Role "${role.name}" deleted.`);
    } catch (err: unknown) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Failed to delete role"
      );
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
      if (roleFilter !== "ALL") {
        if (roleFilter === "SUPER_ADMIN" && u.role !== "SUPER_ADMIN")
          return false;
        if (
          roleFilter !== "SUPER_ADMIN" &&
          u.roleId !== roleFilter &&
          u.role !== roleFilter
        )
          return false;
      }
      const term = search.toLowerCase().trim();
      if (!term) return true;
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.roleName.toLowerCase().includes(term)
      );
    });
  }, [users, statusFilter, roleFilter, search]);

  // Reusable Permission Matrix UI
  const renderPermissionMatrix = (
    selectedPerms: string[],
    onChangePerms: (next: string[]) => void,
    disabled = false
  ) => {
    return (
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Granular Module Permission Matrix ({MODULES_CONFIG.length} Modules)
            </span>
            <p className="text-[11px] text-slate-500">
              Select exact modules and actions this user/role is permitted to perform.
            </p>
          </div>
          {!disabled && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangePerms([...ALL_GRANULAR_PERMISSIONS])}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Select All Modules
              </button>
              <button
                type="button"
                onClick={() => onChangePerms([])}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
          {MODULES_CONFIG.map((mod) => {
            const modPerms = mod.actions.map((a) => `${mod.key}:${a}`);
            const allChecked = modPerms.every((p) => selectedPerms.includes(p));
            const someChecked = modPerms.some((p) => selectedPerms.includes(p));

            return (
              <div
                key={mod.key}
                className={`p-3.5 transition-colors ${
                  someChecked ? "bg-emerald-50/30" : "hover:bg-slate-50/80"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-[230px]">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        onChangePerms(
                          toggleModuleAllActions(
                            selectedPerms,
                            mod.key,
                            mod.actions
                          )
                        )
                      }
                      className="mt-0.5 text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                      title={`Select all actions for ${mod.label}`}
                    >
                      {allChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{mod.label}</span>
                        {someChecked && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-100 text-emerald-800 font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {mod.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pl-6 lg:pl-0">
                    {mod.actions.map((action) => {
                      const permKey = `${mod.key}:${action}`;
                      const checked = selectedPerms.includes(permKey);
                      return (
                        <label
                          key={permKey}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer select-none transition-all ${
                            checked
                              ? "bg-[#0D3B2E] text-white border-[#0D3B2E] shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            disabled={disabled}
                            checked={checked}
                            onChange={() =>
                              onChangePerms(
                                togglePermissionInArray(
                                  selectedPerms,
                                  mod.key,
                                  action
                                )
                              )
                            }
                          />
                          <span>{ACTION_LABELS[action]}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[70] max-w-md px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold transition-all ${
            toast.type === "success"
              ? "bg-emerald-950 text-emerald-100 border-emerald-700"
              : "bg-rose-950 text-rose-100 border-rose-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" /> Super Admin Access Control
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#0D3B2E]">
            User & Custom Role Permission Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Create staff accounts, define custom roles, and control exact module & action permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openCreateRoleModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F0] hover:bg-[#F1ECE1] text-[#0D3B2E] border border-[#E5DEC9] font-semibold text-xs transition-colors"
          >
            <Layers className="w-4 h-4 text-[#C9A84C]" />
            Create Custom Role
          </button>
          <button
            type="button"
            onClick={openCreateUserModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D3B2E] hover:bg-[#165342] text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#C9A84C]" />
            Add New User
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("USERS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "USERS"
                ? "bg-white text-[#0D3B2E] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Staff & User Accounts ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ROLES")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "ROLES"
                ? "bg-white text-[#0D3B2E] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Custom Roles & Permission Profiles ({roles.length})
          </button>
        </div>

        {activeTab === "USERS" && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
              }
              className="text-xs rounded-xl border border-slate-300 bg-white text-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="INACTIVE">Inactive / Revoked</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 bg-white text-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="ALL">All Assigned Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name, email, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: USERS TABLE */}
      {activeTab === "USERS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">User Details</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Allowed Modules</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Last Login</th>
                  <th className="px-5 py-3.5 text-right">Super Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => {
                  const allowedLabels = getAllowedModuleLabels(
                    user.permissions,
                    user.role
                  );
                  const isSelfSuperAdmin =
                    user.id === currentUserId && user.role === "SUPER_ADMIN";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{user.name}</span>
                          {user.id === currentUserId && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {user.email}
                          {user.phone ? ` • ${user.phone}` : ""}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            user.role === "SUPER_ADMIN"
                              ? "bg-amber-50 text-amber-900 border-amber-300"
                              : "bg-slate-100 text-slate-800 border-slate-200"
                          }`}
                        >
                          {user.role === "SUPER_ADMIN" && (
                            <Sparkles className="w-3 h-3 text-amber-600" />
                          )}
                          {user.roleName}
                        </span>
                      </td>

                      <td className="px-5 py-4 max-w-md">
                        {user.role === "SUPER_ADMIN" ? (
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block">
                            All 20 Modules (Full Super Admin Control)
                          </span>
                        ) : allowedLabels.length === 0 ? (
                          <span className="text-xs text-rose-600 font-medium">
                            No modules assigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {allowedLabels.slice(0, 5).map((lbl) => (
                              <span
                                key={lbl}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                              >
                                {lbl}
                              </span>
                            ))}
                            {allowedLabels.length > 5 && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                                +{allowedLabels.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
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

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditUserModal(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold transition-colors"
                            title="Edit Role & Module Permissions"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            Permissions
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPasswordTargetUser(user);
                              setNewPassword("");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
                            title="Reset User Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                            Password
                          </button>

                          {!isSelfSuperAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(user)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                  user.status === "ACTIVE"
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200"
                                }`}
                              >
                                {user.status === "ACTIVE" ? (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Activate
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRevokeUserAccess(user)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-colors"
                                title="Revoke All Access Immediately"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM ROLES & PERMISSION PROFILES */}
      {activeTab === "ROLES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((role) => {
            const modLabels = getAllowedModuleLabels(role.permissions, role.code);
            return (
              <div
                key={role.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[#0D3B2E]">
                        {role.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {role.description || "Custom permission profile"}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0">
                      {role.userCount} {role.userCount === 1 ? "User" : "Users"}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Allowed Modules ({modLabels.length}) •{" "}
                      {role.permissions.length} Granular Permissions
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {modLabels.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">
                          No modules enabled
                        </span>
                      ) : (
                        modLabels.map((lbl) => (
                          <span
                            key={lbl}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9] text-[#0D3B2E] text-xs font-semibold"
                          >
                            {lbl}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditRoleModal(role)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Role & Permissions
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRole(role)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          MODAL 1: 5-STEP CREATE NEW USER WORKFLOW
         ===================================================================== */}
      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg">
                  Add New Staff User & Assign Module Permissions
                </h3>
                <p className="text-xs text-emerald-200">
                  Super Admin 5-Step User Provisioning Workflow
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateUserOpen(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateUserSubmit}
              className="p-6 space-y-6 max-h-[82vh] overflow-y-auto"
            >
              {/* STEP 1: USER DETAILS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                  <span className="w-5 h-5 rounded-full bg-[#0D3B2E] text-white inline-flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span>Step 1: Enter User Details</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Khan"
                      value={userForm.name}
                      onChange={(e) =>
                        setUserForm({ ...userForm, name: e.target.value })
                      }
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email / Username *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. tariq@algafurtours.com"
                      value={userForm.email}
                      onChange={(e) =>
                        setUserForm({ ...userForm, email: e.target.value })
                      }
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98900 00000"
                      value={userForm.phone}
                      onChange={(e) =>
                        setUserForm({ ...userForm, phone: e.target.value })
                      }
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2: ASSIGN OR CREATE CUSTOM ROLE */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                  <span className="w-5 h-5 rounded-full bg-[#0D3B2E] text-white inline-flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>Step 2: Assign or Create Custom Role</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRoleMode("NEW");
                        setUserForm((prev) => ({ ...prev, permissions: [] }));
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        roleMode === "NEW"
                          ? "bg-[#0D3B2E] text-white border-[#0D3B2E]"
                          : "bg-white text-slate-700 border-slate-300"
                      }`}
                    >
                      + Create New Custom Role
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRoleMode("EXISTING");
                        if (roles[0]) {
                          handleSelectExistingRoleInCreate(roles[0].id);
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        roleMode === "EXISTING"
                          ? "bg-[#0D3B2E] text-white border-[#0D3B2E]"
                          : "bg-white text-slate-700 border-slate-300"
                      }`}
                    >
                      Select Saved Custom Role ({roles.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleMode("SUPER_ADMIN")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        roleMode === "SUPER_ADMIN"
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-slate-700 border-slate-300"
                      }`}
                    >
                      Full Super Admin
                    </button>
                  </div>

                  {roleMode === "NEW" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          New Custom Role Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Visa & Document Executive, Booking Manager..."
                          value={userForm.newRoleName}
                          onChange={(e) =>
                            setUserForm({
                              ...userForm,
                              newRoleName: e.target.value,
                            })
                          }
                          className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Role Description (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Responsibilities for this custom role..."
                          value={userForm.newRoleDescription}
                          onChange={(e) =>
                            setUserForm({
                              ...userForm,
                              newRoleDescription: e.target.value,
                            })
                          }
                          className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                    </div>
                  )}

                  {roleMode === "EXISTING" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Choose Custom Role Profile *
                      </label>
                      <select
                        value={userForm.roleId}
                        onChange={(e) =>
                          handleSelectExistingRoleInCreate(e.target.value)
                        }
                        className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.permissions.length} permissions)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 3: SELECT ALLOWED MODULES & GRANULAR PERMISSIONS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                  <span className="w-5 h-5 rounded-full bg-[#0D3B2E] text-white inline-flex items-center justify-center text-[11px]">
                    3
                  </span>
                  <span>
                    Step 3: Select Allowed Modules & Action Permissions (
                    {roleMode === "SUPER_ADMIN"
                      ? "All Granted"
                      : `${userForm.permissions.length} selected`}
                    )
                  </span>
                </div>

                {roleMode === "SUPER_ADMIN" ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                    Super Admin automatically receives unrestricted access to all 20 modules and system administration controls.
                  </div>
                ) : (
                  renderPermissionMatrix(userForm.permissions, (next) =>
                    setUserForm({ ...userForm, permissions: next })
                  )
                )}
              </div>

              {/* STEP 4 & 5: SET CREDENTIALS & ACTIVATE */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D3B2E]">
                  <span className="w-5 h-5 rounded-full bg-[#0D3B2E] text-white inline-flex items-center justify-center text-[11px]">
                    4
                  </span>
                  <span>Step 4 & 5: Set Login Credentials & Account Status</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Login Password * (Min 6 characters)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          generateStrongPassword((pw) =>
                            setUserForm({ ...userForm, password: pw })
                          )
                        }
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        Generate Strong Password
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      minLength={6}
                      placeholder="Enter or generate password"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Initial Account Status
                    </label>
                    <select
                      value={userForm.status}
                      onChange={(e) =>
                        setUserForm({ ...userForm, status: e.target.value })
                      }
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="ACTIVE">ACTIVE (Can log in immediately)</option>
                      <option value="INACTIVE">INACTIVE (Login disabled)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#0D3B2E] hover:bg-[#165342] text-white shadow-sm disabled:opacity-50"
                >
                  {submitting
                    ? "Saving User & Permissions..."
                    : "Save & Activate Staff User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: EDIT USER PERMISSIONS & ROLE
         ===================================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg">
                  Edit User Access & Module Permissions — {editingUser.name}
                </h3>
                <p className="text-xs text-emerald-200">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveEditUser}
              className="p-6 space-y-5 max-h-[82vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserForm.name}
                    onChange={(e) =>
                      setEditUserForm({ ...editUserForm, name: e.target.value })
                    }
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editUserForm.email}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editUserForm.phone}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Custom Role
                  </label>
                  <select
                    value={
                      editUserForm.isSuperAdmin
                        ? "SUPER_ADMIN"
                        : editUserForm.roleId || "CUSTOM"
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "SUPER_ADMIN") {
                        setEditUserForm({
                          ...editUserForm,
                          isSuperAdmin: true,
                          role: "SUPER_ADMIN",
                          roleId: null,
                          permissions: [...ALL_GRANULAR_PERMISSIONS],
                        });
                      } else {
                        const found = roles.find((r) => r.id === val);
                        setEditUserForm({
                          ...editUserForm,
                          isSuperAdmin: false,
                          roleId: found ? found.id : null,
                          role: found ? found.code : editUserForm.role,
                          permissions: found
                            ? [...found.permissions]
                            : editUserForm.permissions,
                        });
                      }
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  >
                    <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                    <option value="CUSTOM">Custom Individual Permissions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editUserForm.status}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {editUserForm.isSuperAdmin ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                  This account is configured as Super Admin with full access to all modules.
                </div>
              ) : (
                renderPermissionMatrix(editUserForm.permissions, (next) =>
                  setEditUserForm({ ...editUserForm, permissions: next })
                )
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#0D3B2E] hover:bg-[#165342] text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Permissions & Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: RESET USER PASSWORD
         ===================================================================== */}
      {passwordTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C9A84C]" />
                  Reset Password
                </h3>
                <p className="text-xs text-emerald-200">
                  {passwordTargetUser.name} ({passwordTargetUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordTargetUser(null)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => generateStrongPassword(setNewPassword)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Generate Password
                  </button>
                </div>
                <input
                  type="text"
                  required
                  minLength={6}
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordTargetUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0D3B2E] hover:bg-[#165342] text-white"
                >
                  {submitting ? "Updating..." : "Set New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: CREATE / EDIT CUSTOM ROLE
         ===================================================================== */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg">
                  {editingRole
                    ? `Edit Custom Role — ${editingRole.name}`
                    : "Create New Custom Role"}
                </h3>
                <p className="text-xs text-emerald-200">
                  Configure reusable module & action permission templates
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveRole}
              className="p-6 space-y-5 max-h-[82vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Visa & Document Executive"
                    value={roleForm.name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, name: e.target.value })
                    }
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Describe what staff in this role handle..."
                    value={roleForm.description}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, description: e.target.value })
                    }
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2.5 bg-white text-slate-900"
                  />
                </div>
              </div>

              {renderPermissionMatrix(roleForm.permissions, (next) =>
                setRoleForm({ ...roleForm, permissions: next })
              )}

              {editingRole && (
                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roleForm.syncAssignedUsers}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        syncAssignedUsers: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-[#0D3B2E]"
                  />
                  <span>
                    Automatically update permissions for all users currently assigned to this role ({editingRole.userCount} users)
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#0D3B2E] hover:bg-[#165342] text-white shadow-sm disabled:opacity-50"
                >
                  {submitting
                    ? "Saving Role..."
                    : editingRole
                    ? "Update Custom Role"
                    : "Create Custom Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
