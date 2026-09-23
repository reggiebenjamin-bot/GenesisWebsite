import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// The catalog stays public, including while a Clerk project is being configured.
const accountEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
const handleClerk = accountEnabled ? clerkMiddleware() : null;

export default handleClerk ?? (() => NextResponse.next());

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
