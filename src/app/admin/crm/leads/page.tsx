import prisma from "@/lib/db";
import LeadsPipelineClient from "./LeadsPipelineClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const revalidate = 0;

export default async function LeadsPage() {
  const { allowed, session } = await verifyModuleAccess("leads");
  if (!allowed)
    return <AccessDeniedView moduleKey="leads" session={session} />;

  const [leads, users, packages] = await Promise.all([
    prisma.lead.findMany({
      take: 300,
      include: {
        assignedTo: { select: { id: true, name: true } },
        followUps: {
          orderBy: { date: "desc" },
          select: { id: true, date: true, time: true, status: true, type: true },
        },
        _count: { select: { activities: true, followUps: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, role: true },
    }),
    prisma.package.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <LeadsPipelineClient
      initialLeads={JSON.parse(JSON.stringify(leads))}
      users={JSON.parse(JSON.stringify(users))}
      packages={JSON.parse(JSON.stringify(packages))}
    />
  );
}
