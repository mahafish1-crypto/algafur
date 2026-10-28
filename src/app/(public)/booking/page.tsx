import BookingFlowClient from "./BookingFlowClient";
import { getPublishedPackagesForBooking } from "@/lib/packages-data";
import { getSiteSettings } from "@/lib/settings";

export const metadata = {
  title: "Book Your Pilgrimage | AL GAFUR INTERNATIONAL TOURS AND TRAVELS",
  description:
    "Submit your Hajj or Umrah booking enquiry. Our travel advisors will contact you to confirm availability and assist with your sacred journey.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [resolvedParams, packages, settings] = await Promise.all([
    searchParams,
    getPublishedPackagesForBooking().catch((err) => {
      console.error("Failed to query packages in BookingPage:", err);
      return [];
    }),
    getSiteSettings().catch(() => ({})),
  ]);

  const packageSlug =
    typeof resolvedParams.package === "string"
      ? resolvedParams.package
      : undefined;
  const preselectedRoom =
    typeof resolvedParams.room === "string" ? resolvedParams.room : undefined;

  return (
    <BookingFlowClient
      packages={packages}
      defaultSlug={packageSlug}
      defaultRoom={preselectedRoom}
      settings={settings}
    />
  );
}
