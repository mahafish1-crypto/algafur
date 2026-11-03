import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import PackageWizardBuilder from "@/components/admin/PackageWizardBuilder";

export const revalidate = 0;

export const metadata = {
  title: "Create Tour Package | AL GAFUR CMS",
  description: "Create and publish a new Umrah, Ramadan, or Hajj tour package with complete pricing, hotels, and flight details.",
};

export default async function CreatePackagePage() {
  const { allowed, session } = await verifyModuleAccess("packages");
  if (!allowed) {
    return <AccessDeniedView moduleKey="packages" session={session} />;
  }

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

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Compass className="w-4 h-4 text-gold-400" />
          <span>Tour Package Builder Wizard</span>
        </div>
      </div>

      {/* Main Full-Page Package Wizard */}
      <PackageWizardBuilder isFullPage={true} />
    </div>
  );
}

