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
import { getInventoryAmount, canBuildShelter, normalizeDevelopmentWorld } from "./development.js";
import { canCraftTool, canFarm } from "./production.js";
import { inventoryAmount, DEFAULT_PRICES, getDynamicPrice } from "./economy.js";
import { normalizeSocietyWorld, normalizeAgentLife, advanceSocietyDay } from "./society.js";
import { normalizeEcosystemWorld } from "./ecosystem.js";
import { normalizeTechnologyWorld } from "./technology.js";
import { normalizeGovernanceWorld } from "./governance.js";
import { discoverArea, rememberAreaVisit } from "./exploration.js";
import { maintainPlan, notePlanResult, autonomySummary } from "./planning.js";
import { canCooperate, contributeToProject, findOrCreateProject, getNearbyCooperationTarget, normalizeCollectiveWorld } from "./collective.js";
import { getInstitutionOptions, normalizeInstitutionWorld } from "./institutions.js";
import { normalizeSpatialWorld, getActiveRegionKeys, getRegionKey } from "./spatial.js";
import { getTerritorialContext } from "./territorial.js";

export function createSimulation(world, agents, options = {}) {
  normalizeDevelopmentWorld(world);
  normalizeSocietyWorld(world);
  normalizeEcosystemWorld(world);
  normalizeTechnologyWorld(world);
  normalizeGovernanceWorld(world);
  normalizeCollectiveWorld(world);
  normalizeInstitutionWorld(world);
  normalizeSpatialWorld(world);
  for (const agent of agents) normalizeAgentLife(agent);
  return { world, agents, hour: Number(world.timeOfDay) || 8, day: Number(world.day) || 1, events: [], running: false, random: options.random ?? null };
}
export function recordEvent(simulation, event) { const stored = { id: event.id ?? `event-${simulation.events.length + 1}`, day: simulation.day, hour: simulation.hour, type: event.type, description: event.description, participants: event.participants ?? [] }; simulation.events.push(stored); return stored; }

