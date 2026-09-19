import fs from "node:fs/promises";
import { createSimulation, tick } from "../src/simulation.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";

const STATE_PATH = new URL("../world-state.json", import.meta.url);
const HORIZONS = [100, 500, 1000];
const HOURS_PER_DAY = 24;
const REAL_SECONDS_PER_SIMULATED_HOUR = 37.5;

const raw = await fs.readFile(STATE_PATH, "utf8");
const base = JSON.parse(raw);

function clone(value) { return structuredClone(value); }
function finite(value) { return Number.isFinite(Number(value)); }

function validate(simulation) {
  const problems = [];
  const agents = Array.isArray(simulation.agents) ? simulation.agents : [];
  const resources = simulation.world?.resources ?? {};

  if (!finite(simulation.day) || !finite(simulation.hour)) problems.push("invalid_time");
  if (!agents.length) problems.push("no_agents");

  for (const agent of agents) {
    if (!agent?.id) problems.push("agent_without_id");
    for (const key of ["x", "z"]) {
      if (!finite(agent?.position?.[key])) problems.push("invalid_position:" + (agent.id ?? "?"));
    }
    for (const key of ["hunger","thirst","energy","social","safety","health"]) {
      const value = Number(agent?.needs?.[key]);
      if (!finite(value) || value < 0 || value > 100) problems.push("invalid_need:" + agent.id + ":" + key);
    }
    if (["alex","bruno"].includes(agent.id) && agent.alive !== true) problems.push("core_dead:" + agent.id);
    for (const item of agent.inventory ?? []) {
      if (!finite(item.amount) || Number(item.amount) < 0) problems.push("invalid_inventory:" + agent.id);
    }
  }

  for (const [name, resource] of Object.entries(resources)) {
    if (resource.amount !== undefined && (!finite(resource.amount) || Number(resource.amount) < 0)) {
      problems.push("invalid_resource:" + name);
    }
  }
  return problems;
}

function metrics(simulation, hours) {
  const agents = simulation.agents;
  const needs = {};
  for (const agent of agents) needs[agent.id] = { ...agent.needs };

  return {
    simulatedDays: hours / HOURS_PER_DAY,
    day: simulation.day,
    hour: simulation.hour,
    agents: agents.length,
    alive: agents.filter(a => a.alive !== false).length,
    needs,
    resources: Object.fromEntries(Object.entries(simulation.world.resources ?? {}).map(([k,v]) => [k, v.amount])),
    knownActions: Object.fromEntries(agents.map(a => [a.id, (a.knowledge ?? []).filter(k => String(k.topic).startsWith("action:")).length])),
    memories: Object.fromEntries(agents.map(a => [a.id, (a.memories ?? []).length])),
    experiences: Object.fromEntries(agents.map(a => [a.id, (a.experiences ?? []).length])),
    relationshipHistory: Object.fromEntries(agents.map(a => [a.id, (a.relationships ?? []).reduce((sum,r) => sum + (r.history?.length ?? 0), 0)])),
    skills: Object.fromEntries(agents.map(a => [a.id, (a.skills ?? []).length])),
    events: simulation.events.length,
    problems: validate(simulation)
  };
}

function advanceMovement(simulation) {
  for (const agent of simulation.agents) {
    if (!agent.alive) continue;
    if (agent.currentIntent?.target) setMovementTarget(agent, agent.currentIntent.target, simulation.world.bounds);
    moveAgent(agent, REAL_SECONDS_PER_SIMULATED_HOUR);
  }
}

function run(days) {
  const simulation = createSimulation(clone(base.world), clone(base.agents));
  simulation.day = Number(base.day) || simulation.day;
  simulation.hour = Number(base.hour) || simulation.hour;
  simulation.events = clone(base.events ?? []).slice(-500);

  const totalHours = days * HOURS_PER_DAY;
  const samples = [];
  const problemCounts = new Map();
  let previousAction = new Map();
  let maxSameActionStreak = new Map();
  let sameActionStreak = new Map();

  for (let hour = 1; hour <= totalHours; hour++) {
    tick(simulation, 1);
    advanceMovement(simulation);

    for (const agent of simulation.agents) {
      const action = agent.lastActionName ?? agent.currentIntent?.name ?? "none";
      const prev = previousAction.get(agent.id);
      const streak = action === prev ? (sameActionStreak.get(agent.id) ?? 1) + 1 : 1;
      sameActionStreak.set(agent.id, streak);
      maxSameActionStreak.set(agent.id, Math.max(maxSameActionStreak.get(agent.id) ?? 0, streak));
      previousAction.set(agent.id, action);
    }

    const problems = validate(simulation);
    for (const problem of problems) problemCounts.set(problem, (problemCounts.get(problem) ?? 0) + 1);

    if (hour % 24 === 0 || hour === totalHours) samples.push(metrics(simulation, hour));
  }

  return {
    horizonDays: days,
    final: metrics(simulation, totalHours),
    samples: samples.filter((_, i) => i === 0 || i === samples.length - 1 || (i + 1) % 100 === 0),
    maxSameActionStreak: Object.fromEntries(maxSameActionStreak),
    problemCounts: Object.fromEntries(problemCounts)
  };
}

const results = HORIZONS.map(run);

const report = {
  audit: "lumina-longevity",
  generatedAt: new Date().toISOString(),
  baseState: {
    version: base.version,
    day: base.day,
    hour: base.hour,
    agents: base.agents?.length ?? 0
  },
  results,
  verdict: results.every(r => Object.keys(r.problemCounts).length === 0) ? "no_invariant_failures" : "invariant_failures_detected"
};

console.log(JSON.stringify(report, null, 2));
