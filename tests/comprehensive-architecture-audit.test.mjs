import assert from "node:assert/strict";
import { createSimulation, tick } from "../src/simulation.js";
import { createInitialAgents } from "../src/agents.js";
import { world as baseWorld } from "../src/world.js";
import { createSeededRandom } from "../src/random.js";

const HORIZONS = [1, 30, 100, 500, 1000, 3000];
const HOURS_PER_DAY = 24;

function clone(value) {
  return structuredClone(value);
}

function finite(value) {
  return Number.isFinite(Number(value));
}

function auditState(simulation) {
  const problems = [];
  const world = simulation.world;
  const agents = simulation.agents;

  assert.ok(finite(simulation.day) && finite(simulation.hour), "tiempo inválido");
  assert.ok(agents.length > 0, "la simulación perdió todos los agentes");

  for (const agent of agents) {
    if (!agent?.id) problems.push("agent_without_id");
    if (!finite(agent?.position?.x) || !finite(agent?.position?.z)) problems.push("invalid_position:" + agent.id);
    for (const key of ["hunger", "thirst", "energy", "social", "safety", "health"]) {
      const value = Number(agent?.needs?.[key]);
      if (!finite(value) || value < 0 || value > 100) problems.push("invalid_need:" + agent.id + ":" + key);
    }
    if (!Array.isArray(agent.inventory)) problems.push("invalid_inventory_container:" + agent.id);
    for (const item of agent.inventory ?? []) {
      if (!finite(item.amount) || Number(item.amount) < 0) problems.push("invalid_inventory:" + agent.id);
      if (item.type === "tool" && (!finite(item.durability) || Number(item.durability) < 0)) problems.push("invalid_tool:" + agent.id);
    }
    if (agent.plan && (!finite(agent.plan.progress) || Number(agent.plan.progress) < 0 || !Array.isArray(agent.plan.steps))) {
      problems.push("invalid_plan:" + agent.id);
    }
    const spec = agent.specialization;
    if (!spec || typeof spec !== "object" || !finite(spec.confidence) || spec.confidence < 0 || spec.confidence > 1) {
      problems.push("invalid_specialization:" + agent.id);
    }
    if (!Array.isArray(agent.knowledge) || !Array.isArray(agent.memories) || !Array.isArray(agent.relationships)) {
      problems.push("invalid_cognitive_state:" + agent.id);
    }
    if (!finite(agent.money) || Number(agent.money) < 0) problems.push("invalid_money:" + agent.id);
  }

  for (const key of ["biodiversity", "soilQuality", "waterQuality", "humanPressure"]) {
    const value = Number(world.ecosystem?.[key]);
    if (!finite(value) || value < 0 || value > 1) problems.push("invalid_ecosystem:" + key);
  }

  for (const [name, resource] of Object.entries(world.resources ?? {})) {
    if (resource.amount !== undefined && (!finite(resource.amount) || Number(resource.amount) < 0)) {
      problems.push("invalid_resource:" + name);
    }
  }

  const levels = world.technology?.levels ?? {};
  for (const key of ["tools", "construction", "agriculture"]) {
    if (!finite(levels[key]) || levels[key] < 0 || levels[key] > 2) problems.push("invalid_technology:" + key);
  }

  const economy = world.economy;
  if (!economy || !Array.isArray(economy.trades) || !economy.priceMemory || !Array.isArray(economy.priceHistory)) {
    problems.push("invalid_economy_state");
  }
  for (const value of Object.values(economy?.priceMemory ?? {})) {
    if (!finite(value) || Number(value) <= 0) problems.push("invalid_price");
  }

  if (!Array.isArray(world.collectiveProjects)) problems.push("invalid_collective_container");
  for (const project of world.collectiveProjects ?? []) {
    if (!Array.isArray(project.participants) || project.participants.length < 2) problems.push("invalid_collective_project:" + project.id);
    for (const key of ["wood", "stone"]) {
      if (!finite(project.progress?.[key]) || Number(project.progress[key]) < 0) problems.push("invalid_collective_progress:" + project.id);
    }
  }

  const institutions = world.institutions;
  if (!Array.isArray(institutions)) problems.push("invalid_institution_state");
  for (const institution of institutions ?? []) {
    if (!institution?.id || !institution?.type || !Array.isArray(institution?.members) || !institution?.norms) problems.push("invalid_institution_state");
    if (institution?.history !== undefined && !Array.isArray(institution.history)) problems.push("invalid_institution_history:" + institution.id);
  }
  const research = world.research;
  if (!research || !Array.isArray(research.topics) || !Array.isArray(research.experiments) || !Array.isArray(research.evidence)) problems.push("invalid_research_state");
  for (const topic of research?.topics ?? []) {
    if (!finite(topic.confidence) || Number(topic.confidence) < 0 || Number(topic.confidence) > 0.95) problems.push("invalid_research_confidence:" + topic.id);
    if (!Array.isArray(topic.contributors) || Number(topic.experimentCount) < 0) problems.push("invalid_research_topic:" + topic.id);
  }
  for (const experiment of research?.experiments ?? []) {
    if (!experiment.agentId || !experiment.topicId || !finite(experiment.baseline) || !finite(experiment.result)) problems.push("invalid_research_experiment");
  }

  const governance = world.governance;
  if (!governance || !Array.isArray(governance.proposals) || !Array.isArray(governance.decisions)) problems.push("invalid_governance_state");

  return problems;
}

