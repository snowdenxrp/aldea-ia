import assert from "node:assert/strict";
import { createSimulation } from "../src/simulation.js";
import { createInitialAgents } from "../src/agents.js";
import { world as baseWorld } from "../src/world.js";
import { getRegionForPosition, getBiomeForRegion, recordRegionVisit, BIOME_DEFINITIONS } from "../src/spatial.js";

const world = structuredClone(baseWorld);
const simulation = createSimulation(world, structuredClone(createInitialAgents()));
const region = getRegionForPosition(simulation.agents[0].position, simulation.world);
const biome = getBiomeForRegion(region, simulation.world);

assert.ok(Object.hasOwn(BIOME_DEFINITIONS, biome.type));
assert.ok(biome.food > 0 && biome.wood > 0 && biome.movement > 0);
assert.equal(simulation.world.spatial.biomes[region.key].type, biome.type);

const visit = recordRegionVisit(simulation.world, simulation.agents[0].position, simulation.day);
assert.equal(visit.key, region.key);
assert.equal(simulation.world.spatial.regions[region.key].discovered, true);
assert.ok(simulation.world.spatial.regions[region.key].visits >= 1);

const positions = [
  { x: simulation.world.bounds.minX + 2, z: simulation.world.bounds.minZ + 2 },
  { x: 0, z: 0 },
  { x: simulation.world.bounds.maxX - 2, z: simulation.world.bounds.maxZ - 2 }
];
for (const position of positions) {
  const r = getRegionForPosition(position, simulation.world);
  const b = getBiomeForRegion(r, simulation.world);
  assert.ok(Object.hasOwn(BIOME_DEFINITIONS, b.type));
}

console.log(JSON.stringify({
  audit: "lumina-territorial-biomes",
  biomeAtOrigin: biome.type,
  regionsWithBiome: Object.keys(simulation.world.spatial.biomes).length,
  verdict: "PASS"
}, null, 2));
