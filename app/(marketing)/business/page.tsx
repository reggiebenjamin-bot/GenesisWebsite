import type { Metadata } from "next";
import { EditionLanding } from "@/components/sections/EditionLanding";
import { editionByPath } from "@/lib/editions";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/business");

const edition = editionByPath("/business")!;

export default function BusinessPage() {
  return <EditionLanding edition={edition} />;
}
