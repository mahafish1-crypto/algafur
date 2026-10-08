import prisma from "@/lib/db";
import PackagesClientView from "./PackagesClientView";

export const revalidate = 60;

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const typeFilter = typeof resolvedParams.type === "string" ? resolvedParams.type : undefined;
  const durationFilter = typeof resolvedParams.duration === "string" ? resolvedParams.duration : undefined;

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  };

  if (typeFilter && typeFilter !== "ALL") {
    where.type = typeFilter;
  }

  if (durationFilter && durationFilter !== "ALL") {
    where.durationDays = parseInt(durationFilter);
  }

  const packages = await prisma.package.findMany({
    where,
    include: {
      inclusions: true,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return <PackagesClientView initialPackages={packages} />;
}

