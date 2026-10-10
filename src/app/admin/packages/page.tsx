import prisma from "@/lib/db";
import AdminPackagesClient from "./AdminPackagesClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const revalidate = 0;

export default async function AdminPackagesPage() {
  const { allowed, session } = await verifyModuleAccess("packages");
  if (!allowed) return <AccessDeniedView moduleKey="packages" session={session} />;
  const packages = await prisma.package.findMany({
    take: 100,
    include: {
      inclusions: true,
      itineraries: { orderBy: { dayNumber: "asc" } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminPackagesClient initialPackages={packages} />;
}

