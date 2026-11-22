import { ogCard, ogSize } from "@/components/seo/ogCard";

export const alt = "Capital Desk consult";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: "Capital Desk",
    title: "A back office consult for brokers.",
    subtitle: "Request a consult or a demo. This page does not start checkout.",
    footer: "Genesis is software",
  });
}
