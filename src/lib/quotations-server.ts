import prisma from "@/lib/db";

export async function getQuotationFormOptions() {
  const [packages, customers, leads] = await Promise.all([
    prisma.package.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        type: true,
        durationDays: true,
        makkahNights: true,
        madinahNights: true,
        basePrice: true,
        priceQuad: true,
        priceTriple: true,
        priceDouble: true,
        priceSingle: true,
        childPrice: true,
        infantPrice: true,
        makkahHotelName: true,
        madinahHotelName: true,
        makkahDistance: true,
        madinahDistance: true,
        makkahMealPlan: true,
        madinahMealPlan: true,
        airline: true,
        flightType: true,
        departureDate: true,
        departureCity: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        whatsapp: true,
        email: true,
        city: true,
      },
      orderBy: { createdAt: "desc" },
      take: 150,
    }),
    prisma.lead.findMany({
      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
        city: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
      take: 150,
    }),
  ]);

  return {
    packages: JSON.parse(JSON.stringify(packages)),
    customers: JSON.parse(JSON.stringify(customers)),
    leads: JSON.parse(JSON.stringify(leads)),
  };
}
