import type { Metadata } from "next";
import { QuietFrame } from "@/components/platform/Chrome";
import { Wizard } from "@/components/platform/Wizard";
import { platformCopy } from "@/lib/platform/copy";

export const metadata: Metadata = {
  title: "Sign up",
  description: platformCopy.wizard.prompts.nameHelp,
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ vertical?: string | string[] }>;
}) {
  const params = await searchParams;
  const vertical = Array.isArray(params.vertical) ? params.vertical[0] : params.vertical;
  return (
    <QuietFrame>
      <Wizard entry="signup" initialVertical={vertical ?? ""} />
    </QuietFrame>
  );
}
