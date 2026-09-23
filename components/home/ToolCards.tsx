import { workspaceTools } from "@/lib/toolWorkspace";
import { ProductCard } from "@/components/workspace/ProductCard";
import styles from "@/components/workspace/WorkspaceApp.module.css";

/** The homepage reuses the catalog's visual product cards and direct links. */
export function ToolCards() {
  return (
    <ul className={styles.catalogGrid}>
      {workspaceTools.map((tool) => (
        <li key={tool.id} className="flex min-w-0">
          <ProductCard
            tool={tool}
            headingLevel={3}
            className="h-full w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-dark"
          />
        </li>
      ))}
    </ul>
  );
}
