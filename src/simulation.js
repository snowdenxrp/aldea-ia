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
import { stopMovement } from "./movement.js";
import { getRandom } from "./random.js";

export function createSimulation(world, agents, options = {}) {
  return {
    world,
    agents,
    hour: Number(world.timeOfDay) || 8,
    day: Number(world.day) || 1,
    events: [],
    running: false,
    random: options.random ?? null
  };
}

export function recordEvent(simulation, event) {
  const stored = { id: event.id ?? `event-${simulation.events.length + 1}`, day: simulation.day, hour: simulation.hour, type: event.type, description: event.description, participants: event.participants ?? [] };
  simulation.events.push(stored);
  return stored;
}

function generateOptions(agent, perception, world, random = Math.random) {
  const knownActions = getKnownActions(agent);
  const options = [];
  options.push({ name: "rest", baseValue: 0, effects: { energy: 1.2 }, distance: 0 });
  const water = perception.nearbyResources.find(resource => resource.type === "water");
  if (water) options.push({ name: "drink", amount: 5, baseValue: 0.5, effects: { thirst: 1.8 }, distance: water.distance });
  if (perception.visibleAgents.length > 0) {
    const nearest = [...perception.visibleAgents].sort((a, b) => a.distance - b.distance)[0];
    options.push({ name: "socialize", baseValue: 0.25, effects: { social: 1.4 }, distance: nearest.distance, relationshipBonus: relationships => {
      const relationship = relationships.find(item => item.agentId === nearest.id);
      if (!relationship) return 0.15;
      return Math.max(-0.2, relationship.affection * 0.25 + relationship.trust * 0.15 - relationship.tension * 0.2);
    }});
    if (agent.knowledge.some(item => item.confidence >= 0.3)) options.push({ name: "share_knowledge", baseValue: 0.05, effects: { social: 0.6 }, distance: nearest.distance, knowledgeBonus: knowledge => Math.min(0.35, knowledge.filter(item => item.confidence >= 0.3).length * 0.08) });
  }
  for (const action of knownActions) {
    if (["rest", "drink"].includes(action.name)) continue;
    if (action.name === "eat_fish" && !agent.inventory.some(item => item.type === "fish" && item.amount > 0)) continue;
    const resourceByAction = { eat_plant: "wild_plants", catch_fish: "fish", gather_wood: "wood", gather_stone: "stone" };
    const requiredResource = resourceByAction[action.name];
    if (requiredResource && Number(world.resources?.[requiredResource]?.amount ?? 0) <= 0) continue;
    const option = { name: action.name, baseValue: action.confidence, distance: getKnownActionDistance(action.name, perception), knowledgeBonus: knowledge => { const item = knowledge.find(entry => entry.topic === "action:" + action.name); return item ? item.confidence * 0.15 : 0; } };
    if (action.name === "eat_plant") { option.effects = { hunger: 2.2 }; option.amount = 1; }
    if (action.name === "eat_fish") { option.effects = { hunger: 2.3 }; option.amount = 1; }
    if (action.name === "catch_fish") { option.effects = { hunger: 1.6 }; option.amount = 1; }
    options.push(option);
  }
  const resourceDiscovery = [["wild_plants", "explore_plants", "eat_plant", "planta", 0.9, 0.8], ["fish", "explore_fishing", "catch_fish", "pesca", 0.85, 0.75], ["wood", "explore_wood", "gather_wood", "madera", 0.75, 0.65], ["stone", "explore_stone", "gather_stone", "piedra", 0.75, 0.65]];
  for (const [resourceType, optionName, actionName, keyword, explorationValue, baseValue] of resourceDiscovery) {
    const resource = perception.nearbyResources.find(item => item.type === resourceType);
    if (!resource || knownActions.some(action => action.name === actionName)) continue;
    const option = { name: optionName, baseValue, explorationValue, novelty: 1, knowledgeTopic: "action:" + actionName, memoryKeyword: keyword, distance: resource.distance };
    if (resourceType === "wild_plants") option.effects = { hunger: 0.8 };
    if (resourceType === "fish") option.effects = { hunger: 0.65 };
    options.push(option);
  }
  const explorationTarget = createExplorationTarget(agent, world, random);
  const explorationDistance = Math.hypot(explorationTarget.x - agent.position.x, explorationTarget.z - agent.position.z);
  options.push({ name: "explore_area", baseValue: 0.28, explorationValue: 0.7, novelty: 0.8, distance: explorationDistance, target: explorationTarget });
  return options;
}

