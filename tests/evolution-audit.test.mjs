import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { advanceSocietyDay, normalizeSocietyWorld } from "../src/society.js";
import { world } from "../src/world.js";

const clone = value => structuredClone(value);

{
  const w = clone(world);
  normalizeSocietyWorld(w);
  assert.equal(w.life.births, 0);
  assert.equal(w.culture.traditions.length, 0);
}

{
  const sim = createSimulation(clone(world), clone(createInitialAgents()), { random: () => 0 });
  const [alex, bruno] = sim.agents;
  alex.age = 30; bruno.age = 31;
  alex.relationships = [{ agentId: bruno.id, familiarity: 0.8, trust: 0.8, cooperation: 0.8, tension: 0, affection: 0.8, resentment: 0, history: [] }];
  bruno.relationships = [{ agentId: alex.id, familiarity: 0.8, trust: 0.8, cooperation: 0.8, tension: 0, affection: 0.8, resentment: 0, history: [] }];
  alex.needs.health = 100; bruno.needs.health = 100;
  advanceSocietyDay(sim);
  assert(alex.pregnancy, "Una pareja con vínculo fuerte debe poder iniciar una gestación.");
  alex.pregnancy.remainingDays = 1;
  advanceSocietyDay(sim);
  assert.equal(sim.world.life.births, 1);
  assert.equal(sim.agents.length, 3);
  const child = sim.agents.find(a => a.id.startsWith("child-"));
  assert(child && child.parents.length === 2 && child.generation === 1);
}

{
  const sim = createSimulation(clone(world), clone(createInitialAgents()), { random: () => 0 });
  sim.world.day = 30;
  const before = sim.world.resources.wild_plants.amount;
  tick(sim, 24);
  assert.equal(sim.world.day, sim.day);
  assert(sim.world.climate && sim.world.climate.season);
  assert(sim.world.resources.wild_plants.amount >= before);
}

console.log("Lúmina evolution audit: ciclo de vida, cultura y clima verificados.");
