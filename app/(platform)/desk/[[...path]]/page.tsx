import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeskApp } from "@/components/platform/lending/DeskApp";
import { fundingDisclaimer } from "@/lib/platform/copy";
import { resolveDesk } from "@/lib/platform/lending/routes";

export const metadata: Metadata = {
  title: "Lending pack",
  description: fundingDisclaimer,
  robots: { index: false, follow: false },
};

export default async function DeskPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  const screen = resolveDesk(path);
  if (!screen) notFound();
  return <DeskApp screen={screen} />;
}
