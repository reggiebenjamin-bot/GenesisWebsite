import type { Metadata } from "next";
import { LegalDraft, type LegalSection } from "@/components/sections/LegalDraft";
import { contact } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/privacy");

const sections: readonly LegalSection[] = [
  {
    heading: "What we collect",
    body: [
      "We collect the information you give us to provide the software: your account details, the content you enter into Genesis, and the messages you send us.",
      "We also receive basic technical information from your device and browser so the software can load and stay secure.",
    ],
  },
  {
    heading: "Payments",
    body: [
      "Payments are handled by Stripe. When you buy a plan or a product, Stripe processes your payment details. We receive a record of the purchase, not your full card number.",
    ],
  },
  {
    heading: "Sign in",
    body: [
      "Sign in may use Clerk to create and secure your account. Clerk handles your password and the sign in flow on our behalf.",
    ],
  },
  {
    heading: "How we use information",
    body: [
      "We use your information to run the software, support your account, answer your questions, and keep the service working.",
    ],
  },
  {
    heading: "We do not sell personal information",
    body: [
      "We do not sell your personal information. We share it only with the service providers that help us run Genesis, such as Stripe and Clerk, and only as needed to provide the software.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      `You can ask us about the information we hold, ask us to correct it, or opt out of non essential messages. Reach us from the contact page, or email ${contact.email}.`,
    ],
  },
  {
    heading: "This is a draft",
    body: [
      "This draft will be replaced with a reviewed privacy notice after legal review. Until then, treat it as a plain summary of how the software handles information.",
    ],
  },
];

export default function PrivacyPage() {
  return <LegalDraft path="/privacy" eyebrow="Legal" title="Privacy policy" sections={sections} />;
}
