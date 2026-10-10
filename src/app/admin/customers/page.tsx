import prisma from "@/lib/db";
import CustomersClient from "./CustomersClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const revalidate = 0;

export default async function CustomersPage() {
  const { allowed, session } = await verifyModuleAccess("customers");
  if (!allowed) return <AccessDeniedView moduleKey="customers" session={session} />;
  const customers = await prisma.customer.findMany({
    take: 200,
    include: {
      familyMembers: true,
      bookings: {
        include: { package: true },
      },
      documents: true,
      visaApplications: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <CustomersClient initialCustomers={customers} />;
}

