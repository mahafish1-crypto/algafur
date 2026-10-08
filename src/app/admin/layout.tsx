import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";
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

  if (!canAccessAdmin(session.role)) {
    if (session.role === "CUSTOMER") redirect("/customer/dashboard");
    if (session.role === "AGENT") redirect("/agent/dashboard");
    redirect("/login");
  }

  // Fetch unread notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: session.id, isRead: false },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminLayoutClient session={session} initialNotifications={notifications}>
      {children}
    </AdminLayoutClient>
  );
}

