import { ogCard, ogSize } from "@/components/seo/ogCard";
import { genesisTools } from "@/lib/offers";

export const alt = "A Genesis Tools product from Genesis AI";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return genesisTools.map((tool) => ({ slug: tool.id }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = genesisTools.find((candidate) => candidate.id === slug) ?? genesisTools[0];

  return ogCard({
    eyebrow: `Genesis Tools · ${tool.number}`,
    title: tool.name,
    subtitle: tool.tagline,
    footer: `${tool.price.display} per ${tool.price.unit}`,
  });
}
