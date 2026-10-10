import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import CustomerDashboardClient from "./CustomerDashboardClient";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Find customer associated strictly with this logged in user
  let customer = null;

  if (session.customerId) {
    customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
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
  }

  if (!customer && session.email) {
    customer = await prisma.customer.findFirst({
      where: { email: session.email.toLowerCase() },
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
  }

  if (!customer) {
    const userRecord = await prisma.user.findUnique({
      where: { id: session.id },
      select: { phone: true },
    });

    if (userRecord?.phone) {
      customer = await prisma.customer.findFirst({
        where: { phone: userRecord.phone },
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
    }
  }

  const leadFilterConditions: any[] = [];
  if (customer?.id) {
    leadFilterConditions.push({ customerId: customer.id });
  }
  if (customer?.phone) {
    leadFilterConditions.push({ mobile: customer.phone });
  }
  if (session.email) {
    leadFilterConditions.push({ email: session.email.toLowerCase() });
  }

  const leads =
    leadFilterConditions.length > 0
      ? await prisma.lead.findMany({
          where: { OR: leadFilterConditions },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [];

  return <CustomerDashboardClient session={session} customer={customer} leads={leads} />;
}
