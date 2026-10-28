import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkApp } from "@/components/platform/WorkApp";
import { parseWorkSection, sectionTitle } from "@/lib/platform/desk";
import { platformCopy } from "@/lib/platform/copy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}): Promise<Metadata> {
  const { section } = await params;
  const parsed = parseWorkSection(section);
  return {
    title: parsed ? sectionTitle(parsed) : "Go to work",
    description: platformCopy.work.lede,
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section } = await params;
  const parsed = parseWorkSection(section);
  if (!parsed) notFound();
  return <WorkApp section={parsed} />;
}
