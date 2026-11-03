import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Compass, Eye } from "lucide-react";
import prisma from "@/lib/db";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import PackageWizardBuilder from "@/components/admin/PackageWizardBuilder";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await prisma.package.findUnique({
    where: { id },
    select: { name: true },
  });

  return {
    title: pkg ? `Edit ${pkg.name} | AL GAFUR CMS` : "Edit Package | AL GAFUR CMS",
  };
}

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { allowed, session } = await verifyModuleAccess("packages");
  if (!allowed) {
    return <AccessDeniedView moduleKey="packages" session={session} />;
  }

  const { id } = await params;

  const pkg = await prisma.package.findUnique({
    where: { id },
    include: {
      inclusions: true,
      itineraries: { orderBy: { dayNumber: "asc" } },
      makkahHotel: true,
      madinahHotel: true,
    },
  });

  if (!pkg) {
    notFound();
  }

  // Safe JSON serialization for client component boundary
  const serializedPkg = JSON.parse(JSON.stringify(pkg));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/packages"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gold-400" />
          <span>Back to Packages Catalog</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/packages/${pkg.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-gold-400 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Public Page ↗</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <Compass className="w-4 h-4 text-gold-400" />
            <span>Editing: {pkg.name}</span>
          </div>
        </div>
      </div>

      {/* Main Full-Page Package Wizard */}
      <PackageWizardBuilder initialPackage={serializedPkg} isFullPage={true} />
    </div>
  );
}

