"use client";

import { ClerkProvider, Show, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { createContext, useContext } from "react";
import styles from "./AccountControls.module.css";

const AccountAvailable = createContext(false);
type WorkspaceIdentity = { loaded: boolean; userId: string | null };
const AccountIdentity = createContext<WorkspaceIdentity>({ loaded: true, userId: null });

const accountAppearance = {
  variables: {
    colorPrimary: "#f2d895",
    colorPrimaryForeground: "#0e1114",
    colorForeground: "#f5f3ed",
    colorMutedForeground: "#c4c8c8",
    colorBackground: "#252a2e",
    colorMuted: "#30363a",
    colorInput: "#30363a",
    colorInputForeground: "#f5f3ed",
    colorBorder: "#41484c",
    colorRing: "#f2d895",
    borderRadius: "10px",
    fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    badge: { color: "#c4c8c8", backgroundColor: "#30363a" },
  },
};

function ConnectedAccountBoundary({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  return (
    <AccountIdentity.Provider value={{ loaded: isLoaded, userId: userId ?? null }}>
      {children}
    </AccountIdentity.Provider>
  );
}

export function useWorkspaceIdentity() {
  return useContext(AccountIdentity);
}

export function WorkspaceAccountBoundary({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <AccountAvailable.Provider value={enabled}>
      {enabled ? (
        <ClerkProvider appearance={accountAppearance}><ConnectedAccountBoundary>{children}</ConnectedAccountBoundary></ClerkProvider>
      ) : (
        <AccountIdentity.Provider value={{ loaded: true, userId: null }}>{children}</AccountIdentity.Provider>
      )}
    </AccountAvailable.Provider>
  );
}

function AccountEntryLink() {
  return <Link href="/workspace/account" className={styles.accountLink}>Sign in / up</Link>;
}

function ConnectedAccountControls() {
  return (
    <div className={styles.controls}>
      <Show when="signed-out">
        <AccountEntryLink />
      </Show>
      <Show when="signed-in">
        <div className={styles.signedIn}>
          <span>Account</span>
          <UserButton
            appearance={{ elements: { avatarBox: { width: 38, height: 38 } } }}
            userProfileProps={{ appearance: accountAppearance }}
          />
        </div>
      </Show>
    </div>
  );
}

export function AccountControls() {
  const enabled = useContext(AccountAvailable);
  if (!enabled) return <div className={styles.controls}><AccountEntryLink /></div>;
  return <ConnectedAccountControls />;
}
