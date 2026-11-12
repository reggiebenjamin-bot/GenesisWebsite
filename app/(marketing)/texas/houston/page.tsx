import type { Metadata } from "next";
import { TexasLanding } from "@/components/sections/TexasLanding";
import { pageMetadata } from "@/lib/metadata";
import { texasLanding } from "@/lib/texasPages";

const PATH = "/texas/houston";

export const metadata: Metadata = pageMetadata(PATH);

export default function Page() {
  return <TexasLanding page={texasLanding(PATH)} />;
}
