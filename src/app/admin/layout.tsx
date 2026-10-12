import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";
import { getSiteSettings } from "@/lib/settings";
import AdminLayoutClient from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!canAccessAdmin(session)) {
    if (session.role === "CUSTOMER") redirect("/customer/dashboard");
    if (session.role === "AGENT") redirect("/agent/dashboard");
    redirect("/login");
  }

  // Fetch recent notifications, unread count, and settings in parallel
  const [notifications, settings] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.id },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    getSiteSettings(),
  ]);

  const siteLogo = settings.site_logo || settings.header_logo || "";

  const serializedNotifications = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    link: n.link || "/admin/crm/leads",
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <AdminLayoutClient
      session={session}
      initialNotifications={serializedNotifications}
      siteLogo={siteLogo}
    >
      {children}
    </AdminLayoutClient>
  );
}
