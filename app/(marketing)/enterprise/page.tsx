import type { Metadata } from "next";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { editionByPath } from "@/lib/editions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/enterprise");

const edition = editionByPath("/enterprise")!;

export default function EnterprisePage() {
  return <EditionLanding edition={edition} />;
}
