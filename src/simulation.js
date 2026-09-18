// Motor de simulación de Lúmina.
// Coordina tiempo, necesidades, percepción y decisiones sin escribir una historia.

import { perceiveWorld } from "./perception.js";
import { updateNeeds, applyNeedConsequences } from "./needs.js";
import { createDecisionContext, chooseOption } from "./decision.js";
import { advanceWorldDay } from "./world.js";
import { getKnownActions } from "./discovery.js";

export function createSimulation(world, agents) {
  return {
    world,
    agents,
    hour: world.timeOfDay,
    day: world.day,
    events: [],
    running: false
  };
}

export function recordEvent(simulation, event) {
  const stored = {
    id: event.id ?? `event-${simulation.events.length + 1}`,
    day: simulation.day,
    hour: simulation.hour,
    type: event.type,
    description: event.description,
    participants: event.participants ?? []
  };

  simulation.events.push(stored);
  return stored;
}

// Genera posibilidades únicamente a partir de capacidades básicas,
// acciones descubiertas y lo que el habitante puede percibir.
// No contiene una historia predeterminada.
function generateOptions(agent, perception) {
  const knownActions = getKnownActions(agent);
  const options = [];

  // Descansar es una capacidad corporal básica, no conocimiento del mundo.
  options.push({
    name: "rest",
    baseValue: 1,
    effects: { energy: 0.8 }
  });

  // Beber solo aparece como posibilidad cuando el agua está realmente cerca.
  const seesWater = perception.nearbyResources.some(resource => resource.type === "water");
  if (seesWater) {
    options.push({
      name: "drink",
      amount: 5,
      baseValue: 2,
      effects: { thirst: 1.5 }
    });
  }

  // Las demás acciones solo pueden aparecer después de ser descubiertas.
  for (const action of knownActions) {
    if (["rest", "drink"].includes(action.name)) continue;
    options.push({
      name: action.name,
      baseValue: action.confidence
    });
  }

  return options;
}

// Avanza el mundo sin asumir resultados concretos.
export function tick(simulation, hours = 1) {
  if (hours <= 0) return;

  simulation.hour += hours;

  for (const agent of simulation.agents) {
    if (!agent.alive) continue;

    agent.needs = updateNeeds(agent.needs, hours, agent.currentActivity);
    agent.needs = applyNeedConsequences(agent.needs, hours);

    const perception = perceiveWorld(agent, simulation.world, simulation.agents);
    agent.lastPerception = perception;

    const options = generateOptions(agent, perception);
    const context = createDecisionContext(agent, perception);
    agent.availableOptions = options;
    agent.currentIntent = chooseOption(context, options);
  }

  while (simulation.hour >= 24) {
    simulation.hour -= 24;
    simulation.day += 1;
    simulation.world.day = simulation.day;
    simulation.world.timeOfDay = simulation.hour;
    advanceWorldDay();
  }

  simulation.world.timeOfDay = simulation.hour;
}
