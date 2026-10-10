import BookingFlowClient from "./BookingFlowClient";
import { getPublishedPackagesForBooking } from "@/lib/packages-data";

export const metadata = {
  title: "Online Booking | Al-Gafur International Tours And Travels",
  description: "Seamless 7-step booking system for Hajj & Umrah pilgrimages.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [resolvedParams, packages] = await Promise.all([
    searchParams,
    getPublishedPackagesForBooking().catch((err) => {
      console.error("Failed to query packages in BookingPage:", err);
      return [];
    }),
  ]);

  const packageSlug = typeof resolvedParams.package === "string" ? resolvedParams.package : undefined;
  const preselectedRoom = typeof resolvedParams.room === "string" ? resolvedParams.room : undefined;

  return (
    <BookingFlowClient
      packages={packages}
      defaultSlug={packageSlug}
      defaultRoom={preselectedRoom}
    />
  );
}

