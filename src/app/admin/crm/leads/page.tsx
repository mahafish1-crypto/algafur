import prisma from "@/lib/db";
import LeadsPipelineClient from "./LeadsPipelineClient";

export const revalidate = 0;

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    take: 250,
    include: {
      assignedTo: { select: { id: true, name: true } },
      _count: { select: { activities: true, followUps: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, role: true },
  });

  return <LeadsPipelineClient initialLeads={leads} users={users} />;
}

