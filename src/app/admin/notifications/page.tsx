import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";
import AdminNotificationsClient from "./AdminNotificationsClient";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const session = await getSession();
  if (!session || !canAccessAdmin(session)) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Extract lead IDs from notification links (/admin/crm/leads/<id>)
  const leadIds = Array.from(
    new Set(
      notifications
        .map((n) => {
          const match = n.link?.match(/\/admin\/crm\/leads\/([a-zA-Z0-9_-]+)/);
          return match ? match[1] : null;
        })
        .filter((id): id is string => Boolean(id))
    )
  );

  const leads =
    leadIds.length > 0
      ? await prisma.lead.findMany({
          where: { id: { in: leadIds } },
          select: {
            id: true,
            leadNumber: true,
            name: true,
            mobile: true,
            email: true,
            packageInterest: true,
            status: true,
            source: true,
            createdAt: true,
          },
        })
      : [];

  const leadMap = new Map(leads.map((l) => [l.id, l]));

  const serializedNotifications = notifications.map((n) => {
    const match = n.link?.match(/\/admin\/crm\/leads\/([a-zA-Z0-9_-]+)/);
    const leadId = match ? match[1] : null;
    const lead = leadId ? leadMap.get(leadId) : null;

    return {
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      link: n.link || (lead ? `/admin/crm/leads/${lead.id}` : "/admin/crm/leads"),
      createdAt: n.createdAt.toISOString(),
      lead: lead
        ? {
            id: lead.id,
            leadCode: lead.leadNumber,
            name: lead.name,
            phone: lead.mobile,
            email: lead.email || "",
            packageInterest: lead.packageInterest || "General Inquiry",
            status: lead.status,
            source: lead.source,
          }
        : null,
    };
  });

  return (
    <AdminNotificationsClient initialNotifications={serializedNotifications} />
  );
}
