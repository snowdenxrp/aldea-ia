import assert from "node:assert/strict";
import { world } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { createRandom } from "../src/random.js";

function snapshot(seed) {
  const sim = createSimulation(structuredClone(world), structuredClone(createInitialAgents()), {
    random: createRandom(seed)
  });
  for (let i = 0; i < 48; i += 1) tick(sim, 1);
  return JSON.stringify(sim);
}

assert.equal(snapshot("same-seed"), snapshot("same-seed"));
assert.notEqual(snapshot("seed-a"), snapshot("seed-b"));

console.log("Lúmina randomness: secuencias con misma semilla son reproducibles.");
