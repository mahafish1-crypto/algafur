import prisma from "@/lib/db";
import BookingsListClient from "./BookingsListClient";

export const revalidate = 0;

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
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

