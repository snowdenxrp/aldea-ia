import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { world } from "../src/world.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";

// Existing assistant regressions
{
  const sim = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));
  const alex = sim.agents.find(agent => agent.id === "alex");
  const healthAtStart = alex.needs.health;
  alex.needs.thirst = 0;
  tick(sim, 0.01);
  assert(alex.needs.health <= healthAtStart, "La sed extrema no debe aumentar la salud.");
}

// Regression: death is terminal.
{
  const sim = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));
  const alex = sim.agents.find(agent => agent.id === "alex");
  alex.needs.health = 0;
  tick(sim, 0.01);
  const healthAtDeath = alex.needs.health;
  assert.equal(alex.currentActivity, "dead");
  assert.equal(alex.needs.health, healthAtDeath, "La salud de un muerto no debe cambiar por ticks posteriores.");
}

// Regression: after a non-critical action, the decision remains stable during
// the short commitment window instead of being recomputed every browser tick.
{
  const sim = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));
  const alex = sim.agents.find(agent => agent.id === "alex");
  alex.position = { x: 20, z: 8 };
  alex.needs = { hunger: 70, thirst: 80, energy: 100, social: 100, safety: 100, health: 100 };
  alex.knowledge = [{
    topic: "action:gather_wood",
    belief: "Puedo recolectar madera aquí.",
    confidence: 0.9,
    evidence: [],
    updatedOnDay: 1
  }];
  tick(sim, 0.01);
  const chosen = alex.decisionSnapshot?.chosen?.name;
  assert(chosen, "Debe registrarse una decisión.");
  const snapshot = JSON.stringify(alex.decisionSnapshot);
  assert(alex.decisionCooldownHours > 0 || alex.currentIntent?.name === chosen,
    "La decisión debe quedar comprometida o seguir ejecutándose.");
  tick(sim, 0.01);
  assert.equal(JSON.stringify(alex.decisionSnapshot), snapshot,
    "La decisión no debe cambiar durante la ventana de compromiso.");
}

// Regression: a movement-bound decision remains stable while the inhabitant travels.
{
  const sim = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));
  const alex = sim.agents.find(agent => agent.id === "alex");
  alex.position = { x: -8, z: -8 };
  alex.needs = { hunger: 80, thirst: 80, energy: 100, social: 100, safety: 100, health: 100 };
  tick(sim, 0.01);
  const chosen = alex.currentIntent?.name;
  assert(chosen, "Debe existir una intención activa para probar estabilidad durante movimiento.");
  const snapshot = JSON.stringify(alex.decisionSnapshot);
  const intent = JSON.stringify(alex.currentIntent);
  if (alex.currentIntent?.target) {
    for (let i = 0; i < 5; i += 1) {
      setMovementTarget(alex, alex.currentIntent.target, sim.world.bounds);
      moveAgent(alex, 0.5);
      tick(sim, 0.01);
    }
    assert.equal(JSON.stringify(alex.decisionSnapshot), snapshot,
      "La decisión no debe recomputarse mientras el habitante se desplaza.");
    assert.equal(alex.currentIntent?.name, chosen,
      "La intención no debe cambiar mientras el habitante se desplaza.");
    assert.equal(JSON.stringify(alex.currentIntent), intent,
      "La intención y su objetivo deben conservarse durante el movimiento.");
  }
}

// Regression: a failed non-critical action must not immediately trigger a new decision.
{
  const sim = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));
  const alex = sim.agents.find(agent => agent.id === "alex");
  alex.position = { x: 20, z: 8 };
  alex.needs = { hunger: 70, thirst: 80, energy: 100, social: 100, safety: 100, health: 100 };
  alex.knowledge = [{
    topic: "action:gather_wood",
    belief: "Puedo recolectar madera aquí.",
    confidence: 0.9,
    evidence: [],
    updatedOnDay: 1
  }];
  sim.world.resources.wood.amount = 0;
  tick(sim, 0.01);
  assert.equal(alex.lastActionResult?.success, false, "La acción preparada debe fallar por falta del recurso.");
  const failedSnapshot = JSON.stringify(alex.decisionSnapshot);
  assert(alex.decisionCooldownHours >= 0.05, "Un fallo debe abrir una pequeña ventana antes de recomputar.");
  tick(sim, 0.01);
  assert.equal(JSON.stringify(alex.decisionSnapshot), failedSnapshot,
    "Un fallo no debe causar cambios de decisión en el siguiente tick del navegador.");
}

console.log("Lúmina assistants: todas las pruebas pasaron.\n");
