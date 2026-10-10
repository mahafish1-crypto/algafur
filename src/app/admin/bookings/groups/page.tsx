import prisma from "@/lib/db";
import DepartureGroupsClient from "./DepartureGroupsClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const revalidate = 0;

export default async function DepartureGroupsPage() {
  const { allowed, session } = await verifyModuleAccess("departure_groups");
  if (!allowed) return <AccessDeniedView moduleKey="departure_groups" session={session} />;
  const groups = await prisma.departureGroup.findMany({
    include: {
      package: true,
      flight: true,
      bookings: {
        include: {
          customer: true,
          travellers: true,
          documents: true,
          visaApplications: true,
        },
      },
    },
    orderBy: { departureDate: "asc" },
  });

  return <DepartureGroupsClient initialGroups={groups} />;
}

