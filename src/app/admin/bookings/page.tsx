import prisma from "@/lib/db";
import BookingsListClient from "./BookingsListClient";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";

export const revalidate = 0;

export default async function BookingsPage() {
  const { allowed, session } = await verifyModuleAccess("bookings");
  if (!allowed) return <AccessDeniedView moduleKey="bookings" session={session} />;
  const bookings = await prisma.booking.findMany({
    take: 200,
    include: {
      customer: true,
      package: true,
      departureGroup: true,
      travellers: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <BookingsListClient initialBookings={bookings} />;
}

