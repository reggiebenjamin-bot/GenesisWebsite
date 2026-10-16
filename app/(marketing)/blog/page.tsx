import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, Sheet } from "@/components/ui/Blocks";
import { Eyebrow, PageIntro } from "@/components/ui/Section";
import { blogPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/blog");

export default function BlogPage() {
  return (
    <>
      <JsonLd
        data={graph(
          {
            "@type": "Blog",
            name: "Genesis AI Blog",
            url: absoluteUrl("/blog"),
            blogPost: blogPosts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              url: absoluteUrl(`/blog/${post.slug}`),
              datePublished: post.date,
            })),
          },
          breadcrumbSchema("/blog"),
        )}
      />

      <PageIntro
        eyebrow="Blog"
        title="Real estate operations, written plainly."
        description="Practical notes on email deliverability, client data, deal flow, and putting AI to work inside brokerages, teams, and investor operations."
      />

      <Sheet surface="paper" aria-label="Posts" className="site-section">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card as="li" key={post.slug} className="flex flex-col p-0 overflow-hidden">
              <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-gold">
                <div className="relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-[clamp(22px,2.4vw,32px)]">
                  <Eyebrow className="text-gold-dark">{post.tag}</Eyebrow>
                  <h2 className="mt-3 text-[1.35rem] leading-[1.2] tracking-[-0.02em] text-balance">{post.title}</h2>
                  <p className="mt-3 text-[0.95rem] text-ink/68">{post.description}</p>
                  <p className="mt-auto pt-5 font-display text-[0.7rem] tracking-[0.12em] text-ink/55 uppercase">
                    <time dateTime={post.date}>{post.date}</time> · {post.readTime}
                  </p>
                </div>
              </Link>
            </Card>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