function generateOptions(agent, perception, world, random = Math.random, agents = []) {
  const knownActions = getKnownActions(agent); const options = [];
  options.push({ name: "rest", baseValue: 0, effects: { energy: 1.2 }, distance: 0 });
  const water = perception.nearbyResources.find(resource => resource.type === "water");
  if (water) options.push({ name: "drink", amount: 5, baseValue: 0.5, effects: { thirst: 1.8 }, distance: water.distance });
  if (perception.visibleAgents.length > 0) { const nearest = [...perception.visibleAgents].sort((a, b) => a.distance - b.distance)[0]; options.push({ name: "socialize", baseValue: 0.25, effects: { social: 1.4 }, distance: nearest.distance, relationshipBonus: relationships => { const relationship = relationships.find(item => item.agentId === nearest.id); if (!relationship) return 0.15; return Math.max(-0.2, relationship.affection * 0.25 + relationship.trust * 0.15 - relationship.tension * 0.2); }}); if (agent.knowledge.some(item => item.confidence >= 0.3)) options.push({ name: "share_knowledge", baseValue: 0.05, effects: { social: 0.6 }, distance: nearest.distance, knowledgeBonus: knowledge => Math.min(0.35, knowledge.filter(item => item.confidence >= 0.3).length * 0.08) }); const partner = agents.find(candidate => candidate.id === nearest.id && candidate.alive); if (partner && canCooperate(agent, partner)) { const activeProject = world.collectiveProjects?.some(project => project.status === "active" && project.participants.includes(agent.id) && project.participants.includes(partner.id)); const combinedWood = getInventoryAmount(agent, "wood") + getInventoryAmount(partner, "wood"); const combinedStone = getInventoryAmount(agent, "stone") + getInventoryAmount(partner, "stone"); if (activeProject || (!agent.home && !partner.home && combinedWood > 0 && combinedStone > 0)) options.push({ name: "cooperate", partnerId: partner.id, baseValue: 0.18, effects: { social: 0.8, safety: 0.8 }, distance: nearest.distance, relationshipBonus: relationships => { const relationship = relationships.find(item => item.agentId === partner.id); return relationship ? Math.max(-0.5, relationship.cooperation * 0.8 + relationship.trust * 0.4 - relationship.tension * 0.5) : -0.2; } }); } }
  if (knownActions.some(action => action.name === "build_shelter") && !agent.home && canBuildShelter(agent)) options.push({ name: "build_shelter", baseValue: 0.7, effects: { safety: 1.8 }, distance: 0 });
  if (knownActions.some(action => action.name === "craft_tool") && canCraftTool(agent)) options.push({ name: "craft_tool", baseValue: 0.55, effects: { energy: -0.1 }, distance: 0 });
  if (knownActions.some(action => action.name === "farm") && canFarm(agent) && !agent.farm) options.push({ name: "farm", baseValue: 0.65, effects: { safety: 0.5 }, distance: 0 });
  if (knownActions.some(action => action.name === "harvest") && simulationFarmReady(world, agent)) options.push({ name: "harvest", baseValue: 0.35, effects: { hunger: 1 }, distance: 0 });
  if (knownActions.some(action => action.name === "eat_farm_food") && agent.inventory?.some(i => i.type === "farm_food" && i.amount > 0)) options.push({ name: "eat_farm_food", baseValue: 0.8, effects: { hunger: 2.4 }, distance: 0 });
  if (knownActions.some(action => action.name === "trade")) options.push(...generateTradeOptions(agent, perception, world, agents));
  options.push(...getInstitutionOptions(agent, world));
  for (const action of knownActions) { if (["rest", "drink"].includes(action.name)) continue; if (action.name === "eat_fish" && !agent.inventory.some(item => item.type === "fish" && item.amount > 0)) continue; const resourceByAction = { eat_plant: "wild_plants", catch_fish: "fish", gather_wood: "wood", gather_stone: "stone" }; const requiredResource = resourceByAction[action.name]; if (requiredResource && Number(world.resources?.[requiredResource]?.amount ?? 0) <= 0) continue; const option = { name: action.name, baseValue: action.confidence, distance: getKnownActionDistance(action.name, perception), knowledgeBonus: knowledge => { const item = knowledge.find(entry => entry.topic === "action:" + action.name); return item ? item.confidence * 0.15 : 0; }, memoryBonus: memories => { const relevant = memories.filter(memory => memory.topic === "action:" + action.name); if (!relevant.length) return 0; const recent = relevant.slice(-5); const valence = recent.reduce((sum, memory) => sum + (memory.importance ?? 0.5) * (memory.emotionalWeight ?? 0), 0); return Math.max(-0.25, Math.min(0.25, valence * 0.5)); } }; if (action.name === "eat_plant") { option.effects = { hunger: 2.2 }; option.amount = 1; } if (action.name === "eat_fish") { option.effects = { hunger: 2.3 }; option.amount = 1; } if (action.name === "catch_fish") { option.effects = { hunger: 1.6 }; option.amount = 1; } options.push(option); }
  const resourceDiscovery = [["wild_plants", "explore_plants", "eat_plant", "planta", 0.9, 0.8], ["fish", "explore_fishing", "catch_fish", "pesca", 0.85, 0.75], ["wood", "explore_wood", "gather_wood", "madera", 0.75, 0.65], ["stone", "explore_stone", "gather_stone", "piedra", 0.75, 0.65], ["fertile_land", "explore_farming", "farm", "tierra fértil", 0.7, 0.7]];
  for (const [resourceType, optionName, actionName, keyword, explorationValue, baseValue] of resourceDiscovery) { const resource = perception.nearbyResources.find(item => item.type === resourceType); if (!resource || knownActions.some(action => action.name === actionName)) continue; const option = { name: optionName, baseValue, explorationValue, novelty: 1, knowledgeTopic: "action:" + actionName, memoryKeyword: keyword, distance: resource.distance }; if (resourceType === "wild_plants") option.effects = { hunger: 0.8 }; if (resourceType === "fish") option.effects = { hunger: 0.65 }; options.push(option); }
  if (getInventoryAmount(agent, "wood") >= 5 && getInventoryAmount(agent, "stone") >= 3 && !knownActions.some(a => a.name === "craft_tool")) options.push({ name: "discover_toolmaking", baseValue: 0.45, explorationValue: 0.5, novelty: 1, knowledgeTopic: "action:craft_tool", distance: 0 });
  if (getInventoryAmount(agent, "wood") >= 4 && !knownActions.some(a => a.name === "farm")) options.push({ name: "discover_farming", baseValue: 0.4, explorationValue: 0.5, novelty: 1, knowledgeTopic: "action:farm", distance: 0 });
  if (!knownActions.some(action => action.name === "trade")) {
    const nearbyPotentialTrader = perception.visibleAgents.find(other => other.distance <= 2.0);
    if (nearbyPotentialTrader && (inventoryAmount(agent, "fish") > 0 || inventoryAmount(agent, "farm_food") > 0 || inventoryAmount(agent, "wood") > 1 || inventoryAmount(agent, "stone") > 1)) {
      options.push({ name: "discover_trade", baseValue: 0.22, explorationValue: 0.5, novelty: 1, knowledgeTopic: "action:trade", distance: nearbyPotentialTrader.distance });
    }
  }
  const explorationTarget=createExplorationTarget(agent,world,random);
  const explorationDistance=Math.hypot(explorationTarget.x-agent.position.x,explorationTarget.z-agent.position.z);
  const currentRegion=world.spatial?.regions?.[getRegionKeyForAgent(agent,world)];
  const explorationNovelty=Math.max(.35,1-Math.min(1,Number(currentRegion?.visits??0)/5));
  options.push({name:"explore_area",baseValue:.38,explorationValue:.9,novelty:explorationNovelty,distance:explorationDistance,target:explorationTarget}); const plannedStep = agent.plan?.steps?.[0]; if (plannedStep) { const planned = options.find(option => option.name === plannedStep); if (planned) planned.baseValue = (planned.baseValue ?? 0) + 2.5 + Math.min(2, Number(agent.plan.priority ?? 0) * 0.03); } return options;
}
function absoluteHour(simulation){return Number(simulation.day)*24+Number(simulation.hour);}
function applyRoutinePressure(simulation,agent){
  agent.explorationState??={lastDay:-Infinity,regionsVisited:0,nextExploreAt:null,excursions:0};
  if(agent.explorationState.nextExploreAt==null) agent.explorationState.nextExploreAt=absoluteHour(simulation);
  const healthy=agent.needs.hunger>45&&agent.needs.thirst>45&&agent.needs.energy>35&&agent.needs.safety>35&&agent.needs.health>50;
  if(!healthy||agent.currentIntent||absoluteHour(simulation)<Number(agent.explorationState.nextExploreAt)) return false;
  const target=createExplorationTarget(agent,simulation.world,getRandom(simulation));
  agent.currentIntent={name:"explore_area",baseValue:1.5,explorationValue:1.4,novelty:1,target};
  agent.currentActivity="moving";
  agent.explorationState.target={...target};
  agent.explorationState.excursions=Number(agent.explorationState.excursions??0)+1;
  agent.decisionSnapshot={chosen:{name:"explore_area",score:1.5},considered:[{name:"explore_area",score:1.5}]};
  return true;
}
function getRegionKeyForAgent(agent,world){return getRegionKey(agent.position,world);}
function generateTradeOptions(agent, perception, world, agents = []) {
  const visible = perception.visibleAgents.filter(other => other.distance <= 2.0);
  const options = [];
  for (const other of visible) {
    const partner = agents.find(candidate => candidate.id === other.id && candidate.alive) ?? null;
    if (!partner) continue;
    const priceMemory = world.economy?.priceMemory ?? {};
    for (const type of ["farm_food", "fish", "wood", "stone", "tool"]) {
      const partnerAmount = inventoryAmount(partner, type);
      const myAmount = inventoryAmount(agent, type);
      const unitPrice = getDynamicPrice(world, type);
      if (partnerAmount > 0 && Number(agent.money ?? 0) >= unitPrice) {
        const survivalNeed = type === "farm_food" || type === "fish" ? Math.max(0, 55 - agent.needs.hunger) : 0;
        options.push({
          name: "trade",
          partnerId: partner.id,
          offerType: type,
          amount: 1,          unitPrice,
          baseValue: 0.1 + survivalNeed * 0.025,
          effects: { hunger: survivalNeed > 0 ? 1.5 : 0.05 },
          distance: other.distance,
          tradeValue: () => survivalNeed * 0.04
        });
      }
      if (myAmount > 1 && partnerAmount <= 0 && Number(partner.money ?? 0) >= unitPrice) {
        options.push({
          name: "trade",
          partnerId: partner.id,
          offerType: type,
          amount: 1,
          unitPrice,
          baseValue: 0.08,
          effects: { social: 0.15 },
          distance: other.distance,
          tradeValue: () => 0.15
        });
      }
    }
  }
  return options;
}
function simulationFarmReady(world, agent) { return (world.structures?.farms ?? []).some(f => f.ownerId === agent.id && Number(f.food) > 0); }
function getKnownActionDistance(actionName, perception) { if (actionName === "eat_fish") return 0; const map = { drink: "water", eat_plant: "wild_plants", catch_fish: "fish", gather_wood: "wood", gather_stone: "stone" }; const type = map[actionName]; if (!type) return 0; return perception.nearbyResources.find(resource => resource.type === type)?.distance ?? 25; }
function createExplorationTarget(agent, world, random = Math.random) {
  const bounds=world?.bounds??{minX:-64,maxX:64,minZ:-64,maxZ:64};
  const known=new Set(world?.spatial?.knownRegions??[]);
  const size=Number(world?.spatial?.regionSize??8);
  const minX=Number(bounds.minX),minZ=Number(bounds.minZ);
  const candidates=[];
  for(let x=minX+size/2;x<=Number(bounds.maxX)-size/2;x+=size) for(let z=minZ+size/2;z<=Number(bounds.maxZ)-size/2;z+=size){
    const rx=Math.floor((x-minX)/size),rz=Math.floor((z-minZ)/size),key=rx+":"+rz;
    const d=Math.hypot(x-agent.position.x,z-agent.position.z);
    if(d>=14&&!known.has(key)) candidates.push({x,z,d,score:d*(.8+random()*.4)});
  }
  candidates.sort((a,b)=>b.score-a.score);
  const pick=candidates[0];
  if(pick)return {x:Math.max(minX,Math.min(Number(bounds.maxX),pick.x)),z:Math.max(minZ,Math.min(Number(bounds.maxZ),pick.z))};
  const angle=random()*Math.PI*2,distance=18+random()*24;
  return {x:Math.max(minX,Math.min(Number(bounds.maxX),agent.position.x+Math.cos(angle)*distance)),z:Math.max(minZ,Math.min(Number(bounds.maxZ),agent.position.z+Math.sin(angle)*distance))};
}
function getActionTarget(agent, actionName, perception, world, agents) { if (actionName === "build_shelter" || actionName === "trade" || actionName === "discover_trade") return null; if (actionName === "explore_area") return agent.currentIntent?.target ?? null; if (actionName === "drink") return world.resources.water.position; if (actionName === "gather_wood" || actionName === "explore_wood") return world.resources.wood.position; if (actionName === "gather_stone" || actionName === "explore_stone") return world.resources.stone.position; if (actionName === "eat_plant" || actionName === "explore_plants") return world.resources.wild_plants.position; if (actionName === "catch_fish" || actionName === "explore_fishing") return world.resources.fish.position; if (actionName === "socialize" || actionName === "share_knowledge" || actionName === "cooperate") { const nearest = [...perception.visibleAgents].sort((a, b) => a.distance - b.distance)[0]; const other = agents.find(candidate => candidate.id === nearest?.id && candidate.alive && candidate.id !== agent.id); return other?.position ?? null; } return null; }
function buildCriticalHungerIntent(simulation, agent, perception) { if (agent.needs.hunger > 70) return null; const knownActions = getKnownActions(agent); if (agent.needs.thirst <= 25) return null; const fishInventory = agent.inventory?.some(item => item.type === "fish" && item.amount > 0); if (fishInventory && knownActions.some(action => action.name === "eat_fish")) return { name: "eat_fish", amount: Math.max(1, Math.min(3, Math.ceil((20 - agent.needs.hunger) / 14))), baseValue: 999, effects: { hunger: 14 }, target: null }; const rememberedPlants = agent.knownResources?.wild_plants; const plants = perception.nearbyResources.find(resource => resource.type === "wild_plants") ?? (rememberedPlants ? { type: "wild_plants", distance: Math.hypot(agent.position.x - rememberedPlants.x, agent.position.z - rememberedPlants.z) } : null); if (plants && simulation.world.resources.wild_plants.amount > 0) { if (knownActions.some(action => action.name === "eat_plant")) return { name: "eat_plant", amount: Math.max(1, Math.min(4, Math.ceil((20 - agent.needs.hunger) / 8.67))), baseValue: 999, effects: { hunger: 8.67 }, distance: plants.distance, target: { ...simulation.world.resources.wild_plants.position } }; return { name: "explore_plants", baseValue: 999, explorationValue: 1, novelty: 1, distance: plants.distance, target: { ...simulation.world.resources.wild_plants.position } }; } const fish = perception.nearbyResources.find(resource => resource.type === "fish"); const fishFailures = Number(agent.actionFailures?.catch_fish ?? 0); if (fish && simulation.world.resources.fish.amount > 0 && knownActions.some(action => action.name === "catch_fish") && fishFailures < 3 && agent.needs.energy > 0) return { name: "catch_fish", amount: 1, baseValue: 999, effects: { hunger: 1.6 }, distance: fish.distance, target: { ...fish.position } }; if (fishFailures >= 3 || agent.needs.energy <= 10) { const anchor = agent.knownResources?.water ?? agent.knownResources?.fish; if (anchor) { const angle = getRandom(simulation)() * Math.PI * 2; const distance = 8 + getRandom(simulation)() * 10; const bounds = simulation.world.bounds ?? { minX: -34, maxX: 34, minZ: -34, maxZ: 34 }; const target = { x: Math.max(bounds.minX, Math.min(bounds.maxX, anchor.x + Math.cos(angle) * distance)), z: Math.max(bounds.minZ, Math.min(bounds.maxZ, anchor.z + Math.sin(angle) * distance)) }; return { name: "explore_area", baseValue: 999, explorationValue: 1, novelty: 1, target }; } const target = createExplorationTarget(agent, simulation.world, getRandom(simulation)); return { name: "explore_area", baseValue: 999, explorationValue: 1, target }; } return null; }
const ACTIVITY_ROUTINES = {
  explore_area: [{name:"approach",hours:.05},{name:"inspect",hours:.18},{name:"discover",hours:.12}],
  gather_wood: [{name:"approach",hours:.05},{name:"inspect",hours:.08},{name:"collect",hours:.2}],
  gather_stone: [{name:"approach",hours:.05},{name:"inspect",hours:.08},{name:"collect",hours:.2}],
  catch_fish: [{name:"approach",hours:.05},{name:"cast",hours:.12},{name:"wait",hours:.18}],
  build_shelter: [{name:"prepare",hours:.12},{name:"construct",hours:.28}],
  craft_tool: [{name:"prepare",hours:.1},{name:"craft",hours:.24}],
  farm: [{name:"prepare",hours:.12},{name:"plant",hours:.24}],
  harvest: [{name:"inspect",hours:.08},{name:"harvest",hours:.2}],
  socialize: [{name:"approach",hours:.05},{name:"talk",hours:.3}],
  share_knowledge: [{name:"approach",hours:.05},{name:"teach",hours:.32}],
  cooperate: [{name:"approach",hours:.05},{name:"work",hours:.35}],
  trade: [{name:"approach",hours:.05},{name:"exchange",hours:.25}]
};
function beginActivityRoutine(agent,intent){
  const phases=ACTIVITY_ROUTINES[intent.name];
  if(!phases||agent.activitySequence?.intentName===intent.name)return;
  agent.activitySequence={intentName:intent.name,phaseIndex:0,phase:phases[0].name,remainingHours:Number(phases[0].hours)||0,completedPhases:[]}; agent.activityPhase=phases[0].name;
}
function activityNameForIntent(name){ return {explore_area:"moving",gather_wood:"gathering",gather_stone:"gathering",catch_fish:"fishing",build_shelter:"building",craft_tool:"crafting",farm:"farming",harvest:"harvesting",socialize:"socializing",share_knowledge:"teaching",cooperate:"cooperating",trade:"trading"}[name] ?? "working"; }
function advanceActivityRoutine(agent,hours){
  const sequence=agent.activitySequence;
  if(!sequence)return false;
  const phases=ACTIVITY_ROUTINES[sequence.intentName];
  if(!phases){agent.activitySequence=null;agent.activityPhase=null;return false;}
  let remaining=Math.max(0,Number(hours)||0);
  while(remaining>0){
    const phaseRemaining=Math.max(0,Number(sequence.remainingHours??0));
    if(remaining<phaseRemaining){
      sequence.remainingHours=phaseRemaining-remaining;
      remaining=0;
      break;
    }
    remaining-=phaseRemaining;
    sequence.completedPhases.push(sequence.phase);
    if(sequence.phaseIndex>=phases.length-1){
      sequence.remainingHours=0;
      sequence.activityComplete=true;
      break;
    }
    sequence.phaseIndex+=1;
    sequence.phase=phases[sequence.phaseIndex].name;
    sequence.remainingHours=Number(phases[sequence.phaseIndex].hours)||0;
  }
  agent.activityPhase=sequence.phase;
  return !(sequence.activityComplete===true);
}
const DECISION_COOLDOWN_HOURS = 0.25; const FAILED_DECISION_COOLDOWN_HOURS = 0.05;
const NON_LEARNING_FAILURES = new Set(["no_water","no_plants","no_fish","no_wood","no_stone","no_fish_in_inventory","no_farm_food","no_ready_crop","no_person_nearby","nothing_to_share","cooperation_not_available","no_shared_project","invalid_partner","seller_lacks_goods","buyer_lacks_money","insufficient_materials","no_fertile_land","no_institution_membership","invalid_commons_resource","insufficient_contribution","commons_empty"]);
function shouldPenalizeActionBelief(result){return !NON_LEARNING_FAILURES.has(result?.reason);}
function startDecisionCooldown(agent) { agent.decisionCooldownHours = DECISION_COOLDOWN_HOURS; }
function tickDecisionCooldown(agent, hours) { agent.decisionCooldownHours = Math.max(0, Number(agent.decisionCooldownHours ?? 0) - hours); }

