import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireSuperAdmin } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { normalizePermissionList, parseStoredPermissions } from "@/lib/rbac";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdmin(req);
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;
    const existing = await prisma.customRole.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }

    const body = await req.json();
    const name = body.name !== undefined ? String(body.name).trim() : existing.name;
    const description =
      body.description !== undefined
        ? String(body.description).trim() || null
        : existing.description;

    const rawPermissions: string[] = Array.isArray(body.permissions)
      ? body.permissions
      : parseStoredPermissions(existing.permissions) || [];

    const normalizedPermissions = normalizePermissionList(
      rawPermissions.filter((p) => p !== "*")
    );

    const updated = await prisma.customRole.update({
      where: { id },
      data: {
        name,
        description,
        permissions: JSON.stringify(normalizedPermissions),
      },
      include: {
        _count: { select: { users: true } },
      },
    });

    // Optionally sync users who are assigned to this role so role updates propagate
    if (body.syncAssignedUsers !== false) {
      await prisma.user.updateMany({
        where: { roleId: id, role: { not: "SUPER_ADMIN" } },
        data: {
          permissions: JSON.stringify(normalizedPermissions),
        },
      });
    }

    await logAudit({
      userId: auth.session.id,
      action: "UPDATE_CUSTOM_ROLE",
      entity: "CustomRole",
      entityId: updated.id,
      details: {
        name: updated.name,
        permissionCount: normalizedPermissions.length,
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        id: updated.id,
        name: updated.name,
        code: updated.code,
        description: updated.description,
        permissions: normalizedPermissions,
        isSystem: updated.isSystem,
        userCount: updated._count.users,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdmin(req);
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;
    const existing = await prisma.customRole.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }

    if (existing.code === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete Super Admin role." },
        { status: 400 }
      );
    }

    await prisma.customRole.delete({ where: { id } });

    await logAudit({
      userId: auth.session.id,
      action: "DELETE_CUSTOM_ROLE",
      entity: "CustomRole",
      entityId: id,
      details: { name: existing.name, code: existing.code },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

