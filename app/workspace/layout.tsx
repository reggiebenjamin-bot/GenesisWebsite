import type { Metadata } from "next";
import { WorkspaceAccountBoundary } from "@/components/workspace/AccountControls";

export const metadata: Metadata = {
  title: "Genesis Products",
  description: "Explore Genesis products and prepare a private brief for your next real estate decision.",
  robots: { index: false, follow: false },
};

export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const accountEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  return (
    <WorkspaceAccountBoundary enabled={accountEnabled}>
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-1000 -translate-y-[150%] bg-ivory px-4 py-2.5 text-ink transition-transform duration-200 focus:translate-y-0"
      >
        Skip to main content
      </a>
      <main id="main-content">{children}</main>
    </WorkspaceAccountBoundary>
  );
}
