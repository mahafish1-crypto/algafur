import prisma from "@/lib/db";
import AdminPackagesClient from "./AdminPackagesClient";

export const revalidate = 0;

export default async function AdminPackagesPage() {
  const packages = await prisma.package.findMany({
    take: 100,
    include: {
      inclusions: true,
      itineraries: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminPackagesClient initialPackages={packages} />;
}

