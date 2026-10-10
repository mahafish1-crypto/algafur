import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireSuperAdmin } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import {
  normalizePermissionList,
  parseStoredPermissions,
} from "@/lib/rbac";
import { ensureInitialRolesSeeded } from "@/lib/rbac-server";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin(req);
    if (!auth.authorized) return auth.response;

    await ensureInitialRolesSeeded();

    const roles = await prisma.customRole.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = roles.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      description: r.description,
      permissions: parseStoredPermissions(r.permissions) || [],
      isSystem: r.isSystem,
      userCount: r._count.users,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json({ success: true, roles: formatted });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin(req);
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const name = (body.name || "").trim();
    const description = (body.description || "").trim() || null;
    const rawPermissions: string[] = Array.isArray(body.permissions)
      ? body.permissions
      : [];

    if (!name) {
      return NextResponse.json(
        { error: "Role name is required." },
        { status: 400 }
      );
    }

    const code = (
      body.code ||
      name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
    ).slice(0, 50);

    if (code === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot create a custom role with reserved code SUPER_ADMIN." },
        { status: 400 }
      );
    }

    const existing = await prisma.customRole.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { code: { equals: code, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A custom role with this name or code already exists." },
        { status: 400 }
      );
    }

    const normalizedPermissions = normalizePermissionList(
      rawPermissions.filter((p) => p !== "*")
    );

    const role = await prisma.customRole.create({
      data: {
        name,
        code,
        description,
        permissions: JSON.stringify(normalizedPermissions),
        isSystem: false,
      },
    });

    await logAudit({
      userId: auth.session.id,
      action: "CREATE_CUSTOM_ROLE",
      entity: "CustomRole",
      entityId: role.id,
      details: {
        name: role.name,
        code: role.code,
        permissionCount: normalizedPermissions.length,
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        ...role,
        permissions: normalizedPermissions,
        userCount: 0,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

