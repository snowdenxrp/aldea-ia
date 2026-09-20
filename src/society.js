// Sociedad, ciclo de vida y cultura emergente de Lúmina.
// Las reglas producen posibilidades; no existe una historia prefijada.
import { createAgent } from "./agents.js";
import { remember } from "./memory.js";
import { getOrCreateRelationship, recordInteraction } from "./relationships.js";
import { discoverAction } from "./discovery.js";
import { normalizeTechnologyWorld, advanceTechnologyDay } from "./technology.js";
import { normalizeInstitutionWorld, advanceInstitutionDay } from "./institutions.js";
import { normalizeGovernanceWorld, advanceGovernanceDay } from "./governance.js";
import { normalizeSpecializationWorld, normalizeSpecializationAgent, advanceSpecializationDay, inheritSpecialization } from "./specialization.js";
import { normalizeEconomyWorld, advanceEconomyDay } from "./economy.js";

const DAY = 1 / 365;
const MAX_AGE = 95;
const CULTURE_CAP = 120;

export function normalizeSocietyWorld(world) {
  world.culture ??= { traditions: [], values: {}, history: [] };
  world.culture.traditions ??= []; world.culture.values ??= {}; world.culture.history ??= [];
  world.life ??= { births: 0, deaths: 0, generations: 0 };
  world.life.births ??= 0; world.life.deaths ??= 0; world.life.generations ??= 0;
  normalizeSpecializationWorld(world);
  normalizeEconomyWorld(world);
}
export function normalizeAgentLife(agent) {
  agent.age = Number.isFinite(Number(agent.age)) ? Number(agent.age) : 15;
  if (!agent.sex && agent.id === "alex") agent.sex = "female";
  if (!agent.sex && agent.id === "bruno") agent.sex = "male";
  agent.parents ??= []; agent.children ??= []; agent.pregnancy ??= null;
  agent.generation ??= 0; agent.lifeExperience ??= 0; agent.cultureKnowledge ??= [];
  normalizeSpecializationAgent(agent);
}
export function advanceSocietyDay(simulation) {
  normalizeSocietyWorld(simulation.world);
  for (const agent of simulation.agents) normalizeAgentLife(agent);
  advanceAges(simulation); processPregnancies(simulation); considerConception(simulation);
  updateCulture(simulation); propagateSocialLearning(simulation); advanceTechnology(simulation);
  propagateCulture(simulation);
  teachSpecialization(simulation);
  advanceInstitutionDay(simulation);
  advanceGovernanceDay(simulation);
  advanceSpecializationDay(simulation);
  advanceEconomyDay(simulation);
  advanceTechnologyDay(simulation);
}
function advanceAges(simulation) {
  for (const agent of simulation.agents) {
    if (!agent.alive) continue; agent.age += DAY; agent.lifeExperience += 1;
    if (agent.age >= MAX_AGE) {
      agent.alive = false; agent.currentActivity = "dead"; agent.currentIntent = null;
      simulation.world.life.deaths += 1;
      simulation.events.push({ id: "event-" + (simulation.events.length + 1), day: simulation.day, hour: 0, type: "death", description: agent.name + " murió por edad avanzada.", participants: [agent.id] });
    }
  }
}
function considerConception(simulation) {
  const adults = simulation.agents.filter(a => a.alive && a.age >= 18 && a.age <= 42 && !a.pregnancy && a.sex);
  for (const carrier of adults.filter(a => a.sex === "female")) {
    const candidates = adults.filter(a => a.id !== carrier.id && a.sex === "male");
    for (const partner of candidates) {
      const rel = carrier.relationships.find(r => r.agentId === partner.id);
      if (!rel || rel.familiarity < 0.5 || rel.trust < 0.2 || rel.affection < 0.15 || rel.tension > 0.55) continue;
      if (carrier.needs.health < 60 || partner.needs.health < 60) continue;
      const roll = simulation.random ? simulation.random() : Math.random();
      if (roll < 0.0025) {
        carrier.pregnancy = { partnerId: partner.id, remainingDays: 270, startedDay: simulation.day };
        recordInteraction(carrier, partner, { day: simulation.day, type: "family_bond", description: carrier.name + " y " + partner.name + " iniciaron una etapa familiar.", trust: 0.02, cooperation: 0.04, affection: 0.05 });
        recordInteraction(partner, carrier, { day: simulation.day, type: "family_bond", description: partner.name + " y " + carrier.name + " iniciaron una etapa familiar.", trust: 0.02, cooperation: 0.04, affection: 0.05 });
        break;
      }
    }
  }
}
function processPregnancies(simulation) {
  for (const mother of simulation.agents) {
    if (!mother.alive || !mother.pregnancy) continue;
    mother.pregnancy.remainingDays -= 1; if (mother.pregnancy.remainingDays > 0) continue;
    const father = simulation.agents.find(a => a.id === mother.pregnancy.partnerId && a.alive);
    const id = "child-" + (simulation.world.life.births + 1);
    const child = createAgent({ id, name: "Habitante " + (simulation.world.life.births + 1), age: 0, position: { ...mother.position } });
    child.sex = ((simulation.random ? simulation.random() : Math.random()) < 0.5) ? "female" : "male";
    child.parents = [mother.id, father?.id].filter(Boolean);
    child.generation = Math.max(mother.generation || 0, father?.generation || 0) + 1;
    child.needs = { hunger: 100, thirst: 100, energy: 85, social: 80, safety: 90, health: 100 }; child.money = 0;
    child.knowledge = inheritedKnowledge(mother, father);
    child.cultureKnowledge = [...new Set([...(mother.cultureKnowledge || []), ...(father?.cultureKnowledge || [])])].slice(0, 20);
    child.specialization = inheritSpecialization(mother, father);
    simulation.agents.push(child); mother.children.push(child.id); if (father) father.children.push(child.id); mother.pregnancy = null;
    simulation.world.life.births += 1; simulation.world.life.generations = Math.max(simulation.world.life.generations, child.generation);
    const event = { id, day: simulation.day, hour: 0, type: "birth", description: child.name + " nació en Lúmina.", participants: child.parents };
    simulation.events.push(event); remember(mother, { ...event, type: "family", importance: 1, emotionalWeight: 0.7 });
    if (father) remember(father, { ...event, type: "family", importance: 1, emotionalWeight: 0.7 }); remember(child, { ...event, type: "birth", importance: 1, emotionalWeight: 0.3 });
  }
}
function inheritedKnowledge(mother, father) {
  const pool = [...(mother?.knowledge || []), ...(father?.knowledge || [])].filter(k => k.topic && k.confidence >= 0.55).sort((a,b) => b.confidence - a.confidence);
  const result = []; for (const item of pool) { if (result.some(k => k.topic === item.topic)) continue;
    result.push({ ...item, confidence: Math.min(0.45, item.confidence * 0.45), evidence: [], source: "family", learnedOnDay: null }); if (result.length >= 8) break; } return result;
}
function updateCulture(simulation) {
  const culture = simulation.world.culture; const counts = new Map();
  for (const event of simulation.events.slice(-200)) counts.set(event.type, (counts.get(event.type) || 0) + 1);
  for (const [key,count] of counts) { if (count < 3) continue; const existing = culture.traditions.find(t => t.key === key);
    if (existing) { existing.strength = Math.min(1, existing.strength + 0.01); existing.lastObservedDay = simulation.day; }
    else { culture.traditions.push({ key, strength: 0.12, originDay: simulation.day, lastObservedDay: simulation.day }); culture.history.push({ day: simulation.day, key, reason: "repeated collective behavior" }); }
  } culture.traditions.sort((a,b) => b.strength-a.strength); culture.traditions = culture.traditions.slice(0,CULTURE_CAP); culture.history = culture.history.slice(-500);
}
function propagateSocialLearning(simulation) {
  for (const agent of simulation.agents) { if (!agent.alive) continue;
    const close = simulation.agents.filter(other => other.alive && other.id !== agent.id && distance(agent,other) <= 2.2);
    for (const other of close) { const rel = getOrCreateRelationship(agent,other.id); if (rel.trust < 0.25 || rel.familiarity < 0.35) continue;
      const known = agent.knowledge.filter(k => k.confidence >= 0.65 && k.topic.startsWith("action:"));
      for (const knowledge of known.slice(0,1)) { if (!other.knowledge.some(k => k.topic === knowledge.topic)) discoverAction(other,{ actionName: knowledge.topic.replace("action:",""), belief: knowledge.belief, confidence: Math.min(0.35,knowledge.confidence*0.5), evidence: "Aprendido observando a " + agent.name, outcome: 0.2, day: simulation.day, reliability: 0.45 }); }
    }
  }
}
function advanceTechnology(simulation) {
  for (const agent of simulation.agents) { if (!agent.alive) continue;
    const toolmaking = agent.skills.find(s => s.name === "toolmaking")?.level || 0;
    if (toolmaking >= 0.7 && !agent.knowledge.some(k => k.topic === "technology:advanced_tools")) agent.knowledge.push({ topic:"technology:advanced_tools", belief:"Las herramientas pueden mejorarse mediante experiencia y materiales.", confidence:0.45, evidence:[{day:simulation.day,description:"Experiencia repetida fabricando herramientas.",outcome:0.4,reliability:0.7}],source:"experience",learnedOnDay:simulation.day });
    const builder = agent.skills.find(s => s.name === "build_shelter")?.level || 0;
    if (builder >= 0.7 && !agent.knowledge.some(k => k.topic === "technology:durable_shelter")) agent.knowledge.push({ topic:"technology:durable_shelter", belief:"La construcción puede hacerse más resistente con experiencia.", confidence:0.45, evidence:[{day:simulation.day,description:"Experiencia repetida construyendo.",outcome:0.4,reliability:0.7}],source:"experience",learnedOnDay:simulation.day });
  }
}
function propagateCulture(simulation) {
  const strong = simulation.world.culture.traditions.filter(t => t.strength >= 0.35).slice(0,5);
  for (const agent of simulation.agents) { if (!agent.alive) continue; agent.cultureKnowledge = [...new Set([...(agent.cultureKnowledge || []), ...strong.map(t=>t.key)])].slice(-20); }
}
function teachSpecialization(simulation) {
  const adults = simulation.agents.filter(a => a.alive && a.age >= 18);
  for (const teacher of adults) {
    const role = teacher.specialization?.role;
    if (!role) continue;
    const skills = { gatherer: ["gather_wood", "gather_stone", "catch_fish"], farmer: ["farm", "harvest"], builder: ["build_shelter"], craftsperson: ["craft_tool", "toolmaking"], trader: ["trade"], teacher: ["share_knowledge"], organizer: ["cooperate"] }[role] || [];
    const students = simulation.agents.filter(s => s.alive && s.id !== teacher.id && s.age < 18 && distance(teacher, s) <= 3.2);
    for (const student of students.slice(0, 2)) {
      const relationship = teacher.relationships.find(r => r.agentId === student.id);
      if ((relationship?.trust ?? 0) < 0.1) continue;
      const skillName = skills.slice().sort((a,b) => Number(teacher.skills.find(s=>s.name===b)?.level||0) - Number(teacher.skills.find(s=>s.name===a)?.level||0))[0];
      if (!skillName) continue;
      const source = Number(teacher.skills.find(s => s.name === skillName)?.level || 0);
      if (source < 0.35) continue;
      const target = student.skills.find(s => s.name === skillName);
      if (target) target.level = Math.min(1, target.level + 0.025);
      else student.skills.push({ name: skillName, level: 0.025, learnedOnDay: simulation.day, source: "mentorship" });
      student.specialization.mentorship.learned += 1;
      teacher.specialization.mentorship.taught += 1;
      student.cultureKnowledge = [...new Set([...(student.cultureKnowledge || []), "role:" + role])].slice(-20);
      simulation.events.push({ id: "event-" + (simulation.events.length + 1), day: simulation.day, hour: 0, type: "mentorship", description: teacher.name + " enseñó a " + student.name + " sobre " + skillName + ".", participants: [teacher.id, student.id] });
    }
  }
}

function distance(a,b) { return Math.hypot(a.position.x-b.position.x,a.position.z-b.position.z); }
