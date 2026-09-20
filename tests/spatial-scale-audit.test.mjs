import assert from "node:assert/strict";
import { createSimulation } from "../src/simulation.js";
import { createInitialAgents } from "../src/agents.js";
import { world as baseWorld } from "../src/world.js";
import { getRegionForPosition, getActiveRegionKeys, spatialSummary } from "../src/spatial.js";

const scales = [
  { width: 68, depth: 68 },
  { width: 128, depth: 128 },
  { width: 256, depth: 256 }
];

for (const scale of scales) {
  const world = structuredClone(baseWorld);
  world.bounds = {
    minX: -scale.width / 2,
    maxX: scale.width / 2,
    minZ: -scale.depth / 2,
    maxZ: scale.depth / 2
  };
  const simulation = createSimulation(world, structuredClone(createInitialAgents()));

  assert.ok(simulation.world.spatial, "el mundo no inicializó su partición espacial");
  assert.ok(simulation.world.spatial.regionSize > 0, "tamaño de región inválido");

  for (const agent of simulation.agents) {
    const region = getRegionForPosition(agent.position, simulation.world);
    assert.ok(region.minX <= agent.position.x && agent.position.x <= region.maxX, "agente fuera de su región");
    assert.ok(region.minZ <= agent.position.z && agent.position.z <= region.maxZ, "agente fuera de su región");
  }

  const active = getActiveRegionKeys(simulation.agents, simulation.world);
  const summary = spatialSummary(simulation.world, simulation.agents);
  assert.ok(active.length > 0, "no se detectaron regiones activas");
  assert.ok(summary.totalRegions >= active.length, "las regiones activas exceden el territorio");

  console.log(JSON.stringify({
    audit: "lumina-spatial-scale",
    bounds: simulation.world.bounds,
    totalRegions: summary.totalRegions,
    activeRegions: summary.activeRegions,
    coverageRatio: Number(summary.coverageRatio.toFixed(4)),
    verdict: "PASS"
  }));
}

const baseline = createSimulation(structuredClone(baseWorld), structuredClone(createInitialAgents()));
assert.equal(baseline.world.spatial.regionSize, 8);
assert.ok(baseline.world.bounds.maxX - baseline.world.bounds.minX >= 60);
assert.ok(baseline.world.bounds.maxZ - baseline.world.bounds.minZ >= 60);
console.log("Lúmina spatial scale audit: partición regional y escalas 68/128/256 verificadas.");
