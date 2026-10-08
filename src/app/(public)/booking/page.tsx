import prisma from "@/lib/db";
import BookingFlowClient from "./BookingFlowClient";

export const metadata = {
  title: "Online Booking | Al-Gafur International Tours And Travels",
  description: "Seamless 7-step booking system for Hajj & Umrah pilgrimages.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const packageSlug = typeof resolvedParams.package === "string" ? resolvedParams.package : undefined;
  const preselectedRoom = typeof resolvedParams.room === "string" ? resolvedParams.room : undefined;

  const packages = await prisma.package.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      name: true,
      durationDays: true,
      basePrice: true,
      priceQuad: true,
      priceTriple: true,
      priceDouble: true,
      departureDate: true,
      departureCity: true,
      totalSeats: true,
      bookedSeats: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <BookingFlowClient
      packages={packages}
      defaultSlug={packageSlug}
      defaultRoom={preselectedRoom}
    />
  );
}

