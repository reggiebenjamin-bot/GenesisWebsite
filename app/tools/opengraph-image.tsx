import { ogCard, ogSize } from "@/components/seo/ogCard";
import { genesisTools, toolsOverview } from "@/lib/offers";

export const alt = "Genesis Tools — focused AI tools for real estate professionals";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: toolsOverview.product,
    title: "Focused AI tools for real estate.",
    subtitle: toolsOverview.headline,
    footer: genesisTools.map((tool) => tool.name).join(" · "),
  });
}
