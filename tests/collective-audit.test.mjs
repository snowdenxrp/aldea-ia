import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation } from "../src/simulation.js";
import { getOrCreateRelationship } from "../src/relationships.js";
import { contributeToProject, findOrCreateProject, canCooperate, normalizeCollectiveWorld } from "../src/collective.js";
import { world } from "../src/world.js";

const clone = value => structuredClone(value);
const agents = clone(createInitialAgents());
const sim = createSimulation(clone(world), agents, { random: () => 0 });
const [alex, bruno] = sim.agents;

alex.position = { x: 0, z: 0 };
bruno.position = { x: 1, z: 0 };
alex.inventory = [{ type: "wood", amount: 6 }, { type: "stone", amount: 3 }];
bruno.inventory = [{ type: "wood", amount: 6 }, { type: "stone", amount: 3 }];

const ab = getOrCreateRelationship(alex, bruno.id);
ab.trust = 0.4; ab.cooperation = 0.4;
const ba = getOrCreateRelationship(bruno, alex.id);
ba.trust = 0.4; ba.cooperation = 0.4;

normalizeCollectiveWorld(sim.world);
assert.equal(canCooperate(alex, bruno), true);

const project = findOrCreateProject(sim, alex, bruno);
assert(project);
assert.equal(project.type, "shared_shelter");
assert.equal(project.status, "active");

const first = contributeToProject(sim, alex, project);
assert.equal(first.success, true);
assert.equal(first.completed, false);
const second = contributeToProject(sim, bruno, project);
assert.equal(second.success, true);
assert.equal(second.completed, false);
const third = contributeToProject(sim, alex, project);
assert.equal(third.success, true);
assert.equal(project.status, "completed");
assert.equal(project.progress.wood, 12);
assert.equal(project.progress.stone, 6);

const shelter = sim.world.structures.shelters.find(item => item.id === alex.home);
assert(shelter);
assert.equal(shelter.type, "shared_shelter");
assert.deepEqual(shelter.ownerIds.sort(), [alex.id, bruno.id].sort());
assert.equal(alex.home, bruno.home);
assert(alex.collectiveProjects.includes(project.id));
assert(bruno.collectiveProjects.includes(project.id));
assert.equal(sim.world.collectiveProjects.length, 1);

console.log("Lúmina collective audit: cooperación, contribuciones y refugio compartido verificados.");
