import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireSuperAdmin } from "@/lib/api-auth";
import {
  normalizePermissionList,
  resolveUserPermissions,
} from "@/lib/rbac";
import { ensureInitialRolesSeeded } from "@/lib/rbac-server";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin(req);
    if (!auth.authorized) return auth.response;

    await ensureInitialRolesSeeded();

    const users = await prisma.user.findMany({
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
    });

    const formatted = users.map((u) => ({
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
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, users: formatted });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin(req);
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      status = "ACTIVE",
      roleId,
      role,
      createNewRole,
      newRoleName,
      newRoleDescription,
      permissions,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    const rawPerms: string[] = Array.isArray(permissions) ? permissions : [];
    const normalizedPermissions = normalizePermissionList(
      rawPerms.filter((p) => p !== "*")
    );

    let assignedRoleId: string | null = roleId || null;
    let assignedRoleCode: string = role || "CUSTOM_STAFF";
    let createdCustomRole: {
      id: string;
      name: string;
      code: string;
      description: string | null;
      permissions: string[];
    } | null = null;

    if (assignedRoleCode === "SUPER_ADMIN") {
      assignedRoleId = null;
    } else if (createNewRole && newRoleName && String(newRoleName).trim()) {
      const cleanRoleName = String(newRoleName).trim();
      const generatedCode = cleanRoleName
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 50);

      const existingRole = await prisma.customRole.findFirst({
        where: {
          OR: [
            { name: { equals: cleanRoleName, mode: "insensitive" } },
            { code: { equals: generatedCode, mode: "insensitive" } },
          ],
        },
      });

      if (existingRole) {
        assignedRoleId = existingRole.id;
        assignedRoleCode = existingRole.code;
      } else {
        const newRoleRecord = await prisma.customRole.create({
          data: {
            name: cleanRoleName,
            code: generatedCode || `ROLE_${Date.now()}`,
            description: newRoleDescription ? String(newRoleDescription).trim() : null,
            permissions: JSON.stringify(normalizedPermissions),
            isSystem: false,
          },
        });
        assignedRoleId = newRoleRecord.id;
        assignedRoleCode = newRoleRecord.code;
        createdCustomRole = {
          id: newRoleRecord.id,
          name: newRoleRecord.name,
          code: newRoleRecord.code,
          description: newRoleRecord.description,
          permissions: normalizedPermissions,
        };
      }
    } else if (assignedRoleId) {
      const foundRole = await prisma.customRole.findUnique({
        where: { id: assignedRoleId },
      });
      if (foundRole) {
        assignedRoleCode = foundRole.code;
      }
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRoleCode,
        roleId: assignedRoleId,
        permissions:
          assignedRoleCode === "SUPER_ADMIN"
            ? null
            : JSON.stringify(normalizedPermissions),
        phone: phone ? String(phone).trim() : null,
        status: status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      },
      include: {
        customRole: {
          select: { id: true, name: true, code: true, permissions: true },
        },
      },
    });

    await logAudit({
      userId: session.id,
      action: "CREATE_USER",
      entity: "User",
      entityId: user.id,
      details: {
        email: user.email,
        role: user.role,
        roleName: user.customRole?.name || user.role,
        permissionCount: normalizedPermissions.length,
      },
    });

    return NextResponse.json({
      success: true,
      createdCustomRole,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        roleName:
          user.role === "SUPER_ADMIN"
            ? "Super Admin"
            : user.customRole?.name || user.role.replace(/_/g, " "),
        phone: user.phone,
        status: user.status,
        permissions: resolveUserPermissions(user),
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
