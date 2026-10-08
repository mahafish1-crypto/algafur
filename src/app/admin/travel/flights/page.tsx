import React from "react";
import prisma from "@/lib/db";
import AdminFlightsClient from "./AdminFlightsClient";

export const metadata = {
  title: "Flight Schedules & PNR Registry | AL-GAFUR Admin",
  description: "Monitor direct flights, airline group PNRs, and baggage quotas.",
};

export default async function AdminFlightsPage() {
  const flights = await prisma.flight.findMany({
    orderBy: { departureDate: "asc" },
  });

  return <AdminFlightsClient initialFlights={JSON.parse(JSON.stringify(flights))} />;
}

