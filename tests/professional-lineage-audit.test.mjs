import assert from "node:assert/strict";
import { createAgent } from "../src/agents.js";
import { inheritSpecialization, professionalLineageSummary } from "../src/specialization.js";
import { createSimulation } from "../src/simulation.js";
import { advanceSocietyDay } from "../src/society.js";

const mother = createAgent({ id: "m", name: "Madre", age: 30 });
const father = createAgent({ id: "f", name: "Padre", age: 31 });
mother.specialization = { role: "farmer", confidence: 0.9, history: [], mentorship: { taught: 3, learned: 0 } };
father.specialization = { role: "farmer", confidence: 0.7, history: [], mentorship: { taught: 2, learned: 0 } };
const inherited = inheritSpecialization(mother, father);
assert.equal(inherited.role, "farmer");
assert.ok(inherited.confidence > 0 && inherited.confidence < 0.4);

const world = { day: 1, timeOfDay: 23.9, resources: {} };
const sim = createSimulation(world, [mother, father], { random: () => 0.99 });
sim.world.specialization = { roles: {}, history: [{ day: 1, agentId: "m", role: "farmer", reason: "emergence" }] };
assert.equal(professionalLineageSummary(sim.world).farmer, 1);
advanceSocietyDay(sim);
assert.ok(sim.world.economy);
console.log("Professional lineage audit OK");
