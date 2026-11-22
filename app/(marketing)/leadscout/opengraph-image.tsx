import { ogCard, ogSize } from "@/components/seo/ogCard";

export const alt = "Leadscout consult";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: "Leadscout",
    title: "Request a Leadscout consult.",
    subtitle: "Tell us about your operation. This page does not start checkout.",
    footer: "Genesis is software",
  });
}
