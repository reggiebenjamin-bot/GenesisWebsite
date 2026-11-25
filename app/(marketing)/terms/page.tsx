import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/sections/LegalPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/terms");

const sections: readonly LegalSection[] = [
  {
    heading: "The software is provided as is",
    body: [
      "Genesis is software, provided on an as is basis. We work to keep it available and useful, and we do not guarantee any particular result from using it.",
    ],
  },
  {
    heading: "Your responsibilities",
    body: [
      "You are responsible for using Genesis lawfully and for the accuracy of the information you enter. You remain responsible for your own business, legal and financial decisions.",
    ],
  },
  {
    heading: "Payments and accounts",
    body: [
      "Plans and products are billed through Stripe. Sign in may use Clerk. You are responsible for keeping your account credentials secure.",
    ],
  },
  {
    heading: "Classes are education",
    body: [
      "Any Genesis classes are education only. They are not professional, legal, financial or investment advice.",
    ],
  },
];

export default function TermsPage() {
  return <LegalPage path="/terms" eyebrow="Legal" title="Terms of service" sections={sections} />;
}