function performDecision(simulation, agent, hours = 0) { const intent = agent.currentIntent; if (!intent) return; beginActivityRoutine(agent,intent); const target = getActionTarget(agent, intent.name, agent.lastPerception, simulation.world, simulation.agents); if (agent.movement?.moving) { const movementTarget = agent.movement.target ?? target; const distanceToTarget = movementTarget ? Math.hypot(agent.position.x - movementTarget.x, agent.position.z - movementTarget.z) : Infinity; if (distanceToTarget > 1.5) return; stopMovement(agent); } if (target) { const distance = Math.hypot(agent.position.x - target.x, agent.position.z - target.z); if (distance > 1.5) { agent.currentActivity = "moving"; agent.currentIntent = { ...intent, target: { x: target.x, z: target.z } }; return; } } const routineActive=advanceActivityRoutine(agent,hours); if (routineActive) { agent.currentActivity = activityNameForIntent(intent.name); return; } if (intent.name === "socialize") { performSocialInteraction(simulation, agent); agent.currentActivity = "socializing"; agent.activityRemainingHours = .45; agent.lastActionName = "socialize"; agent.currentIntent = null; startDecisionCooldown(agent); return; } if (intent.name === "share_knowledge") { performKnowledgeSharing(simulation, agent); agent.currentActivity = "teaching"; agent.activityRemainingHours = .5; agent.lastActionName = "share_knowledge"; agent.currentIntent = null; startDecisionCooldown(agent); return; } if (intent.name === "cooperate") { performCollectiveCooperation(simulation, agent, intent.partnerId); agent.currentActivity = "cooperating"; agent.activityRemainingHours = .55; agent.lastActionName = "cooperate"; agent.currentIntent = null; startDecisionCooldown(agent); return; } if (intent.name === "explore_area") {
    const area=discoverArea(simulation,agent);
    rememberAreaVisit(simulation,agent,area);
    agent.explorationState??={lastDay:-Infinity,regionsVisited:0};
    agent.explorationState.lastDay=simulation.day;
    agent.explorationState.regionsVisited=Number(agent.explorationState.regionsVisited??0)+1;
    agent.explorationState.nextExploreAt=absoluteHour(simulation)+8+getRandom(simulation)()*8;
    agent.explorationState.target=null;
    const description=agent.name+" exploró una zona nueva de su entorno.";
    const event=recordEvent(simulation,{type:"exploration",description,participants:[agent.id]});
    remember(agent,{id:event.id,day:simulation.day,type:"exploration",description,importance:.6,emotionalWeight:.04});
    agent.lastActionName="explore_area";agent.lastActionResult={success:true,effect:"area_explored",areaId:area.id,regionKey:area.regionKey};
    agent.currentIntent=null;startDecisionCooldown(agent);return;
  } if (intent.name === "discover_toolmaking") { discoverAction(agent,{actionName:"craft_tool",belief:"Puedo fabricar una herramienta con madera y piedra.",confidence:.18,evidence:"Tengo materiales y probé combinarlos para mejorar mi trabajo.",outcome:.2,reliability:.5,day:simulation.day}); agent.lastActionName=intent.name; agent.lastActionResult={success:true,effect:"discovery"}; agent.currentIntent=null; startDecisionCooldown(agent); return; } if (intent.name === "discover_farming") { discoverAction(agent,{actionName:"farm",belief:"Puedo aprovechar tierra fértil para producir alimento.",confidence:.16,evidence:"Observé tierra fértil y tengo madera para preparar un cultivo.",outcome:.2,reliability:.5,day:simulation.day}); agent.lastActionName=intent.name; agent.lastActionResult={success:true,effect:"discovery"}; agent.currentIntent=null; startDecisionCooldown(agent); return; } if (intent.name === "explore_plants" || intent.name === "explore_fishing" || intent.name === "explore_wood" || intent.name === "explore_stone" || intent.name === "explore_farming") { const data = { explore_plants: ["eat_plant", "plantas"], explore_fishing: ["catch_fish", "pesca"], explore_wood: ["gather_wood", "madera"], explore_stone: ["gather_stone", "piedra"], explore_farming: ["farm", "agricultura"] }[intent.name]; discoverAction(agent, { actionName: data[0], belief: `Creo que puedo investigar ${data[1]} aquí.`, confidence: 0.15, evidence: `Observé ${data[1]} y decidí investigar.`, outcome: 0.1, reliability: 0.4, day: simulation.day }); recordExploration(simulation, agent, data[1]); agent.lastActionName = intent.name; agent.lastActionResult = { success: true, effect: "discovery" }; agent.currentIntent = null; startDecisionCooldown(agent); return; } const result = executeAction(simulation, agent, intent); agent.lastActionResult = result; agent.lastAttemptedAction = intent.name;
    if (agent.plan) notePlanResult(agent, intent.name, result, simulation.day); agent.lastActionName = result.success ? intent.name : null; if (result.success) agent.activityRemainingHours = .35; agent.actionFailures ??= {}; if (result.success) agent.actionFailures[intent.name] = 0; else agent.actionFailures[intent.name] = (agent.actionFailures[intent.name] ?? 0) + 1; if (!result.success && intent.name === "drink") agent.currentActivity = "idle"; if (result.success) { improveSkillFromAction(agent, intent.name, simulation.day); if (result.effect === "farm_created") { agent.farm=result.structureId; discoverAction(agent,{actionName:"harvest",belief:"Un cultivo maduro puede convertirse en alimento.",confidence:.2,evidence:"Preparé un cultivo y puedo recoger su producción.",outcome:.2,reliability:.55,day:simulation.day}); } if (result.effect === "farm_harvested") discoverAction(agent,{actionName:"eat_farm_food",belief:"El alimento cultivado puede quitarme el hambre.",confidence:.2,evidence:"Coseché alimento y puedo probarlo.",outcome:.2,reliability:.55,day:simulation.day}); if (!agent.home && getInventoryAmount(agent, "wood") >= 12 && getInventoryAmount(agent, "stone") >= 6) { discoverAction(agent, { actionName: "build_shelter", belief: "Con suficiente madera y piedra puedo construir un refugio.", confidence: 0.2, evidence: "He reunido materiales suficientes para intentar construir.", outcome: 0.2, reliability: 0.6, day: simulation.day }); } const description = describeAction(agent, intent.name, result); const event = recordEvent(simulation, { type: "action", description, participants: [agent.id] }); remember(agent, { id: event.id, day: simulation.day, type: "experience", topic: "action:" + intent.name, description, importance: intent.name === "rest" ? 0.2 : 0.5, emotionalWeight: intent.name === "rest" ? 0.02 : 0.1 }); updateActionBelief(agent, intent.name, 1, simulation.day, description); if (intent.name === "catch_fish" && result.amount > 0) discoverAction(agent, { actionName: "eat_fish", belief: "Creo que el pez que capturé puede servirme como alimento.", confidence: 0.12, evidence: "Capturé un pez y ahora tengo uno en mi inventario.", outcome: 0.1, reliability: 0.35, day: simulation.day }); } else { const description = `${agent.name} intentó ${intent.name}, pero no pudo hacerlo (${result.reason ?? "sin resultado"}).`; const event = recordEvent(simulation, { type: "failed_action", description, participants: [agent.id] }); remember(agent, { id: event.id, day: simulation.day, type: "experience", topic: "action:" + intent.name, description, importance: 0.45, emotionalWeight: -0.15 }); if (shouldPenalizeActionBelief(result)) updateActionBelief(agent, intent.name, -1, simulation.day, description); agent.currentIntent = null; agent.activitySequence = null; agent.activityPhase = null; if (["drinking", "eating", "fishing", "gathering", "resting"].includes(agent.currentActivity)) agent.currentActivity = "idle"; if (result.success) startDecisionCooldown(agent); else agent.decisionCooldownHours = Math.max(Number(agent.decisionCooldownHours ?? 0), FAILED_DECISION_COOLDOWN_HOURS); } }
