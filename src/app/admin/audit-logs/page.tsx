import React from "react";
import prisma from "@/lib/db";
import AdminAuditLogsClient from "./AdminAuditLogsClient";

export const metadata = {
  title: "Audit Logs & Security Trail | AL-GAFUR Admin",
  description: "Complete chronological security audit log of all system operations.",
};

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <AdminAuditLogsClient initialLogs={JSON.parse(JSON.stringify(logs))} />;
}

