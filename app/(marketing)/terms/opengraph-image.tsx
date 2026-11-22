import { ogCard, ogSize } from "@/components/seo/ogCard";

export const alt = "Genesis terms of service";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: "Legal",
    title: "Terms of service",
    subtitle: "The software is provided as is. You are responsible for lawful use.",
    footer: "Genesis is software",
  });
}