function performSocialInteraction(simulation, agent) { const visible = agent.lastPerception.visibleAgents.filter(other => other.distance <= 1.8).sort((a, b) => a.distance - b.distance); if (!visible.length) { agent.lastActionResult = { success: false, reason: "no_person_nearby" }; return; } const other = simulation.agents.find(candidate => candidate.id === visible[0].id && candidate.alive); if (!other) return; const firstMeeting = !agent.relationships.some(rel => rel.agentId === other.id); const roll = getRandom(simulation)(); const interaction = roll < 0.55 ? { type: "conversation", description: `${agent.name} y ${other.name} tuvieron una interacción cordial.`, trust: 0.08, cooperation: 0.05, affection: 0.03, tension: 0, resentment: 0 } : roll < 0.85 ? { type: "conversation", description: `${agent.name} y ${other.name} se encontraron, pero la interacción fue neutral.`, trust: 0.01, cooperation: 0, affection: 0, tension: 0.01, resentment: 0 } : { type: "conversation", description: `${agent.name} y ${other.name} tuvieron un encuentro incómodo.`, trust: -0.05, cooperation: -0.02, affection: -0.01, tension: 0.08, resentment: 0.04 }; recordInteraction(agent, other, { ...interaction, day: simulation.day }); recordInteraction(other, agent, { ...interaction, day: simulation.day }); agent.needs.social = Math.min(100, agent.needs.social + 18); other.needs.social = Math.min(100, other.needs.social + 18); const event = recordEvent(simulation, { type: firstMeeting ? "first_meeting" : "social_interaction", description: firstMeeting ? `${agent.name} conoció por primera vez a ${other.name}. ${interaction.description}` : interaction.description, participants: [agent.id, other.id] }); remember(agent, { id: event.id, day: simulation.day, type: firstMeeting ? "first_meeting" : "social", description: event.description, participants: [agent.id, other.id], emotionalWeight: interaction.affection - interaction.resentment, importance: firstMeeting ? 0.9 : 0.4 }); remember(other, { id: event.id, day: simulation.day, type: firstMeeting ? "first_meeting" : "social", description: event.description, participants: [agent.id, other.id], emotionalWeight: interaction.affection - interaction.resentment, importance: firstMeeting ? 0.9 : 0.4 }); agent.lastActionResult = { success: true, effect: firstMeeting ? "first_meeting" : "social_interaction", otherAgentId: other.id }; }
function performKnowledgeSharing(simulation, agent) { const visible = agent.lastPerception.visibleAgents.filter(other => other.distance <= 1.8).sort((a, b) => a.distance - b.distance); if (!visible.length) { agent.lastActionResult = { success: false, reason: "no_person_nearby" }; return; } const other = simulation.agents.find(candidate => candidate.id === visible[0].id && candidate.alive); if (!other) return; const candidates = agent.knowledge.filter(item => item.confidence >= 0.3); if (!candidates.length) { agent.lastActionResult = { success: false, reason: "nothing_to_share" }; return; } const relationship = agent.relationships.find(rel => rel.agentId === other.id); const trust = relationship?.trust ?? 0; const cooperation = relationship?.cooperation ?? 0; const shareProbability = Math.max(0.15, Math.min(0.9, 0.35 + trust * 0.25 + cooperation * 0.2)); if (getRandom(simulation)() > shareProbability) { const description = `${agent.name} habló con ${other.name}, pero decidió no compartir información importante.`; const event = recordEvent(simulation, { type: "withheld_knowledge", description, participants: [agent.id, other.id] }); remember(agent, { id: event.id, day: simulation.day, type: "social", description, participants: [agent.id, other.id], emotionalWeight: 0, importance: 0.35 }); agent.lastActionResult = { success: true, effect: "knowledge_withheld" }; return; } const knowledge = candidates[Math.floor(getRandom(simulation)() * candidates.length)]; const communicationFidelity = Math.max(0.55, Math.min(0.95, 0.75 + trust * 0.15)); const event = recordEvent(simulation, { type: "knowledge_shared", description: `${agent.name} compartió con ${other.name} lo que cree saber sobre "${knowledge.topic}".`, participants: [agent.id, other.id] }); learnFromEvidence(other, { topic: knowledge.topic, belief: knowledge.belief, description: `${agent.name} me contó que: ${knowledge.belief}`, outcome: trust >= 0 ? 0.4 : -0.1, reliability: communicationFidelity, day: simulation.day }); agent.needs.social = Math.min(100, agent.needs.social + 8); agent.lastActionResult = { success: true, effect: "knowledge_shared", otherAgentId: other.id }; }
function performCollectiveCooperation(simulation, agent, partnerId) { const partner = simulation.agents.find(candidate => candidate.id === partnerId && candidate.alive) ?? getNearbyCooperationTarget(agent, simulation.agents)?.other; if (!partner || !canCooperate(agent, partner)) { agent.lastActionResult = { success: false, reason: "cooperation_not_available" }; return; } const project = findOrCreateProject(simulation, agent, partner); if (!project) { agent.lastActionResult = { success: false, reason: "no_shared_project" }; return; } const result = contributeToProject(simulation, agent, project); agent.lastActionResult = result; if (result.success) improveSkillFromAction(agent, "cooperate", simulation.day); }
function recordExploration(simulation, agent, subject) { const area = discoverArea(simulation, agent); rememberAreaVisit(simulation, agent, area); const description = `${agent.name} exploró y aprendió algo sobre ${subject}.`; const event = recordEvent(simulation, { type: "exploration", description, participants: [agent.id] }); remember(agent, { id: event.id, day: simulation.day, type: "discovery", description, importance: 0.6, emotionalWeight: 0.04 }); }
function improveSkillFromAction(agent, actionName, day) { const existing = agent.skills.find(skill => skill.name === actionName); if (existing) existing.level = Math.min(1, existing.level + 0.03); else agent.skills.push({ name: actionName, level: 0.03, learnedOnDay: day }); }
function describeAction(agent, actionName, result) { const labels = { trade: "comerció", rest: "descansó", drink: "bebió agua", eat_plant: "comió una planta", catch_fish: "pescó", gather_wood: "recolectó madera", gather_stone: "recolectó piedra", eat_fish: "comió pescado", build_shelter: "construyó un refugio", craft_tool: "fabricó una herramienta", farm: "preparó un cultivo", harvest: "cosechó alimento", eat_farm_food: "comió alimento cultivado" }; return `${agent.name} ${labels[actionName] ?? actionName}${result.amount ? ` (${result.amount})` : ""}.`; }

