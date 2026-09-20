import fs from "node:fs/promises";
import { createSimulation, tick } from "../src/simulation.js";
import { world } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";
import { createSeededRandom } from "../src/random.js";

const HORIZONS = [1, 7, 30, 100, 500, 1000, 2500];
const AUDIT_SEED = "lumina-audit-2026";
const HOURS_PER_DAY = 24;
const MOVEMENT_SECONDS_PER_SIM_HOUR = 37.5;

const base = { world: structuredClone(world), agents: structuredClone(createInitialAgents()), day: world.day, hour: world.timeOfDay, version: 3 };
const clone = value => structuredClone(value);
const finite = value => Number.isFinite(Number(value));

function validate(simulation) {
  const problems = [];
  const agents = Array.isArray(simulation.agents) ? simulation.agents : [];
  if (!finite(simulation.day) || !finite(simulation.hour)) problems.push("invalid_time");
  if (!agents.length) problems.push("no_agents");

  for (const agent of agents) {
    if (!agent?.id) problems.push("agent_without_id");
    if (!finite(agent?.position?.x) || !finite(agent?.position?.z)) problems.push("invalid_position:" + (agent.id ?? "?"));
    for (const key of ["hunger","thirst","energy","social","safety","health"]) {
      const value = Number(agent?.needs?.[key]);
      if (!finite(value) || value < 0 || value > 100) problems.push("invalid_need:" + agent.id + ":" + key);
    }
    if (["alex","bruno"].includes(agent.id) && agent.alive !== true && agent.needs.health > 0) problems.push("invalid_alive_state:" + agent.id);
    for (const item of agent.inventory ?? []) if (!finite(item.amount) || Number(item.amount) < 0) problems.push("invalid_inventory:" + agent.id);
    if (agent.lastActionResult?.reason === "simulation_error") problems.push("simulation_error:" + agent.id);
    if (agent.plan && (!Number.isFinite(Number(agent.plan.progress)) || Number(agent.plan.progress) < 0)) problems.push("invalid_plan:" + agent.id);
    for (const tool of agent.inventory ?? []) if (tool.type === "tool" && (!finite(tool.durability) || Number(tool.durability) < 0)) problems.push("invalid_tool:" + agent.id);
  }

  const ecosystem = simulation.world?.ecosystem;
  if (ecosystem) for (const key of ["biodiversity", "soilQuality", "waterQuality", "humanPressure"]) if (!finite(ecosystem[key]) || ecosystem[key] < 0 || ecosystem[key] > 1) problems.push("invalid_ecosystem:" + key);
  for (const project of simulation.world?.collectiveProjects ?? []) {
    if (!Array.isArray(project.participants) || project.participants.length < 2) problems.push("invalid_collective_project:" + (project.id ?? "?"));
    if (!finite(project.progress?.wood) || !finite(project.progress?.stone)) problems.push("invalid_collective_progress:" + (project.id ?? "?"));
  }
  for (const [name, resource] of Object.entries(simulation.world?.resources ?? {})) {
    if (resource.amount !== undefined && (!finite(resource.amount) || Number(resource.amount) < 0)) problems.push("invalid_resource:" + name);
  }
  return problems;
}

function actionStats(simulation) {
  return Object.fromEntries(simulation.agents.map(agent => [agent.id, {
    lastAction: agent.lastActionName ?? null,
    activity: agent.currentActivity ?? null,
    intent: agent.currentIntent?.name ?? null,
    simulationErrors: agent.lastActionResult?.reason === "simulation_error" ? 1 : 0
  }]));
}

