import React from "react";
import prisma from "@/lib/db";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import AdminTestimonialsClient from "./AdminTestimonialsClient";

export const metadata = {
  title: "Voices of Blessed Pilgrims | AL-GAFUR Admin",
  description:
    "Manage pilgrim testimonials, reviews, photos, and homepage display status.",
};

export default async function AdminTestimonialsPage() {
  const { allowed, session } = await verifyModuleAccess("settings");
  if (!allowed)
    return <AccessDeniedView moduleKey="settings" session={session} />;

  const [testimonials, packages] = await Promise.all([
    prisma.testimonial.findMany({
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.package.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminTestimonialsClient
      initialTestimonials={JSON.parse(JSON.stringify(testimonials))}
      allPackages={JSON.parse(JSON.stringify(packages))}
    />
  );
}

