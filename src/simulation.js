// Motor de simulación de Lúmina.
// Coordina tiempo, necesidades, percepción, decisiones, acciones y aprendizaje.
// No escribe una historia: cada consecuencia surge de las reglas del mundo.

import { perceiveWorld } from "./perception.js";
import { updateNeeds, applyNeedConsequences } from "./needs.js";
import { createDecisionContext, evaluateOptions, chooseOption } from "./decision.js";
import { advanceWorldDay } from "./world.js";
import { getKnownActions, discoverAction, updateActionBelief } from "./discovery.js";
import { executeAction } from "./actions.js";
import { remember, learnFromEvidence } from "./memory.js";
import { recordInteraction } from "./relationships.js";

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
    baseValue: 0.8,
    effects: { energy: 0.9 }
  });

  const seesWater = perception.nearbyResources.some(resource => resource.type === "water");
  if (seesWater) {
    options.push({
      name: "drink",
      amount: 5,
      baseValue: 0.5,
      effects: { thirst: 1.8 }
    });
  }

  // Un encuentro solo es posible si hay otra persona realmente cerca.
  if (perception.visibleAgents.length > 0) {
    options.push({
      name: "socialize",
      baseValue: 0.25,
      effects: { social: 1.4 }
    });

    const shareable = agent.knowledge.some(item => item.confidence >= 0.3);
    if (shareable) {
      options.push({
        name: "share_knowledge",
        baseValue: 0.05,
        effects: { social: 0.6 },
        knowledgeBonus: knowledge => Math.min(0.35, knowledge.filter(item => item.confidence >= 0.3).length * 0.08)
      });
    }
  }

  for (const action of knownActions) {
    if (["rest", "drink"].includes(action.name)) continue;

    const option = {
      name: action.name,
      baseValue: action.confidence,
      knowledgeBonus: knowledge => {
        const item = knowledge.find(entry => entry.topic === "action:" + action.name);
        return item ? item.confidence * 0.15 : 0;
      }
    };

    if (action.name === "eat_plant") {
      option.effects = { hunger: 2.2 };
      option.amount = 1;
    }

    if (action.name === "catch_fish") {
      option.effects = { hunger: 1.6 };
      option.amount = 1;
    }

    options.push(option);
  }

  const seesPlants = perception.nearbyResources.some(resource => resource.type === "wild_plants");
  if (seesPlants && !knownActions.some(action => action.name === "eat_plant")) {
    options.push({
      name: "explore_plants",
      baseValue: 0.35,
      // Investigar una posible fuente de alimento compite de forma natural
      // con descansar cuando el hambre empieza a ser relevante.
      effects: { hunger: 0.8 },
      memoryBonus: memories =>
        memories.some(memory => memory.description.toLowerCase().includes("planta"))
          ? 0.25
          : 0
    });
  }

  const seesFish = perception.nearbyResources.some(resource => resource.type === "fish");
  if (seesFish && !knownActions.some(action => action.name === "catch_fish")) {
    options.push({
      name: "explore_fishing",
      baseValue: 0.3,
      // Explorar la pesca también adquiere valor cuando falta alimento.
      effects: { hunger: 0.65 }
    });
  }

  return options;
}

function getActionTarget(agent, actionName, perception, world) {
  if (actionName === "drink") return world.resources.water.position;
  if (actionName === "gather_wood") return world.resources.wood.position;
  if (actionName === "gather_stone") return world.resources.stone.position;
  if (actionName === "eat_plant" || actionName === "explore_plants") return world.resources.wild_plants.position;
  if (actionName === "catch_fish" || actionName === "explore_fishing") return world.resources.fish.position;

  if (actionName === "socialize" && perception.visibleAgents.length > 0) {
    const nearest = [...perception.visibleAgents].sort((a, b) => a.distance - b.distance)[0];
    const other = simulationAgentById(agent, nearest.id);
    return other?.position ?? null;
  }

  return null;
}

let currentSimulationAgents = [];

function simulationAgentById(agent, id) {
  return currentSimulationAgents.find(other => other.id === id && other.alive && other.id !== agent.id) ?? null;
}

