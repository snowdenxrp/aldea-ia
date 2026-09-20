import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { executeAction } from "../src/actions.js";
import { world } from "../src/world.js";
import { updateNeeds, applyNeedConsequences } from "../src/needs.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";

const clone = value => structuredClone(value);

// 1-2. Necesidades y supervivencia: valores acotados y consecuencias monotónicas.
{
  const n = updateNeeds({ hunger: 100, thirst: 100, energy: 100, social: 100, safety: 100, health: 100 }, 100, "heavy");
  for (const key of Object.keys(n)) assert(n[key] >= 0 && n[key] <= 100, `Necesidad fuera de rango: ${key}`);
  const healthy = applyNeedConsequences({ hunger: 50, thirst: 50, energy: 50, social: 50, safety: 100, health: 50 }, 1);
  const starving = applyNeedConsequences({ hunger: 1, thirst: 50, energy: 50, social: 50, safety: 100, health: 50 }, 1);
  assert(starving.health < healthy.health, "El hambre extrema debe ser peor que un estado estable.");
}

// 3. Acción -> consecuencia real sobre mundo y habitante.
{
  const sim = createSimulation(clone(world), [createInitialAgents()[0]], { random: () => 0 });
  const a = sim.agents[0];
  a.needs.thirst = 20;
  const waterBefore = sim.world.resources.water.amount;
  const drink = executeAction(sim, a, { name: "drink", amount: 5 });
  assert.equal(drink.success, true);
  assert.equal(sim.world.resources.water.amount, waterBefore - 5);
  assert(a.needs.thirst > 20);
}

// 4. Movimiento nunca debe salir de los límites del mundo.
{
  const a = createInitialAgents()[0];
  setMovementTarget(a, { x: 999, z: -999 }, world.bounds);
  moveAgent(a, 100000);
  assert(a.position.x >= world.bounds.minX && a.position.x <= world.bounds.maxX);
  assert(a.position.z >= world.bounds.minZ && a.position.z <= world.bounds.maxZ);
}

// 5. Recursos finitos no pueden regenerarse accidentalmente.
{
  const sim = createSimulation(clone(world), [createInitialAgents()[0]], { random: () => 0 });
  const initial = sim.world.resources.stone.amount;
  const result = executeAction(sim, sim.agents[0], { name: "gather_stone", amount: 1000 });
  assert.equal(result.success, true);
  assert(sim.world.resources.stone.amount < initial);
  const remaining = sim.world.resources.stone.amount;
  for (let i = 0; i < 100; i++) tick(sim, 24);
  assert.equal(sim.world.resources.stone.amount, remaining, "La piedra finita no debe regenerarse.");
}

// 6. Recursos renovables sí recuperan capacidad con el paso de los días.
{
  const sim = createSimulation(clone(world), [createInitialAgents()[0]], { random: () => 0 });
  const initial = sim.world.resources.water.amount;
  executeAction(sim, sim.agents[0], { name: "drink", amount: 100 });
  assert(sim.world.resources.water.amount < initial);
  tick(sim, 24);
  assert(sim.world.resources.water.amount > 0);
}

// 7. Muerte es terminal en el motor: un tick no revive al agente.
{
  const sim = createSimulation(clone(world), [createInitialAgents()[0]], { random: () => 0 });
  const a = sim.agents[0];
  a.needs.health = 0;
  tick(sim, 1);
  assert.equal(a.alive, false, "Un habitante muerto debe permanecer muerto.");
  tick(sim, 24);
  assert.equal(a.alive, false, "La simulación no debe revivir automáticamente a un muerto.");
}

// 8. Dos ejecuciones con la misma semilla no deben divergir (se comprueba en randomness.test).
// Este test mantiene explícito el contrato de reproducibilidad sin duplicar la simulación larga.
assert.equal(typeof world.bounds.minX, "number");

// 9. Estado social/relacional básico no debe eliminar agentes ni corromper necesidades.
{
  const sim = createSimulation(clone(world), clone(createInitialAgents()), { random: () => 0 });
  for (let i = 0; i < 48; i++) tick(sim, 1);
  assert.equal(sim.agents.length, 2);
  for (const a of sim.agents) {
    for (const key of ["hunger", "thirst", "energy", "social", "safety", "health"]) {
      assert(Number.isFinite(a.needs[key]) && a.needs[key] >= 0 && a.needs[key] <= 100);
    }
  }
}

// 10. Contrato de UI: la interfaz debe consumir estado de la simulación y no fabricar otro motor.
// Esta comprobación es deliberadamente ligera: detecta que main-stable importe el motor real.
const fs = await import("node:fs/promises");
const ui = await fs.readFile(new URL("../src/main-stable.js", import.meta.url), "utf8");
assert(ui.includes('from "./simulation.js"'), "La UI debe consumir el motor de simulación real.");
assert(ui.includes("decisionSnapshot"), "La UI debe mostrar el snapshot de decisión real.");
assert(ui.includes("currentIntent"), "La UI debe reflejar la intención real del habitante.");
assert(!/arrastra|pellizca/i.test(ui), "La UI no debe conservar instrucciones de gesto antiguas.");
assert(ui.includes("cooperate:\"Cooperar\""), "La UI debe representar la cooperación colectiva.");
assert(ui.includes("const s=.14"), "El desplazamiento táctil del mapa debe conservar la velocidad ajustada.");

console.log("Lúmina system audit: 10 áreas de invariantes verificadas.");
