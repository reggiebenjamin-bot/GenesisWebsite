"use client";

import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { createContext, useContext } from "react";
import styles from "./AccountControls.module.css";

const AccountAvailable = createContext(false);

export function WorkspaceAccountBoundary({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <AccountAvailable.Provider value={enabled}>
      {enabled ? <ClerkProvider>{children}</ClerkProvider> : children}
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
            appearance={{
              variables: { colorPrimary: "#765426", colorBackground: "#fbf9f5", borderRadius: "4px" },
              elements: { avatarBox: { width: 38, height: 38 } },
            }}
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
