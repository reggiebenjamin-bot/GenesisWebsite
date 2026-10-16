import { ogCard, ogSize } from "@/components/seo/ogCard";

export const alt = "The Genesis AI blog on real estate operations and AI";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: "Genesis AI · Blog",
    title: "Real estate operations, written plainly.",
    subtitle: "Email deliverability, client data, deal flow, and AI inside real estate businesses.",
    footer: "geai.us/blog",
  });
}
