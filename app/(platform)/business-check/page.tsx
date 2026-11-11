import type { Metadata } from "next";
import { BusinessCheck } from "@/components/platform/BusinessCheck";
import { QuietFrame } from "@/components/platform/Chrome";
import { platformCopy } from "@/lib/platform/copy";

export const metadata: Metadata = {
  title: "Texas business check",
  description: platformCopy.check.lede,
};

export default function BusinessCheckPage() {
  return (
    <QuietFrame>
      <BusinessCheck />
    </QuietFrame>
  );
}
