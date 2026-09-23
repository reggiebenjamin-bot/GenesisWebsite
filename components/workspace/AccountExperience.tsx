"use client";

import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./AccountExperience.module.css";

export type AccountMode = "choose" | "create" | "login";

const clerkAppearance = {
  options: { elevation: "flush" as const },
  variables: {
    colorPrimary: "#f2d895",
    colorPrimaryForeground: "#0e1114",
    colorForeground: "#f5f3ed",
    colorMutedForeground: "#c4c8c8",
    colorNeutral: "#f5f3ed",
    colorBackground: "#0e1114",
    colorMuted: "#252a2e",
    colorInput: "#252a2e",
    colorInputForeground: "#f5f3ed",
    colorBorder: "#41484c",
    colorRing: "#f2d895",
    borderRadius: "10px",
    fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    rootBox: { width: "100%", maxWidth: "100%" },
    cardBox: { width: "100%", maxWidth: "100%", boxShadow: "none" },
    card: { width: "100%", maxWidth: "100%", boxShadow: "none", padding: 0 },
    headerTitle: { display: "none" },
    headerSubtitle: { display: "none" },
    footerAction: { display: "none" },
    formButtonPrimary: { minHeight: "48px", fontWeight: 700, backgroundColor: "#f2d895", color: "#0e1114" },
    formFieldInput: { minHeight: "44px" },
  },
};

function readModeFromUrl(): AccountMode {
  const value = new URLSearchParams(window.location.search).get("mode");
  return value === "create" || value === "login" ? value : "choose";
}

function AccountForm({ mode }: { mode: "create" | "login" }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <p className={styles.status} role="status">Loading account access…</p>;

  if (isSignedIn) {
    return (
      <div className={styles.signedInPanel}>
        <p className={styles.signedInMark} aria-hidden="true">✓</p>
        <h2>You&apos;re signed in.</h2>
        <p>{user?.firstName ? `Welcome back, ${user.firstName}.` : "Welcome back."} Your products are ready to explore.</p>
        <Link href="/workspace" className={styles.signedInLink}>
          Go to products <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </div>
    );
  }

  return mode === "create" ? (
    <SignUp
      routing="hash"
      signInUrl="/workspace/account?mode=login"
      fallbackRedirectUrl="/workspace"
      appearance={clerkAppearance}
    />
  ) : (
    <SignIn
      routing="hash"
      signUpUrl="/workspace/account?mode=create"
      fallbackRedirectUrl="/workspace"
      appearance={clerkAppearance}
    />
  );
}

