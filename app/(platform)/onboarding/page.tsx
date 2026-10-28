import type { Metadata } from "next";
import { QuietFrame } from "@/components/platform/Chrome";
import { Wizard } from "@/components/platform/Wizard";
import { platformCopy } from "@/lib/platform/copy";

export const metadata: Metadata = {
  title: "Onboarding",
  description: platformCopy.landing.steps[1]?.body,
};

export default function OnboardingPage() {
  return (
    <QuietFrame>
      <Wizard entry="onboarding" />
    </QuietFrame>
  );
}
