import path from "node:path";
import { pathToFileURL } from "node:url";
import { createInitialAgents } from "../src/agents.js";
import { applyState, loadState, persistState } from "../scripts/simulate.mjs";

const statePath = pathToFileURL(path.resolve(process.argv[2]));
const savedAt = Number(process.argv[3]);
const state = await loadState(statePath);
const simulation = applyState(state);
simulation.hour = savedAt === 1001 ? 13 : 14;
await persistState(statePath, simulation, savedAt, {
  expectedRevision: state.stateRevision,
  stateRevision: state.stateRevision + 1
});
console.log(JSON.stringify({ savedAt, revision: state.stateRevision + 1 }));