export function tick(simulation, deltaHours = 0.01) {
  const hours = Math.max(0, Number(deltaHours) || 0); simulation.hour += hours; while (simulation.hour >= 24) { simulation.hour -= 24; simulation.day += 1; simulation.world.day = simulation.day; simulation.world.population = simulation.agents.filter(agent => agent?.alive).length; advanceWorldDay(simulation.world);
    advanceSocietyDay(simulation); } simulation.world.timeOfDay = simulation.hour;
  for (const agent of simulation.agents) { if (!agent) continue; recoverCoreAgent(agent); if (!agent.alive) continue; try {
      maintainPlan(agent, simulation.world); if (agent.activityRemainingHours > 0) agent.activityRemainingHours = Math.max(0, agent.activityRemainingHours - hours); if (!agent.currentIntent && agent.activityRemainingHours <= 0 && ["drinking", "eating", "fishing", "gathering", "resting", "building", "crafting", "farming", "harvesting", "trading", "cooperating", "socializing", "teaching"].includes(agent.currentActivity)) agent.currentActivity = "idle"; agent.needs = updateNeeds(agent.needs, hours, agent.currentActivity); if (agent.needs.health <= 0) { handleDeath(simulation, agent); continue; } tickDecisionCooldown(agent, hours); const perception = perceiveWorld(agent, simulation.world, simulation.agents); agent.lastPerception = perception; agent.knownResources ??= {}; for (const resource of perception.nearbyResources) { const source = simulation.world.resources[resource.type]; if (source?.position) agent.knownResources[resource.type] = { ...source.position, learnedDay: simulation.day }; } if (agent.currentIntent?.target) { const target = agent.currentIntent.target; const distance = Math.hypot(agent.position.x - target.x, agent.position.z - target.z); if (distance <= 1.5) agent.currentIntent = { ...agent.currentIntent, target: null }; } const rememberedWater = agent.knownResources?.water; const water = perception.nearbyResources.find(resource => resource.type === "water") ?? (rememberedWater ? { type: "water", distance: Math.hypot(agent.position.x - rememberedWater.x, agent.position.z - rememberedWater.z) } : null); const criticalFood = buildCriticalHungerIntent(simulation, agent, perception); if (criticalFood && agent.needs.hunger <= 10 && agent.currentIntent?.name !== criticalFood.name) { agent.currentIntent = criticalFood; agent.currentActivity = criticalFood.target ? (Math.hypot(agent.position.x - criticalFood.target.x, agent.position.z - criticalFood.target.z) > 1.5 ? "moving" : "idle") : "idle"; agent.decisionSnapshot = { chosen: { name: criticalFood.name, score: 999 }, considered: [{ name: criticalFood.name, score: 999 }] }; } else if (water && simulation.world.resources.water.amount > 0 && agent.needs.thirst <= 25 && agent.currentIntent?.name !== "drink") { agent.currentIntent = { name: "drink", amount: 5, baseValue: 0.5, effects: { thirst: 1.8 }, distance: water.distance, target: { ...simulation.world.resources.water.position } }; agent.currentActivity = water.distance > 1.5 ? "moving" : "idle"; agent.decisionSnapshot = { chosen: { name: "drink", score: 999 }, considered: [{ name: "drink", score: 999 }] }; } if (!agent.currentIntent && agent.needs.energy <= 15 && agent.needs.hunger > 10 && agent.needs.thirst > 10) { agent.currentIntent = { name: "rest", baseValue: 999, effects: { energy: 7 }, target: null }; agent.decisionSnapshot = { chosen: { name: "rest", score: 999 }, considered: [{ name: "rest", score: 999 }] }; } if (!agent.currentIntent && criticalFood && agent.needs.hunger <= 70) { agent.currentIntent = criticalFood; agent.currentActivity = criticalFood.target ? (Math.hypot(agent.position.x - criticalFood.target.x, agent.position.z - criticalFood.target.z) > 1.5 ? "moving" : "idle") : "idle"; agent.decisionSnapshot = { chosen: { name: criticalFood.name, score: 999 }, considered: [{ name: criticalFood.name, score: 999 }] }; } if (!agent.currentIntent && agent.decisionCooldownHours <= 0 && applyRoutinePressure(simulation, agent)) { /* rutina autónoma: exploración programada cuando no hay urgencias */ } else if (!agent.currentIntent && agent.decisionCooldownHours <= 0) { const options = generateOptions(agent, perception, simulation.world, getRandom(simulation), simulation.agents); const context = createDecisionContext(agent, perception); context.territory = getTerritorialContext(agent, simulation.world); const evaluatedOptions = evaluateOptions(context, options); agent.availableOptions = options; agent.decisionSnapshot = { chosen: null, considered: evaluatedOptions.slice().sort((x, y) => y.score - x.score).slice(0, 3).map(option => ({ name: option.name, score: option.score })) }; agent.currentIntent = chooseOption(context, options, 0.12, getRandom(simulation)); if (agent.currentIntent) agent.decisionSnapshot.chosen = { name: agent.currentIntent.name, score: agent.currentIntent.score }; } performDecision(simulation, agent, hours); agent.autonomySnapshot = autonomySummary(agent); agent.needs = applyNeedConsequences(agent.needs, hours); if (agent.needs.health <= 0) { handleDeath(simulation, agent); continue; } } catch (error) { agent.currentActivity = "idle"; agent.currentIntent = null; agent.lastActionResult = { success: false, reason: "simulation_error" }; console.error("Lúmina: error procesando a " + (agent.name ?? agent.id ?? "habitante"), error); } }
  simulation.world.spatial.activeRegions = getActiveRegionKeys(simulation.agents, simulation.world);
}
export function recoverCoreAgent(agent) { agent.currentActivity = agent.alive === false ? "dead" : (agent.currentActivity ?? "idle"); agent.currentIntent = agent.currentIntent ?? null; agent.activityRemainingHours = Math.max(0, Number(agent.activityRemainingHours ?? 0)); agent.collectiveProjects ??= []; agent.exploredAreas ??= []; agent.needs ??= { hunger: 80, thirst: 80, energy: 80, social: 80, safety: 100, health: 100 }; if (!Number.isFinite(Number(agent.needs.health))) agent.needs.health = 100; for (const key of ["hunger", "thirst", "energy", "social", "safety"]) { if (!Number.isFinite(Number(agent.needs[key]))) agent.needs[key] = 80; agent.needs[key] = Math.max(0, Math.min(100, Number(agent.needs[key]))); } agent.needs.health = Math.max(0, Math.min(100, Number(agent.needs.health))); }
function handleDeath(simulation, agent) { if (agent.alive === false) return; agent.alive = false; agent.currentActivity = "dead"; agent.currentIntent = null; recordEvent(simulation, { type: "death", description: `${agent.name} murió.`, participants: [agent.id] }); }