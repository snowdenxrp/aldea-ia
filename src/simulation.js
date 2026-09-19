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
  if (agent.needs.hunger > 10) return null;
  const knownActions = getKnownActions(agent);
  const fishInventory = agent.inventory?.some(item => item.type === "fish" && item.amount > 0);
  if (fishInventory && knownActions.some(action => action.name === "eat_fish")) {
    return { name: "eat_fish", amount: 1, baseValue: 999, effects: { hunger: 14 }, target: null };
  }
  const plants = perception.nearbyResources.find(resource => resource.type === "wild_plants");
  if (plants && simulation.world.resources.wild_plants.amount > 0 && knownActions.some(action => action.name === "eat_plant")) {
    return { name: "eat_plant", amount: 1, baseValue: 999, effects: { hunger: 2.2 }, distance: plants.distance, target: { ...simulation.world.resources.wild_plants.position } };
  }
  const fish = perception.nearbyResources.find(resource => resource.type === "fish");
  if (fish && simulation.world.resources.fish.amount > 0 && knownActions.some(action => action.name === "catch_fish")) {
    return { name: "catch_fish", amount: 1, baseValue: 999, effects: { hunger: 1.6 }, distance: fish.distance, target: { ...simulation.world.resources.fish.position } };
  }
  return null;
}

