import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import AgentDashboardClient from "./AgentDashboardClient";

export default async function AgentDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Find agent profile
  const agent = await prisma.agent.findFirst({
    where: {
      OR: [
        { userId: session.id },
        { email: session.email },
        { agentCode: "ALA-2026-001" }, // Demo fallback for agent demo account
      ],
    },
    include: {
      customers: {
        include: {
          bookings: {
            include: { package: true },
          },
        },
      },
      bookings: {
        include: {
          package: true,
          customer: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const packages = await prisma.package.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, name: true, slug: true, basePrice: true, departureDate: true },
  });

  return <AgentDashboardClient session={session} agent={agent} packages={packages} />;
}

