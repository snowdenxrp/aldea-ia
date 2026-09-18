// Motor de simulación de Lúmina.
// Coordina tiempo, necesidades, percepción, decisiones, acciones y aprendizaje.
// No escribe una historia: cada consecuencia surge de las reglas del mundo.

import { perceiveWorld } from "./perception.js";
import { updateNeeds, applyNeedConsequences } from "./needs.js";
import { createDecisionContext, chooseOption } from "./decision.js";
import { advanceWorldDay } from "./world.js";
import { getKnownActions, discoverAction, updateActionBelief } from "./discovery.js";
import { executeAction } from "./actions.js";
import { remember } from "./memory.js";

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

function generateOptions(agent, perception) {
  const knownActions = getKnownActions(agent);
  const options = [];

  options.push({
    name: "rest",
    baseValue: 1,
    effects: { energy: 0.8 }
  });

  const seesWater = perception.nearbyResources.some(resource => resource.type === "water");
  if (seesWater) {
    options.push({
      name: "drink",
      amount: 5,
      baseValue: 2,
      effects: { thirst: 1.5 }
    });
  }

  for (const action of knownActions) {
    if (["rest", "drink"].includes(action.name)) continue;
    options.push({
      name: action.name,
      baseValue: action.confidence
    });
  }

  return options;
}

function getActionTarget(agent, actionName, perception, world) {
  if (actionName === "drink") {
    const water = world.resources.water;
    return water.position;
  }

  if (actionName === "gather_wood") {
    return world.resources.wood.position;
  }

  if (actionName === "gather_stone") {
    return world.resources.stone.position;
  }

  return null;
}

function performDecision(simulation, agent) {
  const intent = agent.currentIntent;
  if (!intent) return;

  if (agent.movement?.moving) return;

  const target = getActionTarget(agent, intent.name, agent.lastPerception, simulation.world);

  // Las acciones con un lugar de trabajo requieren desplazamiento.
  if (target) {
    const distance = Math.hypot(agent.position.x - target.x, agent.position.z - target.z);
    if (distance > 1.5) {
      agent.currentActivity = "moving";
      agent.currentIntent = { ...intent, target: { x: target.x, z: target.z } };
      return;
    }
  }

  const result = executeAction(simulation, agent, intent);
  agent.lastActionResult = result;

  if (result.success) {
    const description = describeAction(agent, intent.name, result);
    const event = recordEvent(simulation, {
      type: "action",
      description,
      participants: [agent.id]
    });

    remember(agent, {
      id: event.id,
      day: simulation.day,
      type: "experience",
      description,
      importance: intent.name === "rest" ? 0.2 : 0.5,
      emotionalWeight: 0
    });

    if (intent.name === "gather_wood" || intent.name === "gather_stone") {
      updateActionBelief(agent, intent.name, 1, simulation.day, description);
    }
  } else {
    const description = `${agent.name} intentó ${intent.name}, pero no pudo hacerlo (${result.reason ?? "sin resultado"}).`;
    const event = recordEvent(simulation, {
      type: "failed_action",
      description,
      participants: [agent.id]
    });

    remember(agent, {
      id: event.id,
      day: simulation.day,
      type: "experience",
      description,
      importance: 0.45,
      emotionalWeight: -0.15
    });

    updateActionBelief(agent, intent.name, -1, simulation.day, description);
  }

  agent.currentIntent = null;
}

function discoverNearbyActions(agent, perception, simulation) {
  const discoveries = [];

  // Una experiencia simple puede revelar que un recurso puede recogerse.
  for (const resource of perception.nearbyResources) {
    if (resource.type === "wood") {
      discoveries.push({
        actionName: "gather_wood",
        belief: "Creo que puedo recoger madera aquí.",
        confidence: 0.2,
        evidence: "Encontré madera en este lugar.",
        outcome: 0.2,
        reliability: 0.5,
        day: simulation.day
      });
    }

    if (resource.type === "stone") {
      discoveries.push({
        actionName: "gather_stone",
        belief: "Creo que puedo recoger piedra aquí.",
        confidence: 0.2,
        evidence: "Encontré piedra en este lugar.",
        outcome: 0.2,
        reliability: 0.5,
        day: simulation.day
      });
    }
  }

  for (const discovery of discoveries) discoverAction(agent, discovery);
}

function describeAction(agent, actionName, result) {
  switch (actionName) {
    case "rest":
      return `${agent.name} descansó y recuperó energía.`;
    case "drink":
      return `${agent.name} bebió agua y recuperó parte de la sed.`;
    case "gather_wood":
      return `${agent.name} recogió ${result.amount} unidad(es) de madera.`;
    case "gather_stone":
      return `${agent.name} recogió ${result.amount} unidad(es) de piedra.`;
    default:
      return `${agent.name} realizó la acción ${actionName}.`;
  }
}

export function tick(simulation, hours = 1) {
  if (hours <= 0) return;

  simulation.hour += hours;

  for (const agent of simulation.agents) {
    if (!agent.alive) continue;

    agent.needs = updateNeeds(agent.needs, hours, agent.currentActivity);
    agent.needs = applyNeedConsequences(agent.needs, hours);

    const perception = perceiveWorld(agent, simulation.world, simulation.agents);
    agent.lastPerception = perception;

    // El descubrimiento ocurre a partir de lo que realmente percibe el habitante.
    discoverNearbyActions(agent, perception, simulation);

    // Si llegó al destino de su intención anterior, puede ejecutar la acción.
    if (agent.currentIntent?.target) {
      const target = agent.currentIntent.target;
      const distance = Math.hypot(agent.position.x - target.x, agent.position.z - target.z);
      if (distance <= 1.5) {
        agent.currentIntent = { ...agent.currentIntent, target: null };
      }
    }

    if (!agent.currentIntent || !agent.currentIntent.target) {
      const options = generateOptions(agent, perception);
      const context = createDecisionContext(agent, perception);
      agent.availableOptions = options;
      agent.currentIntent = chooseOption(context, options);
    }

    performDecision(simulation, agent);
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
