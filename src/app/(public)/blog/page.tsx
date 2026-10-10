import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/packages-data";

export const metadata = {
  title: "Pilgrim Guidance Blog | Al-Gafur International Tours And Travels",
  description: "Educational articles, Sunnah du'as, and practical guides for Hajj & Umrah pilgrims.",
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts().catch((err) => {
    console.error("Failed to query blog posts from PostgreSQL:", err);
    return [];
  });

  return (
    <div className="bg-ivory-100/50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Islamic Travel Guidance
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-3">
            Hajj &amp; Umrah Guidance Blog
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2">
            Authentic knowledge prepared by our scholars to help you perform your rituals according to the Sunnah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-premium transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full bg-forest-950">
                  <Image
                    src={post.featuredImage || "/brand/poster.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-forest-950/80 text-gold-300 text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "October 2026"}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-forest-950 hover:text-emerald-800 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                >
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

