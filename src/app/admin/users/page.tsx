import React from "react";
import prisma from "@/lib/db";
import AdminUsersClient from "./AdminUsersClient";
import { verifyModuleAccess, AccessDeniedView, ensureInitialRolesSeeded } from "@/lib/rbac-server";
import { parseStoredPermissions, resolveUserPermissions } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User & Role Access Management | AL-GAFUR Admin",
  description:
    "Super Admin control panel for staff accounts, custom roles, and granular module permissions.",
};

export default async function AdminUsersPage() {
  const { allowed, session } = await verifyModuleAccess("users");
  if (!allowed) {
    return <AccessDeniedView moduleKey="users" session={session} />;
  }

  await ensureInitialRolesSeeded();

  const [rawUsers, rawRoles] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roleId: true,
        permissions: true,
        phone: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        customRole: {
          select: {
            id: true,
            name: true,
            code: true,
            permissions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customRole.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const users = rawUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    roleId: u.roleId,
    roleName:
      u.role === "SUPER_ADMIN"
        ? "Super Admin"
        : u.customRole?.name || u.role.replace(/_/g, " "),
    phone: u.phone,
    status: u.status,
    permissions: resolveUserPermissions(u),
    lastLogin: u.lastLogin ? u.lastLogin.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  }));

  const roles = rawRoles.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    description: r.description,
    permissions: parseStoredPermissions(r.permissions) || [],
    isSystem: r.isSystem,
    userCount: r._count.users,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <AdminUsersClient
      initialUsers={users}
      initialRoles={roles}
      currentUserId={session.id}
    />
  );
}
