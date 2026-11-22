"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { CapitalAdvisorWorkspace } from "./workflows/CapitalAdvisorWorkspace";
import { DealArchitectWorkspace } from "./workflows/DealArchitectWorkspace";
import { DealPackagerWorkspace } from "./workflows/DealPackagerWorkspace";
import { ExampleWalkthrough } from "./ExampleWalkthrough";
import { AccountControls } from "./AccountControls";
import { getWorkspaceTool, type WorkspaceToolId } from "@/lib/toolWorkspace";
import { softwareDisclaimer } from "@/lib/aiEmployees";
import styles from "./WorkspaceApp.module.css";

function CatalogHeader({ productPage = false }: { productPage?: boolean }) {
  return (
    <header className={styles.header}>
      <nav className={styles.returnNav} aria-label="Return navigation">
        <Link href="/" className={styles.homeLink}>
          <ArrowLeft aria-hidden="true" size={17} /> Back to website
        </Link>
        {productPage ? (
          <Link href="/pricing" className={styles.homeLink}>
            <ArrowLeft aria-hidden="true" size={17} /> See pricing
          </Link>
        ) : null}
      </nav>
      <span className={styles.wordmark} aria-label="Genesis">GENESIS</span>
      <AccountControls />
    </header>
  );
}

export function WorkspaceHome() {
  return (
    <div className={styles.page}>
      <CatalogHeader />
      <div className={styles.catalogContent}>
        <div className={styles.catalogIntro}>
          <p className={styles.eyebrow}>Genesis</p>
          <h1>Tools are no longer offered.</h1>
          <p>
            The Genesis Tools catalog has been removed. See Managed AI plans for business, real estate, and lending.
          </p>
          <p className={styles.catalogActions}>
            <Link href="/pricing" className={styles.pricingLink}>
              See pricing
            </Link>
          </p>
          <p>
            If you already bought a tool, open it from the link on your welcome page. That access stays in place.
          </p>
        </div>
        <p className={styles.catalogFootnote}>{softwareDisclaimer}</p>
      </div>
    </div>
  );
}

export function WorkspaceShell({ toolId }: { toolId: WorkspaceToolId }) {
  const tool = getWorkspaceTool(toolId);
  return (
    <div className={styles.page}>
      <CatalogHeader productPage />
      <div className={styles.productContent}>
        <section className={styles.productHero} aria-labelledby="product-title">
          <div className={styles.productIntro}>
            <p className={styles.eyebrow}>{tool.eyebrow} / Genesis product {tool.number}</p>
            <h1 id="product-title">{tool.name}</h1>
            <p className={styles.productPromise}>{tool.promise}</p>
            <p className={styles.productExplanation}>Watch the example, then enter your own details below. Preparing a brief is free; the personalized result is the one-time purchase.</p>
            <div className={styles.exampleLegend}><span className={styles.legendMark} aria-hidden="true" /> Example only · no live result shown</div>
          </div>
          <ExampleWalkthrough toolId={toolId} />
        </section>
        <section className={styles.briefSection} aria-labelledby="brief-title">
          <div className={styles.briefIntro}>
            <span className={styles.briefStep}>Your brief</span>
            <h2 id="brief-title">Make it yours.</h2>
            <p>Enter what you know. You can review and change your information before choosing to purchase.</p>
          </div>
          <div className={styles.workbench}>
            {toolId === "deal-architect" ? <DealArchitectWorkspace /> : null}
            {toolId === "deal-packager" ? <DealPackagerWorkspace /> : null}
            {toolId === "capital-advisor" ? <CapitalAdvisorWorkspace /> : null}
          </div>
        </section>
        <p className={styles.catalogFootnote}>{softwareDisclaimer}</p>
      </div>
    </div>
  );
}
