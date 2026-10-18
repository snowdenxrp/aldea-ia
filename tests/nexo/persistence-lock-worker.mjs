import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { applyState, loadState, persistState } from "../../scripts/simulate.mjs";

const statePath = pathToFileURL(path.resolve(process.argv[2]));
const savedAt = Number(process.argv[3]);
const barrierDir = process.argv[4] ?? null;
const state = await loadState(statePath);
if (barrierDir) {
  await fs.writeFile(path.join(barrierDir, `ready-${savedAt}`), String(state.stateRevision), "utf8");
  while (true) {
    try { await fs.access(path.join(barrierDir, "release")); break; }
    catch { await new Promise(resolve => setTimeout(resolve, 5)); }
  }
}
const simulation = applyState(state);
console.error(JSON.stringify({pid: process.pid, loadedRevision: state.stateRevision, savedAt}));
simulation.hour = savedAt === 1001 ? 13 : 14;
try {
  await persistState(statePath, simulation, savedAt, {
    expectedRevision: state.stateRevision,
    stateRevision: state.stateRevision + 1
  });
  console.log(JSON.stringify({ savedAt, status: "committed", revision: state.stateRevision + 1 }));
} catch (error) {
  if (error?.code !== "STATE_REVISION_CONFLICT") throw error;
  console.log(JSON.stringify({ savedAt, status: "conflict", revision: state.stateRevision }));
}