function snapshot(simulation) {
  const alive = simulation.agents.filter(a => a.alive);
  const roles = alive.filter(a => a.specialization?.role);
  const knowledge = alive.reduce((sum, a) => sum + (a.knowledge?.length ?? 0), 0);
  const mentorship = alive.reduce((sum, a) => sum + Number(a.specialization?.mentorship?.learned ?? 0), 0);
  const technology = simulation.world.technology;
  const research = simulation.world.research;
  return {
    day: simulation.day,
    alive: alive.length,
    births: Number(simulation.world.life?.births ?? 0),
    deaths: Number(simulation.world.life?.deaths ?? 0),
    roles: roles.length,
    roleKinds: new Set(roles.map(a => a.specialization.role)).size,
    knowledge,
    mentorship,
    discoveries: technology?.discoveries?.length ?? 0,
    researchTopics: research?.topics?.length ?? 0,
    researchExperiments: research?.experiments?.length ?? 0,
    reproducedResearch: research?.topics?.filter(topic => topic.contributors?.length >= 2).length ?? 0,
    techLevels: { ...(technology?.levels ?? {}) },
    institutions: simulation.world.institutions?.history?.length ?? 0,
    governanceHistory: simulation.world.governance?.history?.length ?? 0,
    trades: simulation.world.economy?.trades?.length ?? 0,
    projects: simulation.world.collectiveProjects?.length ?? 0,
    events: simulation.events.length
  };
}

function run(days) {
  const simulation = createSimulation(
    clone(baseWorld),
    clone(createInitialAgents()),
    { random: createSeededRandom("lumina-comprehensive-audit:" + days) }
  );
  simulation.events = [];

  const failures = new Map();
  for (let hour = 0; hour < days * HOURS_PER_DAY; hour++) {
    tick(simulation, 1);
    for (const problem of auditState(simulation)) failures.set(problem, (failures.get(problem) ?? 0) + 1);
  }

  const result = snapshot(simulation);
  result.failures = Object.fromEntries(failures);
  return { simulation, result };
}

const results = HORIZONS.map(run);

for (const { result } of results) {
  assert.deepEqual(result.failures, {}, "fallos de invariantes en " + result.day + " días: " + JSON.stringify(result.failures));
  assert.ok(result.alive >= 0, "población inválida en " + result.day + " días");
  assert.ok(result.events > 0, "no hubo actividad registrada");
}

const long = results.at(-1).result;
assert.ok(long.knowledge > 0, "no se conserva conocimiento");
assert.ok(long.researchTopics > 0, "no surgieron temas de investigación");
assert.ok(long.researchExperiments > 0, "no se realizaron experimentos de investigación");
assert.ok(long.roles > 0, "no emergieron especializaciones en la prueba larga");
assert.ok(long.discoveries > 0 || Object.values(long.techLevels).some(Number), "no hubo acumulación tecnológica");
assert.ok(long.institutions >= 0 && long.governanceHistory >= 0, "estado institucional/gubernamental inválido");
assert.ok(long.trades >= 0 && long.projects >= 0, "estado económico/colectivo inválido");

console.log(JSON.stringify({
  audit: "lumina-comprehensive-architecture",
  horizons: HORIZONS,
  results: results.map(({ result }) => result),
  verdict: "PASS"
}, null, 2));
