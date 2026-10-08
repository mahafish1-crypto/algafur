import prisma from "@/lib/db";
import PackagesClientView from "./PackagesClientView";

export const dynamic = "force-dynamic";

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

  let packages: any[] = [];
  try {
    packages = await prisma.package.findMany({
      where,
      include: {
        inclusions: true,
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("Failed to query packages:", err);
  }

  return <PackagesClientView initialPackages={packages} />;
}