function performDecision(simulation, agent) {
  currentSimulationAgents = simulation.agents;

  const intent = agent.currentIntent;
  if (!intent) return;
  if (agent.movement?.moving) return;

  const target = getActionTarget(agent, intent.name, agent.lastPerception, simulation.world);

  if (target) {
    const distance = Math.hypot(agent.position.x - target.x, agent.position.z - target.z);
    if (distance > 1.5) {
      agent.currentActivity = "moving";
      agent.currentIntent = { ...intent, target: { x: target.x, z: target.z } };
      return;
    }
  }

  if (intent.name === "socialize") {
    performSocialInteraction(simulation, agent);
    agent.currentIntent = null;
    return;
  }

  if (intent.name === "share_knowledge") {
    performKnowledgeSharing(simulation, agent);
    agent.currentIntent = null;
    return;
  }

  if (intent.name === "explore_plants") {
    discoverAction(agent, {
      actionName: "eat_plant",
      belief: "Creo que algunas plantas de este lugar podrían servirme como alimento.",
      confidence: 0.18,
      evidence: "Observé plantas silvestres y decidí investigar si tienen algún uso.",
      outcome: 0.1,
      reliability: 0.4,
      day: simulation.day
    });
    recordExploration(simulation, agent, "plantas");
    agent.currentIntent = null;
    return;
  }

  if (intent.name === "explore_fishing") {
    discoverAction(agent, {
      actionName: "catch_fish",
      belief: "Creo que puedo intentar capturar los peces que veo.",
      confidence: 0.15,
      evidence: "Observé peces en el agua y decidí investigar si puedo capturarlos.",
      outcome: 0.1,
      reliability: 0.4,
      day: simulation.day
    });
    recordExploration(simulation, agent, "pesca");
    agent.currentIntent = null;
    return;
  }

  const result = executeAction(simulation, agent, intent);
  agent.lastActionResult = result;

  if (result.success) {
    improveSkillFromAction(agent, intent.name, simulation.day);
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

    updateActionBelief(agent, intent.name, 1, simulation.day, description);
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

function performSocialInteraction(simulation, agent) {
  const visible = agent.lastPerception.visibleAgents
    .filter(other => other.distance <= 1.8)
    .sort((a, b) => a.distance - b.distance);

  if (visible.length === 0) {
    agent.lastActionResult = { success: false, reason: "no_person_nearby" };
    return;
  }

  const other = simulation.agents.find(candidate => candidate.id === visible[0].id && candidate.alive);
  if (!other) return;

  const firstMeeting = !agent.relationships.some(rel => rel.agentId === other.id);

  const roll = Math.random();
  let interaction;

  if (roll < 0.55) {
    interaction = {
      type: "conversation",
      description: `${agent.name} y ${other.name} tuvieron una interacción cordial.`,
      trust: 0.08,
      cooperation: 0.05,
      affection: 0.03,
      tension: 0,
      resentment: 0
    };
  } else if (roll < 0.85) {
    interaction = {
      type: "conversation",
      description: `${agent.name} y ${other.name} se encontraron, pero la interacción fue neutral.`,
      trust: 0.01,
      cooperation: 0,
      affection: 0,
      tension: 0.01,
      resentment: 0
    };
  } else {
    interaction = {
      type: "conversation",
      description: `${agent.name} y ${other.name} tuvieron un encuentro incómodo.`,
      trust: -0.05,
      cooperation: -0.02,
      affection: -0.01,
      tension: 0.08,
      resentment: 0.04
    };
  }

  recordInteraction(agent, other, { ...interaction, day: simulation.day });
  recordInteraction(other, agent, { ...interaction, day: simulation.day });

  agent.needs.social = Math.min(100, agent.needs.social + 18);
  other.needs.social = Math.min(100, other.needs.social + 18);

  const event = recordEvent(simulation, {
    type: firstMeeting ? "first_meeting" : "social_interaction",
    description: firstMeeting
      ? `${agent.name} conoció por primera vez a ${other.name}. ${interaction.description}`
      : interaction.description,
    participants: [agent.id, other.id]
  });

  remember(agent, {
    id: event.id,
    day: simulation.day,
    type: firstMeeting ? "first_meeting" : "social",
    description: event.description,
    participants: [agent.id, other.id],
    emotionalWeight: interaction.affection - interaction.resentment,
    importance: firstMeeting ? 0.9 : 0.4
  });

  remember(other, {
    id: event.id,
    day: simulation.day,
    type: firstMeeting ? "first_meeting" : "social",
    description: event.description,
    participants: [agent.id, other.id],
    emotionalWeight: interaction.affection - interaction.resentment,
    importance: firstMeeting ? 0.9 : 0.4
  });

  agent.lastActionResult = {
    success: true,
    effect: firstMeeting ? "first_meeting" : "social_interaction",
    otherAgentId: other.id
  };
}

function performKnowledgeSharing(simulation, agent) {
  const visible = agent.lastPerception.visibleAgents.filter(other => other.distance <= 1.8).sort((a, b) => a.distance - b.distance);
  if (visible.length === 0) {
    agent.lastActionResult = { success: false, reason: "no_person_nearby" };
    return;
  }

  const other = simulation.agents.find(candidate => candidate.id === visible[0].id && candidate.alive);
  if (!other) return;

  const candidates = agent.knowledge.filter(item => item.confidence >= 0.3);
  if (candidates.length === 0) {
    agent.lastActionResult = { success: false, reason: "nothing_to_share" };
    return;
  }

  const relationship = agent.relationships.find(rel => rel.agentId === other.id);
  const trust = relationship?.trust ?? 0;
  const cooperation = relationship?.cooperation ?? 0;
  const shareProbability = Math.max(0.15, Math.min(0.9, 0.35 + trust * 0.25 + cooperation * 0.2));

  if (Math.random() > shareProbability) {
    const description = `${agent.name} habló con ${other.name}, pero decidió no compartir información importante.`;
    const event = recordEvent(simulation, { type: "withheld_knowledge", description, participants: [agent.id, other.id] });
    remember(agent, { id: event.id, day: simulation.day, type: "social", description, participants: [agent.id, other.id], emotionalWeight: 0, importance: 0.35 });
    agent.lastActionResult = { success: true, effect: "knowledge_withheld" };
    return;
  }

  const knowledge = candidates[Math.floor(Math.random() * candidates.length)];
  const communicationFidelity = Math.max(0.55, Math.min(0.95, 0.75 + trust * 0.15));
  const event = recordEvent(simulation, {
    type: "knowledge_shared",
    description: `${agent.name} compartió con ${other.name} lo que cree saber sobre "${knowledge.topic}".`,
    participants: [agent.id, other.id]
  });

  learnFromEvidence(other, {
    topic: knowledge.topic,
    belief: knowledge.belief,
    description: `${agent.name} me contó que: ${knowledge.belief}`,
    outcome: trust >= 0 ? 0.4 : -0.1,
    reliability: communicationFidelity,
    source: "testimony:" + agent.id,
    day: simulation.day
  });

  remember(agent, { id: event.id, day: simulation.day, type: "knowledge_shared", description: event.description, participants: [agent.id, other.id], emotionalWeight: 0.05, importance: 0.55 });
  remember(other, { id: event.id, day: simulation.day, type: "knowledge_received", description: `${agent.name} me contó que: ${knowledge.belief}`, participants: [agent.id, other.id], emotionalWeight: trust >= 0 ? 0.05 : -0.03, importance: 0.6 });

  agent.needs.social = Math.min(100, agent.needs.social + 10);
  other.needs.social = Math.min(100, other.needs.social + 8);
  agent.lastActionResult = { success: true, effect: "knowledge_shared", topic: knowledge.topic, receiverId: other.id };
}

function recordExploration(simulation, agent, subject) {
  const description = `${agent.name} investigó ${subject} y obtuvo nueva información.`;
  const event = recordEvent(simulation, {
    type: "discovery",
    description,
    participants: [agent.id]
  });

  remember(agent, {
    id: event.id,
    day: simulation.day,
    type: "discovery",
    description,
    importance: 0.6,
    emotionalWeight: 0.05
  });
}

function discoverNearbyActions(agent, perception, simulation) {
  const discoveries = [];

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

function improveSkillFromAction(agent, actionName, day) {
  const existing = agent.skills.find(skill => skill.name === actionName);

  if (!existing) {
    agent.skills.push({
      name: actionName,
      level: 0.1,
      uses: 1,
      learnedOnDay: day,
      lastPracticedDay: day
    });
    return;
  }

  existing.uses += 1;
  existing.level = Math.min(1, existing.level + 0.06 * (1 - existing.level));
  existing.lastPracticedDay = day;
}

function describeAction(agent, actionName, result) {
  switch (actionName) {
    case "rest":
      return `${agent.name} descansó y recuperó energía.`;
    case "drink":
      return `${agent.name} bebió agua y recuperó parte de la sed.`;
    case "eat_plant":
      return `${agent.name} experimentó comiendo una planta y observó sus efectos.`;
    case "catch_fish":
      return `${agent.name} capturó ${result.amount} pez/peces.`;
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

    discoverNearbyActions(agent, perception, simulation);

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
      const evaluatedOptions = evaluateOptions(context, options);

      agent.availableOptions = options;
      agent.decisionSnapshot = {
        chosen: null,
        considered: evaluatedOptions
          .slice()
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(option => ({
            name: option.name,
            score: option.score
          }))
      };

      agent.currentIntent = chooseOption(context, options);

      if (agent.currentIntent) {
        agent.decisionSnapshot.chosen = {
          name: agent.currentIntent.name,
          score: agent.currentIntent.score
        };
      }
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
