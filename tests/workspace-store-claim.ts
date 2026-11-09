import { openWorkspaceStore } from "../lib/workspaceStore.ts";

const store = openWorkspaceStore(process.argv[2] ?? "");
const won = store.claimEvent(process.argv[3] ?? "test", process.argv[4] ?? "");
store.close();
console.log(won ? "won" : "lost");