function metrics(simulation, hours) {
  return {
    simulatedDays: hours / HOURS_PER_DAY,
    day: simulation.day,
    hour: simulation.hour,
    alive: simulation.agents.filter(a => a.alive !== false).length,
    needs: Object.fromEntries(simulation.agents.map(a => [a.id, {...a.needs}])),
    resources: Object.fromEntries(Object.entries(simulation.world.resources ?? {}).map(([k,v]) => [k, v.amount])),
    knownActions: Object.fromEntries(simulation.agents.map(a => [a.id, (a.knowledge ?? []).filter(k => String(k.topic).startsWith("action:")).map(k => k.topic)])),
    memories: Object.fromEntries(simulation.agents.map(a => [a.id, (a.memories ?? []).length])),
    experiences: Object.fromEntries(simulation.agents.map(a => [a.id, (a.experiences ?? []).length])),
    relationshipHistory: Object.fromEntries(simulation.agents.map(a => [a.id, (a.relationships ?? []).reduce((n,r) => n + (r.history?.length ?? 0), 0)])),
    events: simulation.events.length,
    ecosystem: simulation.world.ecosystem ? { ...simulation.world.ecosystem } : null,
    collectiveProjects: (simulation.world.collectiveProjects ?? []).length,
    autonomy: Object.fromEntries(simulation.agents.map(a => [a.id, a.autonomySnapshot ?? null])),
    actions: actionStats(simulation),
    problems: validate(simulation)
  };
}

function run(days) {
  const simulation = createSimulation(clone(base.world), clone(base.agents), { random: createSeededRandom(AUDIT_SEED + ":" + days) });
  simulation.day = Number(base.day) || simulation.day;
  simulation.hour = Number(base.hour) || simulation.hour;
  simulation.events = [];

  const totalHours = days * HOURS_PER_DAY;
  const problemCounts = new Map();
  const actionCounts = new Map();
  const deaths = new Map();
  const actionStreaks = new Map();
  const maxStreak = new Map();
  const healthFloor = new Map();
  const firstDeathHour = new Map();
  const deathSnapshots = new Map();

  for (let hour = 1; hour <= totalHours; hour++) {
    tick(simulation, 1);

    for (const agent of simulation.agents) {
      if (agent.currentIntent?.target) setMovementTarget(agent, agent.currentIntent.target, simulation.world.bounds);
      moveAgent(agent, MOVEMENT_SECONDS_PER_SIM_HOUR);

      const action = agent.lastActionName ?? "none";
      const key = agent.id + ":" + action;
      actionCounts.set(key, (actionCounts.get(key) ?? 0) + 1);
      if (agent.alive === false) {
        deaths.set(agent.id, (deaths.get(agent.id) ?? 0) + 1);
        if (!firstDeathHour.has(agent.id)) {
          firstDeathHour.set(agent.id, hour);
          deathSnapshots.set(agent.id, {
            hour,
            day: simulation.day,
            needs: { ...agent.needs },
            position: { ...agent.position },
            lastAction: agent.lastActionName ?? null,
            lastResult: agent.lastActionResult ?? null,
            inventory: clone(agent.inventory ?? []),
            knownActions: (agent.knowledge ?? []).filter(k => String(k.topic).startsWith("action:")).map(k => k.topic)
          });
        }
      }
      const previous = agent.__auditPreviousAction;
      const streak = action === previous ? (agent.__auditStreak ?? 0) + 1 : 1;
      agent.__auditPreviousAction = action;
      agent.__auditStreak = streak;
      maxStreak.set(agent.id, Math.max(maxStreak.get(agent.id) ?? 0, streak));
      healthFloor.set(agent.id, Math.min(healthFloor.get(agent.id) ?? 100, Number(agent.needs.health)));
    }

    for (const problem of validate(simulation)) problemCounts.set(problem, (problemCounts.get(problem) ?? 0) + 1);
  }

  return {
    horizonDays: days,
    final: metrics(simulation, totalHours),
    actionCounts: Object.fromEntries(actionCounts),
    deaths: Object.fromEntries(deaths),
    maxActionStreak: Object.fromEntries(maxStreak),
    firstDeathHour: Object.fromEntries(firstDeathHour),
    deathSnapshots: Object.fromEntries(deathSnapshots),
    healthFloor: Object.fromEntries(healthFloor),
    problemCounts: Object.fromEntries(problemCounts)
  };
}

const results = HORIZONS.map(run);
console.log(JSON.stringify({
  audit: "lumina-longevity-v2",
  generatedAt: new Date().toISOString(),
  baseState: { version: base.version, day: base.day, hour: base.hour, agents: base.agents?.length ?? 0 },
  results,
  verdict: results.every(r => Object.keys(r.problemCounts).length === 0) ? "no_invariant_failures" : "invariant_failures_detected"
}, null, 2));
