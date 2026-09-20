import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { executeAction } from "../src/actions.js";
import { world } from "../src/world.js";
import { getInventoryAmount, canBuildShelter } from "../src/development.js";

const sim = createSimulation(structuredClone(world), [createInitialAgents()[0]], { random: () => 0 });
const a = sim.agents[0];
a.inventory = [{ type: "wood", amount: 12 }, { type: "stone", amount: 6 }];
a.knowledge = [{ topic: "action:build_shelter", belief: "puedo construir un refugio", confidence: 0.8, evidence: [] }];
assert(canBuildShelter(a));
const before = a.needs.safety;
const result = executeAction(sim, a, { name: "build_shelter" });
assert.equal(result.success, true);
assert.equal(sim.world.structures.shelters.length, 1);
assert.equal(a.home, "shelter-1");
assert.equal(getInventoryAmount(a, "wood"), 0);
assert.equal(getInventoryAmount(a, "stone"), 0);
assert(a.needs.safety >= before);
assert.equal(sim.world.structures.shelters[0].ownerId, a.id);

// Persisted structures must survive normal simulation ticks.
tick(sim, 24);
assert.equal(sim.world.structures.shelters.length, 1);
assert.equal(sim.world.structures.shelters[0].id, "shelter-1");

console.log("Lúmina development audit: construcción, costes, seguridad y persistencia verificados.");
