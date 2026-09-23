import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import type { WorkspaceTool } from "@/lib/toolWorkspace";
import styles from "./WorkspaceApp.module.css";

type ProductCardProps = {
  tool: WorkspaceTool;
  headingLevel?: 2 | 3;
  className?: string;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ProductCard({ tool, headingLevel = 2, className = "" }: ProductCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Link href={tool.workspacePath} className={`${styles.productCard} ${className}`}>
      <div className={styles.cardImage} data-product={tool.id}>
        <Image
          src={tool.heroImage}
          alt=""
          fill
          preload={tool.id === "deal-architect"}
          sizes="(max-width: 680px) 90vw, (max-width: 900px) 45vw, 33vw"
        />
      </div>
      <div className={styles.cardBody}>
        <Heading>{tool.name}</Heading>
        <p className={styles.cardPromise}>{tool.promise}</p>
        <div className={styles.cardPurchaseFacts}>
          <span className={styles.cardPrice}>{currency.format(tool.price)}</span>
          <span className={styles.cardPriceUnit}>Pay once for the result</span>
        </div>
        <span className={styles.cardAction}>
          Explore product <ArrowRight aria-hidden="true" size={18} />
        </span>
      </div>
    </Link>
  );
}
