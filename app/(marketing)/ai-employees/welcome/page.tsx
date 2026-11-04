import { redirect } from "next/navigation";

/**
 * The welcome and onboarding flow moved to the shared /welcome page, which
 * serves every paid plan. This keeps the old success URL working by sending a
 * visitor on with their session id intact.
 */
export default async function AiEmployeesWelcomeRedirect({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  redirect(sessionId ? `/welcome?session_id=${encodeURIComponent(sessionId)}` : "/welcome");
}
