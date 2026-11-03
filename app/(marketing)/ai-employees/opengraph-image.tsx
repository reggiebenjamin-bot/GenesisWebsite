import { ogCard, ogSize } from "@/components/seo/ogCard";

export const alt = "Genesis AI Employees. Hawk, Susan, Darius, and Ava work the pipeline every day.";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "AI Employees",
    title: "AI employees.",
    subtitle: "They work your pipeline every day.",
    footer: "Hawk · Susan · Darius · Ava",
  });
}
