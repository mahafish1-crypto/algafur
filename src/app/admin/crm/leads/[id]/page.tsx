import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import LeadDetailClient from "./LeadDetailClient";

export const revalidate = 0;

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const lead = await prisma.lead.findUnique({
    where: { id: resolvedParams.id },
    include: {
      assignedTo: { select: { id: true, name: true, phone: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
      followUps: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
      quotations: true,
    },
  });

  if (!lead) {
    notFound();
  }

  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
  });

  const packages = await prisma.package.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, name: true, slug: true, basePrice: true },
  });

  return <LeadDetailClient lead={lead} users={users} packages={packages} />;
}

