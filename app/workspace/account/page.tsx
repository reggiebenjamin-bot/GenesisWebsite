import type { Metadata } from "next";
import { AccountExperience, type AccountMode } from "@/components/workspace/AccountExperience";

export const metadata: Metadata = {
  title: "Your account",
  description: "Choose how to access your Genesis account. You can explore every product without signing in.",
};

function getMode(value: string | string[] | undefined): AccountMode {
  if (value === "create" || value === "login") return value;
  return "choose";
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { mode } = await searchParams;
  const accountEnabled = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );

  return <AccountExperience initialMode={getMode(mode)} accountEnabled={accountEnabled} />;
}
