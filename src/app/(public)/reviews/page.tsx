import React from "react";
import ReviewsClient, { TestimonialItem } from "./ReviewsClient";
import { getPublishedTestimonials, getPublishedPackagesCatalog } from "@/lib/packages-data";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Pilgrim Reviews & Video Testimonials | AL GAFUR INTERNATIONAL",
  description:
    "Read and watch authentic pilgrim experiences and video reflections from blessed journeys to Makkah and Madinah with AL GAFUR INTERNATIONAL TOURS AND TRAVELS.",
};

export default async function ReviewsPage() {
  const [dbTestimonials, allPackages, session] = await Promise.all([
    getPublishedTestimonials().catch(() => []),
    getPublishedPackagesCatalog().catch(() => []),
    getSession().catch(() => null),
  ]);

  const testimonials: TestimonialItem[] = (dbTestimonials || []).map((t) => ({
    id: t.id,
    customerName: t.customerName,
    city: t.city,
    packageTitle: t.packageTitle,
    rating: t.rating,
    reviewText: t.reviewText,
    photo: t.photo,
    videoUrl: t.videoUrl,
    isFeatured: t.isFeatured,
    status: t.status,
    createdAt: t.createdAt,
  }));

  const packages = allPackages.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
  }));

  const currentUser = session
    ? {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      }
    : null;

  return (
    <div className="bg-ivory-100/50 min-h-screen">
      <ReviewsClient
        initialReviews={testimonials}
        packages={packages}
        currentUser={currentUser}
      />
    </div>
  );
}
