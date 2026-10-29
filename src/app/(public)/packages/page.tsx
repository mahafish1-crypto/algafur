import PackagesClientView from "./PackagesClientView";
import { getPublishedPackagesCatalog } from "@/lib/packages-data";

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [resolvedParams, allPackages] = await Promise.all([
    searchParams,
    getPublishedPackagesCatalog().catch((err) => {
      console.error("Failed to query packages:", err);
      return [];
    }),
  ]);

  const categoryParam = typeof resolvedParams.category === "string" 
    ? resolvedParams.category 
    : (typeof resolvedParams.type === "string" ? resolvedParams.type : "ALL");

  const durationParam = typeof resolvedParams.duration === "string" 
    ? resolvedParams.duration 
    : "ALL";

  return (
    <PackagesClientView
      initialPackages={allPackages}
      initialCategory={categoryParam}
      initialDuration={durationParam}
    />
  );
}

