import React from "react";
import prisma from "@/lib/db";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export const metadata = {
  title: "Pilgrim Testimonials & Reviews | Al-Gafur International Tours And Travels",
  description: "Read real experiences from verified pilgrims who travelled for Hajj & Umrah with Al-Gafur Tours.",
};

export default async function TestimonialsPage() {
  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <TestimonialsSection />
    </div>
  );
}

