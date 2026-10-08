import prisma from "./db";

interface AuditLogParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | string | null;
  ipAddress?: string | null;
}

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: AuditLogParams) {
  try {
    const detailsString =
      typeof details === "object" && details !== null
        ? JSON.stringify(details)
        : details || null;

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        details: detailsString,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

