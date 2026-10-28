import type { Metadata } from "next";
import { Landing } from "@/components/platform/Landing";
import { MarketingFrame } from "@/components/platform/Chrome";
import { platformCopy } from "@/lib/platform/copy";

export const metadata: Metadata = {
  title: "Start",
  description: platformCopy.landing.lede,
};

export default function StartPage() {
  return (
    <MarketingFrame>
      <Landing />
    </MarketingFrame>
  );
}
