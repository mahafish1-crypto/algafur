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

  // Extract YouTube submission IDs from notification links (/admin/youtube-leads/responses/<id>)
  const ytSubmissionIds = Array.from(
    new Set(
      notifications
        .map((n) => {
          const match = n.link?.match(
            /\/admin\/youtube-leads\/responses\/([a-zA-Z0-9_-]+)/
          );
          return match ? match[1] : null;
        })
        .filter((id): id is string => Boolean(id))
    )
  );

  const [leads, ytSubmissions] = await Promise.all([
    leadIds.length > 0
      ? prisma.lead.findMany({
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
      : Promise.resolve([]),
    ytSubmissionIds.length > 0
      ? prisma.leadFormSubmission.findMany({
          where: { id: { in: ytSubmissionIds } },
          select: {
            id: true,
            submissionCode: true,
            name: true,
            phone: true,
            email: true,
            interestedIn: true,
            formTitle: true,
            status: true,
            leadSource: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const leadMap = new Map(leads.map((l) => [l.id, l]));
  const ytMap = new Map(ytSubmissions.map((s) => [s.id, s]));

  const serializedNotifications = notifications.map((n) => {
    const matchCrm = n.link?.match(/\/admin\/crm\/leads\/([a-zA-Z0-9_-]+)/);
    const leadId = matchCrm ? matchCrm[1] : null;
    const lead = leadId ? leadMap.get(leadId) : null;

    const matchYt = n.link?.match(
      /\/admin\/youtube-leads\/responses\/([a-zA-Z0-9_-]+)/
    );
    const ytId = matchYt ? matchYt[1] : null;
    const ytSub = ytId ? ytMap.get(ytId) : null;

    return {
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      link:
        n.link ||
        (ytSub
          ? `/admin/youtube-leads/responses/${ytSub.id}`
          : lead
          ? `/admin/crm/leads/${lead.id}`
          : "/admin/crm/leads"),
      createdAt: n.createdAt.toISOString(),
      lead: ytSub
        ? {
            id: ytSub.id,
            leadCode: ytSub.submissionCode,
            name: ytSub.name,
            phone: ytSub.phone,
            email: ytSub.email || "",
            packageInterest:
              ytSub.interestedIn || ytSub.formTitle || "YouTube Lead",
            status: ytSub.status,
            source: ytSub.leadSource,
          }
        : lead
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