function getKnownActionDistance(actionName, perception) {
  if (actionName === "eat_fish") return 0;
  const map = { drink: "water", eat_plant: "wild_plants", catch_fish: "fish", gather_wood: "wood", gather_stone: "stone" };
  const type = map[actionName];
  if (!type) return 0;
  return perception.nearbyResources.find(resource => resource.type === type)?.distance ?? 25;
}

function createExplorationTarget(agent, world, random = Math.random) {
  const bounds = world?.bounds ?? { minX: -34, maxX: 34, minZ: -34, maxZ: 34 };
  const angle = random() * Math.PI * 2;
  const distance = 4 + random() * 6;
  return { x: Math.max(bounds.minX, Math.min(bounds.maxX, agent.position.x + Math.cos(angle) * distance)), z: Math.max(bounds.minZ, Math.min(bounds.maxZ, agent.position.z + Math.sin(angle) * distance)) };
}

function getActionTarget(agent, actionName, perception, world, agents) {
  if (actionName === "explore_area") return agent.currentIntent?.target ?? null;
  if (actionName === "drink") return world.resources.water.position;
  if (actionName === "gather_wood" || actionName === "explore_wood") return world.resources.wood.position;
  if (actionName === "gather_stone" || actionName === "explore_stone") return world.resources.stone.position;
  if (actionName === "eat_plant" || actionName === "explore_plants") return world.resources.wild_plants.position;
  if (actionName === "catch_fish" || actionName === "explore_fishing") return world.resources.fish.position;
  if (actionName === "socialize" || actionName === "share_knowledge") {
    const nearest = [...perception.visibleAgents].sort((a, b) => a.distance - b.distance)[0];
    const other = agents.find(candidate => candidate.id === nearest?.id && candidate.alive && candidate.id !== agent.id);
    return other?.position ?? null;
  }
  return null;
}

function buildCriticalHungerIntent(simulation, agent, perception) {
  if (agent.needs.hunger > 70) return null;
  const knownActions = getKnownActions(agent);
  if (agent.needs.thirst <= 25) return null;
  const fishInventory = agent.inventory?.some(item => item.type === "fish" && item.amount > 0);
  if (fishInventory && knownActions.some(action => action.name === "eat_fish")) {
    return { name: "eat_fish", amount: Math.max(1, Math.min(3, Math.ceil((20 - agent.needs.hunger) / 14))), baseValue: 999, effects: { hunger: 14 }, target: null };
  }
  const rememberedPlants = agent.knownResources?.wild_plants;
  const plants = perception.nearbyResources.find(resource => resource.type === "wild_plants") ?? (rememberedPlants ? { type: "wild_plants", distance: Math.hypot(agent.position.x - rememberedPlants.x, agent.position.z - rememberedPlants.z) } : null);
  if (plants && simulation.world.resources.wild_plants.amount > 0) {
    if (knownActions.some(action => action.name === "eat_plant")) {
      return { name: "eat_plant", amount: Math.max(1, Math.min(4, Math.ceil((20 - agent.needs.hunger) / 8.67))), baseValue: 999, effects: { hunger: 8.67 }, distance: plants.distance, target: { ...simulation.world.resources.wild_plants.position } };
    }
    return { name: "explore_plants", baseValue: 999, explorationValue: 1, novelty: 1, distance: plants.distance, target: { ...simulation.world.resources.wild_plants.position } };
  }
  const fish = perception.nearbyResources.find(resource => resource.type === "fish");
  const fishFailures = Number(agent.actionFailures?.catch_fish ?? 0);
  if (fish && simulation.world.resources.fish.amount > 0 && knownActions.some(action => action.name === "catch_fish") && fishFailures < 3 && agent.needs.energy > 0) {
    return { name: "catch_fish", amount: 1, baseValue: 999, effects: { hunger: 1.6 }, distance: fish.distance, target: { ...simulation.world.resources.fish.position } };
  }
  if (fishFailures >= 3 || agent.needs.energy <= 10) {
    const anchor = agent.knownResources?.water ?? agent.knownResources?.fish;
    if (anchor) {
      const angle = getRandom(simulation)() * Math.PI * 2;
      const distance = 8 + getRandom(simulation)() * 10;
      const bounds = simulation.world.bounds ?? { minX: -34, maxX: 34, minZ: -34, maxZ: 34 };
      const target = {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, anchor.x + Math.cos(angle) * distance)),
        z: Math.max(bounds.minZ, Math.min(bounds.maxZ, anchor.z + Math.sin(angle) * distance))
      };
      return { name: "explore_area", baseValue: 999, explorationValue: 1, novelty: 1, target };
    }
    const target = createExplorationTarget(agent, simulation.world, getRandom(simulation));
    return { name: "explore_area", baseValue: 999, explorationValue: 1, novelty: 1, target };
  }
  return null;
}

