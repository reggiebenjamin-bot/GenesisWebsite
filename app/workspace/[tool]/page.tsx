import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import {
  getWorkspaceTool,
  isWorkspaceToolId,
  workspaceTools,
  type WorkspaceToolId,
} from "@/lib/toolWorkspace";

type WorkspacePageProps = {
  params: Promise<{ tool: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return workspaceTools.map((tool) => ({ tool: tool.id }));
}

export async function generateMetadata({ params }: WorkspacePageProps): Promise<Metadata> {
  const { tool: value } = await params;
  if (!isWorkspaceToolId(value)) return {};
  const tool = getWorkspaceTool(value);
  return {
    title: `${tool.name} | Genesis Products`,
    description: tool.promise,
    alternates: { canonical: tool.landingPath },
  };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { tool: value } = await params;
  if (!isWorkspaceToolId(value)) notFound();

  return <WorkspaceShell toolId={value as WorkspaceToolId} />;
}
