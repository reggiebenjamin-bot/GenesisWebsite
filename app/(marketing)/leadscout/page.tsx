import type { Metadata } from "next";
import { ConsultPage } from "@/components/sections/ConsultPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/leadscout");

export default function LeadscoutPage() {
  return (
    <ConsultPage
      path="/leadscout"
      eyebrow="Leadscout"
      title="Request a Leadscout consult."
      lede="Tell us about your operation and we will follow up. This page is a consult or demo request. It does not start checkout."
      interest="leadscout"
    />
  );
}
