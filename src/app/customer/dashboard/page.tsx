import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import CustomerDashboardClient from "./CustomerDashboardClient";

export default async function CustomerDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Find customer associated with user
  let customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { email: session.email },
        { phone: "+91 8888890830" }, // Demo fallback for customer demo
      ],
    },
    include: {
      bookings: {
        include: {
          package: true,
          travellers: true,
          payments: true,
          invoices: true,
          documents: true,
          visaApplications: true,
          bookingFlights: {
            include: { flight: true },
          },
          bookingHotels: {
            include: { hotel: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      documents: true,
      familyMembers: true,
    },
  });

  if (!customer) {
    // Look up any booking to display demo data if needed
    const anyCustomer = await prisma.customer.findFirst({
      include: {
        bookings: {
          include: {
            package: true,
            travellers: true,
            payments: true,
            invoices: true,
            documents: true,
            visaApplications: true,
            bookingFlights: {
              include: { flight: true },
            },
            bookingHotels: {
              include: { hotel: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        documents: true,
        familyMembers: true,
      },
    });
    customer = anyCustomer;
  }

  return <CustomerDashboardClient session={session} customer={customer} />;
}
