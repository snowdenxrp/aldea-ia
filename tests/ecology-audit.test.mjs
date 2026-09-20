import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { executeAction } from "../src/actions.js";
import { advanceWorldDay, world } from "../src/world.js";
import { createSimulation } from "../src/simulation.js";

{
  const sim = createSimulation(structuredClone(world), [createInitialAgents()[0]], { random: () => 0 });
  const agent = sim.agents[0];
  const before = sim.world.resources.wild_plants.amount;
  const result = executeAction(sim, agent, { name: "eat_plant", amount: 2 });
  assert.equal(result.success, true);
  assert.equal(sim.world.resources.wild_plants.amount, before - 2);
  advanceWorldDay(sim.world);
  assert.equal(sim.world.resources.wild_plants.amount, before);
}

{
  const sim = createSimulation(structuredClone(world), [createInitialAgents()[0]], { random: () => 0 });
  const agent = sim.agents[0];
  const before = sim.world.resources.stone.amount;
  const result = executeAction(sim, agent, { name: "gather_stone", amount: 5 });
  assert.equal(result.success, true);
  assert(sim.world.resources.stone.amount < before);
  const depleted = sim.world.resources.stone.amount;
  for (let i = 0; i < 100; i += 1) advanceWorldDay(sim.world);
  assert.equal(sim.world.resources.stone.amount, depleted);
}

{
  const sim = createSimulation(structuredClone(world), [createInitialAgents()[0]], { random: () => 0 });
  const agent = sim.agents[0];
  sim.world.resources.water.amount = 3;
  const result = executeAction(sim, agent, { name: "drink", amount: 5 });
  assert.equal(result.success, true);
  assert.equal(sim.world.resources.water.amount, 0);
  advanceWorldDay(sim.world);
  assert.equal(sim.world.resources.water.amount, 1000);
}

console.log("Lúmina ecology audit: consumo, regeneración y recurso finito verificados.");
