import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation } from "../src/simulation.js";
import { advanceInstitutionDay } from "../src/institutions.js";
import { advanceGovernanceDay, governanceSummary, normalizeGovernanceWorld } from "../src/governance.js";
import { world } from "../src/world.js";

const clone = structuredClone;
const agents = clone(createInitialAgents());
agents.push({ ...clone(agents[0]), id:"carla", name:"Carla", relationships:[], inventory:[], skills:[] });
const sim = createSimulation(clone(world), agents, { random: () => 0 });
sim.day = 10; sim.world.day = 10;
sim.world.cooperation = [1,2,3,4].map(day => ({day,type:"cooperation",participants:["alex","bruno"]}));
for (const a of sim.agents) { a.relationships = []; a.needs.hunger = 30; }
advanceInstitutionDay(sim);
assert.equal(sim.world.institutions.length,1);
sim.world.institutions[0].history.push({day:10,contributions:1,withdrawals:3});
normalizeGovernanceWorld(sim.world);
advanceGovernanceDay(sim);
assert.equal(sim.world.governance.proposals.length,1);
assert.equal(sim.world.governance.decisions.length,1);
assert.equal(sim.world.governance.decisions[0].result,"accepted");
assert.equal(governanceSummary(sim.world).accepted,1);
console.log("Lúmina governance audit: propuestas, votación y persistencia de normas verificadas.");
