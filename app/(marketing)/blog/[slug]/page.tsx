import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/blog/Article.module.css";
import { JsonLd } from "@/components/seo/JsonLd";
import { ClosingBand, Sheet } from "@/components/ui/Blocks";
import { ConsultationButton } from "@/components/ui/ConsultationButton";
import { Eyebrow } from "@/components/ui/Section";
import { blogPost, blogPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, graph } from "@/lib/schema";
import { absoluteUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

/* One page per post, generated at build time. Anything else under /blog/ is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const metadata = pageMetadata(`/blog/${slug}`);
  const post = blogPost(slug);
  return post
    ? { ...metadata, openGraph: { ...metadata.openGraph, type: "article", publishedTime: post.date } }
    : metadata;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPost(slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={graph(
          {
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            image: absoluteUrl(post.image),
            url: absoluteUrl(path),
            mainEntityOfPage: absoluteUrl(path),
            author: { "@type": "Person", name: "Reginald Benjamin", jobTitle: "Founder, Genesis AI" },
            publisher: { "@type": "Organization", name: "Genesis AI", url: absoluteUrl("/") },
          },
          breadcrumbSchema(path),
        )}
      />

      <section className="border-b border-line-dark bg-ink pt-[calc(var(--header-height)+90px)] pb-[80px] text-ivory">
        <div className="shell max-w-[980px]">
          <Link href="/blog" className="font-display text-[0.7rem] tracking-[0.14em] text-ivory/60 uppercase hover:text-gold-light">
            ← Blog
          </Link>
          <Eyebrow className="mt-8">{post.tag}</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.2rem,4.8vw,4.2rem)] leading-[1.04] text-balance">{post.title}</h1>
          <p className="mt-6 max-w-2xl text-[1.08rem] text-ivory/72">{post.description}</p>
          <p className="mt-7 font-display text-[0.7rem] tracking-[0.12em] text-ivory/55 uppercase">
            Reginald Benjamin · <time dateTime={post.date}>{post.date}</time> · {post.readTime}
          </p>
        </div>
      </section>

      <Sheet surface="paper" aria-label="Article" className="site-section">
        <div className="mx-auto max-w-[44rem]">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[6px] border border-line-light">
            <Image src={post.image} alt={post.imageAlt} fill priority sizes="(min-width: 768px) 44rem, 100vw" className="object-cover" />
          </div>
          <div className={`${styles.body} mt-12`} dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </Sheet>

      <ClosingBand
        title="See where your operation is losing time."
        line="A no-cost consultation reviews your systems and the manual work creating the most drag."
        actions={<ConsultationButton href="/contact" />}
      />
    </>
  );
}
