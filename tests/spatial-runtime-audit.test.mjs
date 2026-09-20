import assert from "node:assert/strict";
import { createSimulation, tick } from "../src/simulation.js";
import { createInitialAgents } from "../src/agents.js";
import { world as baseWorld } from "../src/world.js";
import { spatialSummary } from "../src/spatial.js";

const simulation = createSimulation(structuredClone(baseWorld), structuredClone(createInitialAgents()));
const before = spatialSummary(simulation.world, simulation.agents);

assert.ok(before.totalRegions > 1);
assert.equal(simulation.world.spatial.activeRegions.length, 0);

tick(simulation, 0.5);

const after = spatialSummary(simulation.world, simulation.agents);
assert.ok(simulation.world.spatial.activeRegions.length > 0);
assert.ok(simulation.world.spatial.activeRegions.length <= 256);
assert.ok(after.activeRegions > 0);
assert.ok(after.activeRegions <= after.totalRegions + 20);
assert.ok(simulation.agents.every(agent => {
  if (!agent.position) return false;
  return Number.isFinite(agent.position.x) && Number.isFinite(agent.position.z);
}));

console.log(JSON.stringify({
  audit: "lumina-spatial-runtime",
  totalRegions: after.totalRegions,
  activeRegions: after.activeRegions,
  knownRegions: simulation.world.spatial.knownRegions.length,
  verdict: "PASS"
}, null, 2));
