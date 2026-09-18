// Motor de simulación de Lúmina.
// Coordina tiempo, necesidades, percepción y decisiones sin escribir una historia.

import { perceiveWorld } from "./perception.js";
import { updateNeeds, applyNeedConsequences } from "./needs.js";
import { createDecisionContext, chooseOption } from "./decision.js";
import { advanceWorldDay } from "./world.js";

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

// Avanza el mundo sin asumir que los habitantes harán algo concreto.
export function tick(simulation, hours = 1) {
  if (hours <= 0) return;

  simulation.hour += hours;

  for (const agent of simulation.agents) {
    if (!agent.alive) continue;

    agent.needs = updateNeeds(agent.needs, hours, agent.currentActivity);
    agent.needs = applyNeedConsequences(agent.needs, hours);

    const perception = perceiveWorld(agent, simulation.world, simulation.agents);
    agent.lastPerception = perception;

    // Todavía no imponemos acciones. Si existen posibilidades creadas por otros
    // sistemas, este motor puede evaluarlas; si no existen, el habitante permanece
    // en su actividad actual.
    if (agent.availableOptions?.length) {
      const context = createDecisionContext(agent, perception);
      agent.currentIntent = chooseOption(context, agent.availableOptions);
    }
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
