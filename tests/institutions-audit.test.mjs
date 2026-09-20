import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation } from "../src/simulation.js";
import { getOrCreateRelationship } from "../src/relationships.js";
import { advanceInstitutionDay, getInstitutionOptions, applyInstitutionAction, normalizeInstitutionWorld } from "../src/institutions.js";
import { world } from "../src/world.js";

const clone = value => structuredClone(value);
const agents = clone(createInitialAgents());
agents.push({ ...clone(agents[0]), id: "carla", name: "Carla", relationships: [], inventory: [], skills: [] });
const sim = createSimulation(clone(world), agents, { random: () => 0 });
const [alex, bruno, carla] = sim.agents;

for (const [a,b] of [[alex,bruno],[alex,carla],[bruno,carla]]) {
  const ab = getOrCreateRelationship(a,b.id); ab.trust = 0.5; ab.cooperation = 0.5; ab.familiarity = 0.8;
}
sim.world.cooperation = [
  { day: 1, type: "cooperation", participants: [alex.id, bruno.id] },
  { day: 1, type: "cooperation", participants: [alex.id, carla.id] },
  { day: 2, type: "cooperation", participants: [bruno.id, carla.id] },
  { day: 2, type: "cooperation", participants: [alex.id, bruno.id] }
];

normalizeInstitutionWorld(sim.world);
sim.day = 3;
sim.world.day = 3;
advanceInstitutionDay(sim);

assert.equal(sim.world.institutions.length, 1);
assert.equal(sim.world.institutions[0].type, "commons");
assert.equal(alex.institutions.includes("institution-commons-1"), true);

alex.inventory = [{ type: "farm_food", amount: 3 }];
alex.needs.hunger = 70;
const contribution = applyInstitutionAction(sim, alex, { name: "contribute_commons", resourceType: "farm_food", amount: 1 });
assert.equal(contribution.success, true);
assert.equal(sim.world.commons.food, 1);

alex.needs.hunger = 30;
const options = getInstitutionOptions(alex, sim.world);
assert(options.some(option => option.name === "withdraw_commons"));
const withdrawal = applyInstitutionAction(sim, alex, { name: "withdraw_commons", resourceType: "farm_food", amount: 1 });
assert.equal(withdrawal.success, true);
assert.equal(sim.world.commons.food, 0);
assert.equal(alex.needs.hunger, 40);

console.log("Lúmina institutions audit: formación emergente, reserva comunitaria y redistribución verificadas.");
