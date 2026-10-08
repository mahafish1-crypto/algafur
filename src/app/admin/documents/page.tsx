import prisma from "@/lib/db";
import AdminDocumentsClient from "./AdminDocumentsClient";

export const revalidate = 0;

export default async function AdminDocumentsPage() {
  const documents = await prisma.document.findMany({
    include: {
      customer: true,
      booking: { select: { bookingNumber: true } },
      verifiedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminDocumentsClient initialDocs={documents} />;
}

