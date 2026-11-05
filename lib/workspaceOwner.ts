import type { OwnerPrincipal } from "./workspaceAccess.ts";

/** Clerk identity when this site is configured for it. No Clerk call otherwise. */
export async function readClerkPrincipal(): Promise<OwnerPrincipal | null> {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) return null;
  try {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const session = await auth();
    if (!session.userId) return null;
    const user = await currentUser();
    const primary = user?.primaryEmailAddress?.emailAddress ?? "";
    return { userId: session.userId, email: primary };
  } catch {
    return null;
  }
}

/** Clerk user id for Checkout client_reference_id, when a session cookie is present. */
export async function checkoutOwnerId(): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) return null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const session = await auth();
    return session.userId ?? null;
  } catch {
    return null;
  }
}