function performDecision(simulation, agent) {
  const intent = agent.currentIntent;
  if (!intent) return;
  const target = getActionTarget(agent, intent.name, agent.lastPerception, simulation.world, simulation.agents);
  if (agent.movement?.moving) {
    const movementTarget = agent.movement.target ?? target;
    const distanceToTarget = movementTarget
      ? Math.hypot(agent.position.x - movementTarget.x, agent.position.z - movementTarget.z)
      : Infinity;
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
  const result = executeAction(simulation, agent, intent); agent.lastActionResult = result; agent.lastActionName = result.success ? intent.name : null;
  if (!result.success && intent.name === "drink") agent.currentActivity = "idle";
  if (result.success) { improveSkillFromAction(agent, intent.name, simulation.day); const description = describeAction(agent, intent.name, result); const event = recordEvent(simulation, { type: "action", description, participants: [agent.id] }); remember(agent, { id: event.id, day: simulation.day, type: "experience", description, importance: intent.name === "rest" ? 0.2 : 0.5, emotionalWeight: 0 }); updateActionBelief(agent, intent.name, 1, simulation.day, description); if (intent.name === "catch_fish" && result.amount > 0) discoverAction(agent, { actionName: "eat_fish", belief: "Creo que el pez que capturé puede servirme como alimento.", confidence: 0.12, evidence: "Capturé un pez y ahora tengo uno en mi inventario.", outcome: 0.1, reliability: 0.35, day: simulation.day }); }
  else { const description = `${agent.name} intentó ${intent.name}, pero no pudo hacerlo (${result.reason ?? "sin resultado"}).`; const event = recordEvent(simulation, { type: "failed_action", description, participants: [agent.id] }); remember(agent, { id: event.id, day: simulation.day, type: "experience", description, importance: 0.45, emotionalWeight: -0.15 }); const environmentalFailure = new Set(["no_water", "no_plants", "no_fish", "no_wood", "no_stone"]).has(result.reason); if (!environmentalFailure) updateActionBelief(agent, intent.name, -1, simulation.day, description); }
  agent.currentIntent = null;
  if (["drinking", "eating", "fishing", "gathering", "resting"].includes(agent.currentActivity)) {
    agent.currentActivity = "idle";
  }
}

function performSocialInteraction(simulation, agent) {
  const visible = agent.lastPerception.visibleAgents.filter(other => other.distance <= 1.8).sort((a, b) => a.distance - b.distance);
  if (!visible.length) { agent.lastActionResult = { success: false, reason: "no_person_nearby" }; return; }
  const other = simulation.agents.find(candidate => candidate.id === visible[0].id && candidate.alive); if (!other) return;
  const firstMeeting = !agent.relationships.some(rel => rel.agentId === other.id); const roll = getRandom(simulation)();
  const interaction = roll < 0.55 ? { type: "conversation", description: `${agent.name} y ${other.name} tuvieron una interacción cordial.`, trust: 0.08, cooperation: 0.05, affection: 0.03, tension: 0, resentment: 0 } : roll < 0.85 ? { type: "conversation", description: `${agent.name} y ${other.name} se encontraron, pero la interacción fue neutral.`, trust: 0.01, cooperation: 0, affection: 0, tension: 0.01, resentment: 0 } : { type: "conversation", description: `${agent.name} y ${other.name} tuvieron un encuentro incómodo.`, trust: -0.05, cooperation: -0.02, affection: -0.01, tension: 0.08, resentment: 0.04 };
  recordInteraction(agent, other, { ...interaction, day: simulation.day }); recordInteraction(other, agent, { ...interaction, day: simulation.day }); agent.needs.social = Math.min(100, agent.needs.social + 18); other.needs.social = Math.min(100, other.needs.social + 18);
  const event = recordEvent(simulation, { type: firstMeeting ? "first_meeting" : "social_interaction", description: firstMeeting ? `${agent.name} conoció por primera vez a ${other.name}. ${interaction.description}` : interaction.description, participants: [agent.id, other.id] });
  remember(agent, { id: event.id, day: simulation.day, type: firstMeeting ? "first_meeting" : "social", description: event.description, participants: [agent.id, other.id], emotionalWeight: interaction.affection - interaction.resentment, importance: firstMeeting ? 0.9 : 0.4 }); remember(other, { id: event.id, day: simulation.day, type: firstMeeting ? "first_meeting" : "social", description: event.description, participants: [agent.id, other.id], emotionalWeight: interaction.affection - interaction.resentment, importance: firstMeeting ? 0.9 : 0.4 }); agent.lastActionResult = { success: true, effect: firstMeeting ? "first_meeting" : "social_interaction", otherAgentId: other.id };
}

function performKnowledgeSharing(simulation, agent) {
  const visible = agent.lastPerception.visibleAgents.filter(other => other.distance <= 1.8).sort((a, b) => a.distance - b.distance); if (!visible.length) { agent.lastActionResult = { success: false, reason: "no_person_nearby" }; return; }
  const other = simulation.agents.find(candidate => candidate.id === visible[0].id && candidate.alive); if (!other) return;
  const candidates = agent.knowledge.filter(item => item.confidence >= 0.3); if (!candidates.length) { agent.lastActionResult = { success: false, reason: "nothing_to_share" }; return; }
  const relationship = agent.relationships.find(rel => rel.agentId === other.id); const trust = relationship?.trust ?? 0; const cooperation = relationship?.cooperation ?? 0; const shareProbability = Math.max(0.15, Math.min(0.9, 0.35 + trust * 0.25 + cooperation * 0.2));
  if (getRandom(simulation)() > shareProbability) { const description = `${agent.name} habló con ${other.name}, pero decidió no compartir información importante.`; const event = recordEvent(simulation, { type: "withheld_knowledge", description, participants: [agent.id, other.id] }); remember(agent, { id: event.id, day: simulation.day, type: "social", description, participants: [agent.id, other.id], emotionalWeight: 0, importance: 0.35 }); agent.lastActionResult = { success: true, effect: "knowledge_withheld" }; return; }
  const knowledge = candidates[Math.floor(getRandom(simulation)() * candidates.length)]; const communicationFidelity = Math.max(0.55, Math.min(0.95, 0.75 + trust * 0.15)); const event = recordEvent(simulation, { type: "knowledge_shared", description: `${agent.name} compartió con ${other.name} lo que cree saber sobre "${knowledge.topic}".`, participants: [agent.id, other.id] }); learnFromEvidence(other, { topic: knowledge.topic, belief: knowledge.belief, description: `${agent.name} me contó que: ${knowledge.belief}`, outcome: trust >= 0 ? 0.4 : -0.1, reliability: communicationFidelity, day: simulation.day }); agent.needs.social = Math.min(100, agent.needs.social + 8); agent.lastActionResult = { success: true, effect: "knowledge_shared", otherAgentId: other.id };
}

function recordExploration(simulation, agent, subject) { const description = `${agent.name} exploró y aprendió algo sobre ${subject}.`; const event = recordEvent(simulation, { type: "exploration", description, participants: [agent.id] }); remember(agent, { id: event.id, day: simulation.day, type: "discovery", description, importance: 0.6, emotionalWeight: 0.04 }); }
function improveSkillFromAction(agent, actionName, day) { const existing = agent.skills.find(skill => skill.name === actionName); if (existing) existing.level = Math.min(1, existing.level + 0.03); else agent.skills.push({ name: actionName, level: 0.03, learnedOnDay: day }); }
function describeAction(agent, actionName, result) { const labels = { rest: "descansó", drink: "bebió agua", eat_plant: "comió una planta", catch_fish: "pescó", gather_wood: "recolectó madera", gather_stone: "recolectó piedra", eat_fish: "comió pescado" }; return `${agent.name} ${labels[actionName] ?? actionName}${result.amount ? ` (${result.amount})` : ""}.`; }

export function tick(simulation, deltaHours = 0.01) {
  const hours = Math.max(0, Number(deltaHours) || 0);
  simulation.hour += hours;
  while (simulation.hour >= 24) { simulation.hour -= 24; simulation.day += 1; advanceWorldDay(simulation.world); }
  simulation.world.timeOfDay = simulation.hour;

  for (const agent of simulation.agents) {
    if (!agent) continue;
    recoverCoreAgent(agent);
    if (!agent.alive) continue;
    try {
      // La actividad es un estado momentáneo, no un recuerdo. Si no existe una intención
      // activa, "drinking/eating/etc." no puede sobrevivir de un tick anterior.
      if (!agent.currentIntent && ["drinking", "eating", "fishing", "gathering", "resting"].includes(agent.currentActivity)) {
        agent.currentActivity = "idle";
      }
      agent.needs = updateNeeds(agent.needs, hours, agent.currentActivity);
      agent.needs = applyNeedConsequences(agent.needs, hours);
      if (agent.needs.health <= 0) { handleDeath(simulation, agent); continue; }
      const perception = perceiveWorld(agent, simulation.world, simulation.agents);
      agent.lastPerception = perception;
      if (agent.currentIntent?.target) {
        const target = agent.currentIntent.target;
        const distance = Math.hypot(agent.position.x - target.x, agent.position.z - target.z);
        if (distance <= 1.5) agent.currentIntent = { ...agent.currentIntent, target: null };
      }
      // Emergencia de supervivencia: con sed crítica, beber no puede ser reemplazado
      // por otra decisión mientras haya agua perceptible. La intención se conserva hasta completar.
      const water = perception.nearbyResources.find(resource => resource.type === "water");
      if (water && simulation.world.resources.water.amount > 0 && agent.needs.thirst <= 10) {
        agent.currentIntent = {
          name: "drink",
          amount: 5,
          baseValue: 0.5,
          effects: { thirst: 1.8 },
          distance: water.distance,
          target: { ...simulation.world.resources.water.position }
        };
        agent.currentActivity = water.distance > 1.5 ? "moving" : "idle";
        agent.decisionSnapshot = {
          chosen: { name: "drink", score: 999 },
          considered: [{ name: "drink", score: 999 }]
        };
      } else {
        const criticalFood = buildCriticalHungerIntent(simulation, agent, perception);
        if (criticalFood) {
          agent.currentIntent = criticalFood;
          agent.currentActivity = criticalFood.target ? (Math.hypot(agent.position.x - criticalFood.target.x, agent.position.z - criticalFood.target.z) > 1.5 ? "moving" : "idle") : "idle";
          agent.decisionSnapshot = { chosen: { name: criticalFood.name, score: 999 }, considered: [{ name: criticalFood.name, score: 999 }] };
        }
      }
      if (!agent.currentIntent || !agent.currentIntent.target) {
        const options = generateOptions(agent, perception, simulation.world, getRandom(simulation));
        const context = createDecisionContext(agent, perception);
        const evaluatedOptions = evaluateOptions(context, options);
        agent.availableOptions = options;
        agent.decisionSnapshot = { chosen: null, considered: evaluatedOptions.slice().sort((x, y) => y.score - x.score).slice(0, 3).map(option => ({ name: option.name, score: option.score })) };
        agent.currentIntent = chooseOption(context, options, 0.12, getRandom(simulation));
        if (agent.currentIntent) agent.decisionSnapshot.chosen = { name: agent.currentIntent.name, score: agent.currentIntent.score };
      }
      performDecision(simulation, agent);
    } catch (error) {
      agent.currentActivity = "idle";
      agent.currentIntent = null;
      agent.lastActionResult = { success: false, reason: "simulation_error" };
      console.error("Lúmina: error procesando a " + (agent.name ?? agent.id ?? "habitante"), error);
    }
  }
}

export function recoverCoreAgent(agent) {
  agent.currentActivity = agent.alive === false ? "dead" : (agent.currentActivity ?? "idle");
  agent.currentIntent = agent.currentIntent ?? null;
  agent.needs ??= { hunger: 80, thirst: 80, energy: 80, social: 80, safety: 100, health: 100 };
  if (!Number.isFinite(Number(agent.needs.health))) agent.needs.health = 100;
  for (const key of ["hunger", "thirst", "energy", "social", "safety"]) {
    if (!Number.isFinite(Number(agent.needs[key]))) agent.needs[key] = 80;
    agent.needs[key] = Math.max(0, Math.min(100, Number(agent.needs[key])));
  }
  agent.needs.health = Math.max(0, Math.min(100, Number(agent.needs.health)));
}

function handleDeath(simulation, agent) {
  if (agent.alive === false) return;
  agent.alive = false;
  agent.currentActivity = "dead";
  agent.currentIntent = null;
  recordEvent(simulation, { type: "death", description: `${agent.name} murió.`, participants: [agent.id] });
}
