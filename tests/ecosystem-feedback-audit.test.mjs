import assert from "node:assert/strict";
import { advanceWorldDay, world } from "../src/world.js";
import { normalizeEcosystemWorld, ecosystemModifiers } from "../src/ecosystem.js";
import { getRegionalEcology, updateRegionalEcology } from "../src/spatial.js";

{
  const w = structuredClone(world);
  normalizeEcosystemWorld(w);
  assert.equal(w.ecosystem.biodiversity, 1);
  assert.equal(w.ecosystem.soilQuality, 1);
  assert.equal(w.ecosystem.waterQuality, 1);
  const before = w.resources.wild_plants.amount;
  updateRegionalEcology(w, w.resources, 2);
  assert.equal(getRegionalEcology(w, w.resources.wild_plants.position).biodiversity, 1);
  advanceWorldDay(w);
  assert.equal(w.resources.wild_plants.amount, before);
}

{
  const w = structuredClone(world);
  w.resources.wild_plants.amount = 5;
  w.resources.fish.amount = 5;
  w.resources.water.amount = 100;
  advanceWorldDay(w);
  assert(w.ecosystem.biodiversity < 1);
  assert(w.ecosystem.waterQuality < 1);
  assert(w.ecosystem.humanPressure > 0);
  updateRegionalEcology(w, w.resources, 10);
  assert.ok(getRegionalEcology(w, w.resources.wild_plants.position).humanPressure > 0);
  const modifiers = ecosystemModifiers(w);
  assert(modifiers.biodiversity < 1);
  assert(modifiers.waterQuality < 1);
}

{
  const w = structuredClone(world);
  w.ecosystem = { biodiversity: 0.6, soilQuality: 0.5, waterQuality: 0.7, humanPressure: 0.8 };
  const modifiers = ecosystemModifiers(w);
  assert(modifiers.plantRegeneration < 1);
  assert(modifiers.farmYield < 1);
}

assert.ok(Object.keys(w.spatial?.ecology ?? {}).length > 0);
console.log("Lúmina ecosystem audit: presión global y causalidad ecológica regional verificadas.");
