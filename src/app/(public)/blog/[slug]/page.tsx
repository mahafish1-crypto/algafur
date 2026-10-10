import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getPublishedBlogPostBySlug } from "@/lib/packages-data";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  try {
    const post = await getPublishedBlogPostBySlug(resolvedParams.slug);
    if (!post) return { title: "Post Not Found" };
    return {
      title: `${post.title} | Al-Gafur Tours`,
      description: post.excerpt,
    };
  } catch {
    return { title: "Pilgrim Guidance | Al-Gafur Tours" };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPublishedBlogPostBySlug(resolvedParams.slug).catch((err) => {
    console.error("Failed to query blog post:", err);
    return null;
  });

  if (!post) notFound();

  return (
    <div className="bg-ivory-100/50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Link href="/">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/blog">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-forest-950 font-semibold truncate">{post.title}</span>
        </div>

        <article className="bg-white rounded-3xl p-6 sm:p-12 border border-neutral-200 shadow-sm space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-forest-950">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-neutral-400">
              <span>By {post.author}</span>
              <span>•</span>
              <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "October 2026"}</span>
            </div>
          </div>

          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-forest-950">
            <Image
              src={post.featuredImage || "/brand/poster.jpg"}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="text-neutral-700 leading-relaxed space-y-4 text-sm sm:text-base font-serif">
            <p className="text-lg font-sans font-medium text-forest-950 leading-relaxed border-l-4 border-gold-500 pl-4">
              {post.excerpt}
            </p>
            <div className="pt-4 font-sans text-xs sm:text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
              {post.content}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