function performDecision(simulation, agent) {
  const intent = agent.currentIntent;
  if (!intent) return;
  const target = getActionTarget(agent, intent.name, agent.lastPerception, simulation.world, simulation.agents);
  if (agent.movement?.moving) {
    const movementTarget = agent.movement.target ?? target;
    const distanceToTarget = movementTarget ? Math.hypot(agent.position.x - movementTarget.x, agent.position.z - movementTarget.z) : Infinity;
    if (distanceToTarget > 1.5) return;
    stopMovement(agent);
  }
  if (target) {
    const distance = Math.hypot(agent.position.x - target.x, agent.position.z - target.z);
    if (distance > 1.5) { agent.currentActivity = "moving"; agent.currentIntent = { ...intent, target: { x: target.x, z: target.z } }; return; }
  }
  if (intent.name === "socialize") { performSocialInteraction(simulation, agent); agent.lastActionName = "socialize"; agent.currentIntent = null; return; }
  if (intent.name === "share_knowledge") { performKnowledgeSharing(simulation, agent); agent.lastActionName = "share_knowledge"; agent.currentIntent = null; return; }
  if (intent.name === "explore_area") { const description = agent.name + " exploró una zona nueva de su entorno."; const event = recordEvent(simulation, { type: "exploration", description, participants: [agent.id] }); remember(agent, { id: event.id, day: simulation.day, type: "exploration", description, importance: 0.45, emotionalWeight: 0.03 }); agent.lastActionName = "explore_area"; agent.lastActionResult = { success: true, effect: "area_explored" }; agent.currentIntent = null; return; }
  if (intent.name === "explore_plants" || intent.name === "explore_fishing" || intent.name === "explore_wood" || intent.name === "explore_stone") {
    const data = { explore_plants: ["eat_plant", "plantas"], explore_fishing: ["catch_fish", "pesca"], explore_wood: ["gather_wood", "madera"], explore_stone: ["gather_stone", "piedra"] }[intent.name];
    discoverAction(agent, { actionName: data[0], belief: `Creo que puedo investigar ${data[1]} aquí.`, confidence: 0.15, evidence: `Observé ${data[1]} y decidí investigar.`, outcome: 0.1, reliability: 0.4, day: simulation.day });
    recordExploration(simulation, agent, data[1]); agent.lastActionName = intent.name; agent.currentIntent = null; return;
  }
  const result = executeAction(simulation, agent, intent); agent.lastActionResult = result; agent.lastAttemptedAction = intent.name; agent.lastActionName = result.success ? intent.name : null;
  agent.actionFailures ??= {};
  if (result.success) agent.actionFailures[intent.name] = 0;
  else agent.actionFailures[intent.name] = (agent.actionFailures[intent.name] ?? 0) + 1;
  if (!result.success && intent.name === "drink") agent.currentActivity = "idle";
  if (result.success) { improveSkillFromAction(agent, intent.name, simulation.day); const description = describeAction(agent, intent.name, result); const event = recordEvent(simulation, { type: "action", description, participants: [agent.id] }); remember(agent, { id: event.id, day: simulation.day, type: "experience", description, importance: intent.name === "rest" ? 0.2 : 0.5, emotionalWeight: 0 }); updateActionBelief(agent, intent.name, 1, simulation.day, description); if (intent.name === "catch_fish" && result.amount > 0) discoverAction(agent, { actionName: "eat_fish", belief: "Creo que el pez que capturé puede servirme como alimento.", confidence: 0.12, evidence: "Capturé un pez y ahora tengo uno en mi inventario.", outcome: 0.1, reliability: 0.35, day: simulation.day }); }
  else { const description = `${agent.name} intentó ${intent.name}, pero no pudo hacerlo (${result.reason ?? "sin resultado"}).`; const event = recordEvent(simulation, { type: "failed_action", description, participants: [agent.id] }); remember(agent, { id: event.id, day: simulation.day, type: "experience", description, importance: 0.45, emotionalWeight: -0.15 }); const environmentalFailure = new Set(["no_water", "no_plants", "no_fish", "no_wood", "no_stone"]).has(result.reason); if (!environmentalFailure) updateActionBelief(agent, intent.name, -1, simulation.day, description); }
  agent.currentIntent = null;
  if (["drinking", "eating", "fishing", "gathering", "resting"].includes(agent.currentActivity)) agent.currentActivity = "idle";
}

// ... resto del archivo sin cambios ...
