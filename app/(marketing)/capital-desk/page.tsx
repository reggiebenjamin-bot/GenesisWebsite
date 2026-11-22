import type { Metadata } from "next";
import { ConsultPage } from "@/components/sections/ConsultPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/capital-desk");

export default function CapitalDeskPage() {
  return (
    <ConsultPage
      path="/capital-desk"
      eyebrow="Capital Desk"
      title="A back office consult for brokers."
      lede="Capital Desk is a back office for brokers. Request a consult or a demo. This page does not start checkout."
      interest="capital-desk"
    />
  );
}
