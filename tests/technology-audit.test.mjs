import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation } from "../src/simulation.js";
import { advanceTechnologyDay, normalizeTechnologyWorld, technologyModifiers } from "../src/technology.js";
import { world } from "../src/world.js";

const clone = value => structuredClone(value);
const agents = clone(createInitialAgents());
agents.push({ ...clone(agents[0]), id: "carla", name: "Carla", relationships: [], inventory: [], skills: [] });
for (const agent of agents) {
  const level = agent.id === "carla" ? 0.1 : 0.5;
  agent.skills = [{ name: "toolmaking", level }, { name: "build_shelter", level: level < 0.2 ? 0.1 : 0.46 }, { name: "farm", level: level < 0.2 ? 0.1 : 0.46 }];
}
const sim = createSimulation(clone(world), agents, { random: () => 0 });
sim.day = 10; sim.world.day = 10;
normalizeTechnologyWorld(sim.world);
advanceTechnologyDay(sim);
assert.equal(sim.world.technology.levels.tools, 1);
assert.equal(sim.world.technology.levels.construction, 1);
assert.equal(sim.world.technology.levels.agriculture, 1);
assert.equal(sim.world.technology.discoveries.length, 3);

for (const agent of agents) {
  agent.skills.find(s => s.name === "toolmaking").level = 0.8;
  agent.skills.find(s => s.name === "build_shelter").level = 0.8;
  agent.skills.find(s => s.name === "farm").level = 0.8;
}
sim.day = 20; sim.world.day = 20;
advanceTechnologyDay(sim);
assert.equal(sim.world.technology.levels.tools, 2);
assert.equal(sim.world.technology.levels.construction, 2);
assert.equal(sim.world.technology.levels.agriculture, 2);
const modifiers = technologyModifiers(sim.world);
assert.equal(modifiers.toolEfficiency, 0.16);
assert.equal(modifiers.shelterDurability, 0.4);

console.log("Lúmina technology audit: experiencia colectiva, niveles acumulativos y efectos tecnológicos verificados.");
