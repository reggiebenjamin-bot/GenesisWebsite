import type { Metadata } from "next";
import { BorrowerStatus } from "@/components/platform/BorrowerStatus";
import { platformCopy } from "@/lib/platform/copy";

export const metadata: Metadata = {
  title: "Deal status",
  description: platformCopy.landing.faqs[2]?.a,
};

export default function DeskStatusPage() {
  return <BorrowerStatus />;
}
