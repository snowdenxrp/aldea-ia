import path from "node:path";
import { pathToFileURL } from "node:url";
import { applyState, loadState, persistState } from "../scripts/simulate.mjs";

const statePath = pathToFileURL(path.resolve(process.argv[2]));
const savedAt = Number(process.argv[3]);
const state = await loadState(statePath);
const simulation = applyState(state);
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
