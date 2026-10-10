import React from "react";
import prisma from "@/lib/db";
import AdminFlightsClient from "./AdminFlightsClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const metadata = {
  title: "Flight Schedules & PNR Registry | AL-GAFUR Admin",
  description: "Monitor direct flights, airline group PNRs, and baggage quotas.",
};

export default async function AdminFlightsPage() {
  const { allowed, session } = await verifyModuleAccess("flights");
  if (!allowed) return <AccessDeniedView moduleKey="flights" session={session} />;
  const flights = await prisma.flight.findMany({
    orderBy: { departureDate: "asc" },
  });

  return <AdminFlightsClient initialFlights={JSON.parse(JSON.stringify(flights))} />;
}

