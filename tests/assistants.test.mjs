import assert from "node:assert/strict";
import { world } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick, recoverCoreAgent } from "../src/simulation.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";
import { runDebugger, runTester, analyzeLumina, classifyRenderProbe } from "../src/assistants/index.js";
import { survivalUrgency } from "../src/decision.js";

const simulation = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));

const debug = runDebugger({ simulation });
assert.equal(debug.status, "ok");
assert.equal(simulation.agents.length, 2);

const test = runTester({ simulation, tick, moveAgent, setMovementTarget });
assert.equal(test.status, "pass", JSON.stringify(test, null, 2));

const analysis = analyzeLumina({ simulation, debuggerReport: debug, testerReport: test });
assert.notEqual(analysis.status, "error");

console.log("Lúmina assistants: todas las pruebas pasaron.");

assert.equal(classifyRenderProbe({ exists:false }), "MESH_MISSING");
assert.equal(classifyRenderProbe({ exists:true, inScene:false }), "NOT_IN_SCENE");
assert.equal(classifyRenderProbe({ exists:true, inScene:true, visible:false }), "HIDDEN");
assert.equal(classifyRenderProbe({ exists:true, inScene:true, visible:true, onScreen:false }), "OFFSCREEN");
assert.equal(classifyRenderProbe({ exists:true, inScene:true, visible:true, onScreen:true }), "OK");

assert(survivalUrgency({ hunger: 10, thirst: 80, energy: 80, social: 80 }) > survivalUrgency({ hunger: 80, thirst: 80, energy: 80, social: 80 }));
assert(survivalUrgency({ hunger: 10, thirst: 10, energy: 80, social: 80 }) > survivalUrgency({ hunger: 10, thirst: 80, energy: 80, social: 80 }));

const core = structuredClone(createInitialAgents()[0]);
core.needs = { hunger: 19, thirst: 17, energy: 18, social: 16, safety: 100, health: 100 };
recoverCoreAgent(core);
assert.equal(core.needs.hunger, 19);
assert.equal(core.needs.thirst, 17);

// Pruebas de comportamiento de supervivencia: la presión debe llegar hasta la acción física.
{
  const sim = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));
  const alex = sim.agents.find(agent => agent.id === "alex");
  const plants = sim.world.resources.wild_plants;
  alex.position = { x: plants.position.x, z: plants.position.z };
  alex.needs = { hunger: 5, thirst: 100, energy: 80, social: 80, safety: 100, health: 100 };
  alex.knowledge = [{
    topic: "action:eat_plant",
    belief: "Esta planta puede servir como alimento.",
    confidence: 0.9,
    evidence: [],
    updatedOnDay: 1
  }];
  const beforePlants = plants.amount;
  tick(sim, 0.01);
  assert.equal(alex.lastActionResult?.success, true, "Un Alex hambriento debe poder comer una planta disponible.");
  assert.equal(alex.lastActionName, "eat_plant");
  assert(plants.amount < beforePlants, "Comer debe consumir plantas del mundo.");
  assert(alex.needs.hunger > 5, "Comer debe recuperar hambre.");
}

{
  const sim = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));
  const alex = sim.agents.find(agent => agent.id === "alex");
  const water = sim.world.resources.water;
  alex.position = { x: water.position.x, z: water.position.z };
  alex.needs = { hunger: 100, thirst: 5, energy: 80, social: 80, safety: 100, health: 100 };
  const beforeWater = water.amount;
  tick(sim, 0.01);
  assert.equal(alex.lastActionResult?.success, true, "Un Alex sediento debe poder beber agua disponible.");
  assert.equal(alex.lastActionName, "drink");
  assert(water.amount < beforeWater, "Beber debe consumir agua del mundo.");
  assert(alex.needs.thirst > 5, "Beber debe recuperar sed.");
}

{
  const sim = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));
  const alex = sim.agents.find(agent => agent.id === "alex");
  alex.needs = { hunger: 0, thirst: 0, energy: 80, social: 80, safety: 100, health: 50 };
  tick(sim, 1);
  assert(alex.needs.health < 50, "Necesidades críticas ignoradas deben deteriorar salud.");
}

