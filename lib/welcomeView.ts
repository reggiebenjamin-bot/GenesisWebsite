import { stripeServer } from "@/lib/stripeServer";
import { stripeBackedStore } from "@/lib/stripeCheckoutRow";
import { siteHasOwnSignIn, type WorkspaceView } from "@/lib/workspaceAccess";
import { readClerkPrincipal } from "@/lib/workspaceOwner";
import { openConfiguredStore, ownerWorkspaceView } from "@/lib/workspaceProvision";

/**
 * One view for the welcome page and GET /api/workspace/status.
 * The sqlite record is used when GENESIS_WORKSPACE_STATE_PATH is set.
 * Otherwise (Vercel) the paid state comes from Stripe for this one session.
 */
export async function welcomeWorkspaceView(sessionId: string): Promise<WorkspaceView> {
  const store = openConfiguredStore() ?? (await stripeBackedStore(stripeServer(), sessionId));
  try {
    const ownSignIn = siteHasOwnSignIn();
    const principal = ownSignIn ? await readClerkPrincipal() : null;
    const sessionHolderIsOwner = !ownSignIn;
    return await ownerWorkspaceView({
      store,
      sessionId,
      principal,
      sessionHolderIsOwner,
      fetchImpl: principal || sessionHolderIsOwner ? fetch : undefined,
    });
  } finally {
    store.close();
  }
}
