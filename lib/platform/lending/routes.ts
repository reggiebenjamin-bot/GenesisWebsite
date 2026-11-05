export type DeskScreen =
  | { name: "submission" }
  | { name: "drop" }
  | { name: "pipeline"; view: "list" | "board" }
  | { name: "entry" }
  | { name: "lead" }
  | { name: "deal"; id: string }
  | { name: "match"; id: string }
  | { name: "follow" }
  | { name: "files" }
  | { name: "file"; id: string }
  | { name: "request" }
  | { name: "lenders" }
  | { name: "lender-new" }
  | { name: "lender"; id: string }
  | { name: "borrowers" }
  | { name: "borrower-new" }
  | { name: "borrower"; id: string }
  | { name: "learning" }
  | { name: "portal" }
  | { name: "upload" }
  | { name: "options" }
  | { name: "intake" };

const reservedLender = new Set(["new"]);
const reservedBorrower = new Set(["new"]);

export function resolveDesk(path: string[] | undefined): DeskScreen | null {
  const parts = path ?? [];
  if (parts.length === 0) return { name: "submission" };
  const [head, second, third] = parts;
  if (parts.length === 1) {
    if (head === "drop") return { name: "drop" };
    if (head === "pipeline") return { name: "pipeline", view: "list" };
    if (head === "entry") return { name: "entry" };
    if (head === "lead") return { name: "lead" };
    if (head === "follow") return { name: "follow" };
    if (head === "files") return { name: "files" };
    if (head === "request") return { name: "request" };
    if (head === "lenders") return { name: "lenders" };
    if (head === "borrowers") return { name: "borrowers" };
    if (head === "learning") return { name: "learning" };
    if (head === "portal") return { name: "portal" };
    if (head === "intake") return { name: "intake" };
    return null;
  }
  if (head === "pipeline" && second === "board" && parts.length === 2) {
    return { name: "pipeline", view: "board" };
  }
  if (head === "deals" && second && parts.length === 2) return { name: "deal", id: second };
  if (head === "deals" && second && third === "match" && parts.length === 3) {
    return { name: "match", id: second };
  }
  if (head === "files" && second && parts.length === 2) return { name: "file", id: second };
  if (head === "lenders" && second === "new" && parts.length === 2) return { name: "lender-new" };
  if (head === "lenders" && second && !reservedLender.has(second) && parts.length === 2) {
    return { name: "lender", id: second };
  }
  if (head === "borrowers" && second === "new" && parts.length === 2) return { name: "borrower-new" };
  if (head === "borrowers" && second && !reservedBorrower.has(second) && parts.length === 2) {
    return { name: "borrower", id: second };
  }
  if (head === "portal" && second === "upload" && parts.length === 2) return { name: "upload" };
  if (head === "portal" && second === "options" && parts.length === 2) return { name: "options" };
  return null;
}

export function isPublicDesk(screen: DeskScreen): boolean {
  return (
    screen.name === "portal" ||
    screen.name === "upload" ||
    screen.name === "options" ||
    screen.name === "intake"
  );
}