export function AccountExperience({
  initialMode,
  accountEnabled,
}: {
  initialMode: AccountMode;
  accountEnabled: boolean;
}) {
  const [mode, setMode] = useState<AccountMode>(initialMode);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousMode = useRef(mode);

  useEffect(() => {
    const syncMode = () => setMode(readModeFromUrl());
    window.addEventListener("popstate", syncMode);
    return () => window.removeEventListener("popstate", syncMode);
  }, []);

  useEffect(() => {
    if (previousMode.current === mode) return;
    previousMode.current = mode;
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 320;
    const focusTimer = window.setTimeout(() => headingRef.current?.focus(), delay);
    return () => window.clearTimeout(focusTimer);
  }, [mode]);

  function chooseMode(nextMode: AccountMode) {
    if (mode === nextMode) return;
    const url = new URL(window.location.href);
    if (nextMode === "choose") url.searchParams.delete("mode");
    else url.searchParams.set("mode", nextMode);
    window.history.pushState(null, "", `${url.pathname}${url.search}`);
    setMode(nextMode);
  }

  const panelIsRight = mode === "create";
  const contentTitle = mode === "create" ? "Create your account." : "Welcome back.";

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <nav className={styles.returnNav} aria-label="Return navigation">
          <Link href="/" className={styles.returnLink}><ArrowLeft aria-hidden="true" size={17} /> Back to website</Link>
          <Link href="/workspace" className={styles.returnLink}><ArrowLeft aria-hidden="true" size={17} /> Back to products</Link>
        </nav>
      </header>

      <div className={styles.card} data-panel-side={panelIsRight ? "right" : "left"} data-mode={mode}>
        <div className={styles.content} data-content-side={panelIsRight ? "left" : "right"}>
          {mode === "choose" ? (
            <div className={styles.contentInner} key="choose">
              <p className={styles.kicker}>YOUR GENESIS ACCOUNT</p>
              <h1 ref={headingRef} tabIndex={-1}>Make it yours.</h1>
              <p className={styles.intro}>Choose how you want to continue. You can still explore every product without signing in.</p>
              <div className={styles.choiceList} role="group" aria-label="Choose account access">
                <button type="button" onClick={() => chooseMode("create")} className={styles.choiceButton}>
                  <span><strong>Create account</strong><small>New to Genesis</small></span>
                  <ArrowUpRight aria-hidden="true" size={23} />
                </button>
                <button type="button" onClick={() => chooseMode("login")} className={styles.choiceButton}>
                  <span><strong>Log in</strong><small>Continue with your account</small></span>
                  <ArrowUpRight aria-hidden="true" size={23} />
                </button>
              </div>
              <Link href="/workspace" className={styles.exploreLink}>Explore products without an account <ArrowRight aria-hidden="true" size={17} /></Link>
            </div>
          ) : (
            <div className={styles.contentInner} key={mode}>
              <button type="button" onClick={() => chooseMode("choose")} className={styles.backButton}>
                <ArrowLeft aria-hidden="true" size={16} /> Account options
              </button>
              <p className={styles.kicker}>GENESIS ACCOUNT</p>
              <h1 ref={headingRef} tabIndex={-1}>{contentTitle}</h1>
              <p className={styles.intro}>
                {mode === "create"
                  ? "Create an account when you want one. Looking around is always free."
                  : "Good to see you again. Access your Genesis account here."}
              </p>
              <div className={styles.formArea}>
                {accountEnabled ? (
                  <AccountForm mode={mode} />
                ) : (
                  <div className={styles.unavailable} role="status">
                    <span className={styles.unavailableIcon} aria-hidden="true">G</span>
                    <h2>Account access is being connected.</h2>
                    <p>The account form will appear here when Genesis authentication is configured. For now, every product is open to explore without signing in.</p>
                    <Link href="/workspace" className={styles.unavailableLink}>Explore products <ArrowRight aria-hidden="true" size={18} /></Link>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => chooseMode(mode === "create" ? "login" : "create")} className={styles.modeSwitch}>
                {mode === "create" ? "Already have an account? Log in" : "New to Genesis? Create an account"}
              </button>
            </div>
          )}
        </div>

        <div className={styles.visualPanel}>
          <div className={styles.visualTop} role="img" aria-label="Genesis" translate="no">
            <Image src="/brand/genesis-logo.svg" alt="" width={46} height={46} loading="eager" fetchPriority="high" />
            <span aria-hidden="true">ENESIS</span>
          </div>
          <div className={styles.visualBody}>
            <p className={styles.visualLabel}>YOUR NEXT MOVE, MADE CLEARER</p>
            <h2>{mode === "create" ? "A place for what comes next." : "The right tool for the decision ahead."}</h2>
            <p className={styles.visualDescription}>Explore the products, prepare your brief, and decide when the result is worth purchasing.</p>
            <div className={styles.productTiles} aria-label="Genesis products">
              <span><i aria-hidden="true">01</i> Deal Architect</span>
              <span><i aria-hidden="true">02</i> Deal Packager</span>
              <span><i aria-hidden="true">03</i> Capital Advisor</span>
            </div>
            {mode !== "choose" ? (
              <button type="button" onClick={() => chooseMode(mode === "create" ? "login" : "create")} className={styles.visualSwitch}>
                {mode === "create" ? "I already have an account" : "I want to create an account"}
                <ArrowRight aria-hidden="true" size={18} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <p className={styles.pageFootnote}>Explore for free. Pay only when you request a finished result.</p>
    </div>
  );
}
