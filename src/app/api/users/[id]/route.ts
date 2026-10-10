import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireSuperAdmin } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { normalizePermissionList, resolveUserPermissions } from "@/lib/rbac";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdmin(req);
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await context.params;
    const target = await prisma.user.findUnique({
      where: { id },
      include: {
        customRole: { select: { id: true, name: true, code: true } },
      },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const body = await req.json();

    // Super Admin safety check: never allow removing, deactivating, or demoting the last active SUPER_ADMIN
    const isTargetActiveSuperAdmin =
      target.role === "SUPER_ADMIN" && target.status === "ACTIVE";
    const wouldDemoteSuperAdmin =
      (body.role !== undefined && body.role !== "SUPER_ADMIN") ||
      (body.roleId !== undefined && body.roleId !== null && body.role !== "SUPER_ADMIN") ||
      body.revokeAccess === true;
    const wouldDeactivateSuperAdmin =
      (body.status !== undefined && body.status !== "ACTIVE") ||
      body.revokeAccess === true;

    if (
      isTargetActiveSuperAdmin &&
      (wouldDemoteSuperAdmin || wouldDeactivateSuperAdmin)
    ) {
      const otherActiveSuperAdmins = await prisma.user.count({
        where: {
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          id: { not: id },
        },
      });
      if (otherActiveSuperAdmins === 0) {
        return NextResponse.json(
          {
            error:
              "Cannot deactivate, demote, or revoke the last active Super Admin account.",
          },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const cleanName = String(body.name).trim();
      if (!cleanName) {
        return NextResponse.json(
          { error: "Name cannot be empty." },
          { status: 400 }
        );
      }
      updateData.name = cleanName;
    }

    if (body.email !== undefined) {
      const cleanEmail = String(body.email).toLowerCase().trim();
      if (!cleanEmail) {
        return NextResponse.json(
          { error: "Email cannot be empty." },
          { status: 400 }
        );
      }
      if (cleanEmail !== target.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (emailExists) {
          return NextResponse.json(
            { error: "Another user with this email already exists." },
            { status: 400 }
          );
        }
        updateData.email = cleanEmail;
      }
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone ? String(body.phone).trim() : null;
    }

    if (body.password !== undefined && String(body.password).trim() !== "") {
      const rawPass = String(body.password);
      if (rawPass.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(rawPass, 10);
    }

    if (body.status !== undefined) {
      const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"];
      if (validStatuses.includes(body.status)) {
        updateData.status = body.status;
      }
    }

    if (body.roleId !== undefined) {
      if (body.roleId === null || body.roleId === "") {
        updateData.roleId = null;
        if (body.role) {
          updateData.role = String(body.role);
        }
      } else {
        const customRole = await prisma.customRole.findUnique({
          where: { id: String(body.roleId) },
        });
        if (customRole) {
          updateData.roleId = customRole.id;
          updateData.role = customRole.code;
        }
      }
    } else if (body.role !== undefined) {
      updateData.role = String(body.role);
      if (body.role === "SUPER_ADMIN") {
        updateData.roleId = null;
        updateData.permissions = null;
      }
    }

    if (Array.isArray(body.permissions)) {
      const normalized = normalizePermissionList(
        body.permissions.filter((p: string) => p !== "*")
      );
      updateData.permissions =
        (updateData.role || target.role) === "SUPER_ADMIN"
          ? null
          : JSON.stringify(normalized);
    }

    if (body.revokeAccess === true) {
      updateData.status = "INACTIVE";
      updateData.permissions = JSON.stringify([]);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        customRole: {
          select: { id: true, name: true, code: true, permissions: true },
        },
      },
    });

    await logAudit({
      userId: session.id,
      action: body.revokeAccess
        ? "REVOKE_USER_ACCESS"
        : body.password
        ? "RESET_USER_PASSWORD"
        : "UPDATE_USER",
      entity: "User",
      entityId: updated.id,
      details: {
        email: updated.email,
        role: updated.role,
        status: updated.status,
        updatedFields: Object.keys(updateData).filter(
          (k) => k !== "passwordHash"
        ),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        roleId: updated.roleId,
        roleName:
          updated.role === "SUPER_ADMIN"
            ? "Super Admin"
            : updated.customRole?.name || updated.role.replace(/_/g, " "),
        phone: updated.phone,
        status: updated.status,
        permissions: resolveUserPermissions(updated),
        lastLogin: updated.lastLogin,
        createdAt: updated.createdAt,
      },
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdmin(req);
    if (!auth.authorized) return auth.response;
    const session = auth.session;

    const { id } = await context.params;
    if (id === session.id) {
      return NextResponse.json(
        { error: "You cannot delete your own active Super Admin account." },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (target.role === "SUPER_ADMIN" && target.status === "ACTIVE") {
      const otherActiveSuperAdmins = await prisma.user.count({
        where: {
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          id: { not: id },
        },
      });
      if (otherActiveSuperAdmins === 0) {
        return NextResponse.json(
          { error: "Cannot delete the last active Super Admin account." },
          { status: 400 }
        );
      }
    }

    // Safely detach optional relations before deletion, or deactivate if historical records require retention
    try {
      await prisma.auditLog.updateMany({
        where: { userId: id },
        data: { userId: null },
      });
      await prisma.lead.updateMany({
        where: { assignedToId: id },
        data: { assignedToId: null },
      });
      await prisma.user.delete({ where: { id } });
    } catch {
      // If user has non-nullable historical records (e.g., created quotations/payments), revoke & deactivate instead of losing financial history
      await prisma.user.update({
        where: { id },
        data: {
          status: "INACTIVE",
          permissions: JSON.stringify([]),
        },
      });
      return NextResponse.json({
        success: true,
        deactivatedInstead: true,
        message:
          "User has linked historical CRM records; access has been permanently revoked and account deactivated to preserve audit history.",
      });
    }

    await logAudit({
      userId: session.id,
      action: "DELETE_USER",
      entity: "User",
      entityId: id,
      details: { email: target.email, role: target.role },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

