import prisma from "@/lib/db";
import DepartureGroupsClient from "./DepartureGroupsClient";

export const revalidate = 0;

export default async function DepartureGroupsPage() {
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

