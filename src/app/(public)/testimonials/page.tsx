import React from "react";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { getPublishedTestimonials } from "@/lib/packages-data";

export const revalidate = 60;

export const metadata = {
  title: "Pilgrim Testimonials & Reviews | AL GAFUR INTERNATIONAL TOURS AND TRAVELS",
  description: "Read real experiences from verified pilgrims who travelled for Hajj & Umrah with AL GAFUR INTERNATIONAL TOURS AND TRAVELS.",
};

export default async function TestimonialsPage() {
  const testimonials = await getPublishedTestimonials().catch(() => []);

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <TestimonialsSection testimonials={testimonials} />
    </div>
  );
}

