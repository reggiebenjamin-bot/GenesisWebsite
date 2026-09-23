"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { CapitalAdvisorWorkspace } from "./workflows/CapitalAdvisorWorkspace";
import { DealArchitectWorkspace } from "./workflows/DealArchitectWorkspace";
import { DealPackagerWorkspace } from "./workflows/DealPackagerWorkspace";
import { ExampleWalkthrough } from "./ExampleWalkthrough";
import { AccountControls, useWorkspaceIdentity } from "./AccountControls";
import { ProductCard } from "./ProductCard";
import { getWorkspaceTool, workspaceTools, type WorkspaceToolId } from "@/lib/toolWorkspace";
import styles from "./WorkspaceApp.module.css";

function CatalogHeader({ productPage = false }: { productPage?: boolean }) {
  return (
    <header className={styles.header}>
      <nav className={styles.returnNav} aria-label="Return navigation">
        <Link href="/" className={styles.homeLink}>
          <ArrowLeft aria-hidden="true" size={17} /> Back to website
        </Link>
        {productPage ? (
          <Link href="/workspace" className={styles.homeLink}>
            <ArrowLeft aria-hidden="true" size={17} /> Back to products
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
          <p className={styles.eyebrow}>Real estate, higher ground</p>
          <h1>Choose your next move.</h1>
          <p>Explore each product for free. Pay only when you request a finished result.</p>
        </div>
        <nav className={styles.catalogGrid} aria-label="Choose a Genesis product">
          {workspaceTools.map((tool) => (
            <ProductCard key={tool.id} tool={tool} />
          ))}
        </nav>
        <p className={styles.catalogFootnote}>No account needed to browse or prepare your brief.</p>
      </div>
    </div>
  );
}

export function WorkspaceShell({ toolId }: { toolId: WorkspaceToolId }) {
  const tool = getWorkspaceTool(toolId);
  const identity = useWorkspaceIdentity();
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
          {identity.loaded ? (
            <div className={styles.workbench} key={identity.userId ?? "guest"}>
              {toolId === "deal-architect" ? <DealArchitectWorkspace /> : null}
              {toolId === "deal-packager" ? <DealPackagerWorkspace /> : null}
              {toolId === "capital-advisor" ? <CapitalAdvisorWorkspace /> : null}
            </div>
          ) : <p role="status">Loading your account…</p>}
        </section>
      </div>
    </div>
  );
}
