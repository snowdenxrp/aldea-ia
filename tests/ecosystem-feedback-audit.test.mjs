import assert from "node:assert/strict";
import { advanceWorldDay, world } from "../src/world.js";
import { normalizeEcosystemWorld, ecosystemModifiers } from "../src/ecosystem.js";

{
  const w = structuredClone(world);
  normalizeEcosystemWorld(w);
  assert.equal(w.ecosystem.biodiversity, 1);
  assert.equal(w.ecosystem.soilQuality, 1);
  assert.equal(w.ecosystem.waterQuality, 1);
  const before = w.resources.wild_plants.amount;
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
  const modifiers = ecosystemModifiers(w);
  assert(modifiers.plantRegeneration < 1);
  assert(modifiers.fishRegeneration < 1);
}

{
  const w = structuredClone(world);
  w.ecosystem = { biodiversity: 0.6, soilQuality: 0.5, waterQuality: 0.7, humanPressure: 0.8 };
  const modifiers = ecosystemModifiers(w);
  assert(modifiers.plantRegeneration < 1);
  assert(modifiers.farmYield < 1);
}

console.log("Lúmina ecosystem audit: presión, resiliencia y regeneración adaptativa verificadas.");
