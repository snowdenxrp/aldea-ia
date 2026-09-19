import fs from "node:fs/promises";
import { world as defaultWorld } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";

const STATE_PATH = new URL("../world-state.json", import.meta.url);
const MAX_CATCHUP_SECONDS = 12 * 60 * 60;

function clone(value) { return structuredClone(value); }

function recoverCoreAgents(agents) {
  const initial = createInitialAgents();
  for (const fallback of initial) {
    let agent = agents.find(item => item?.id === fallback.id);
    if (!agent) { agents.push(clone(fallback)); agent = agents[agents.length - 1]; }
    agent.currentActivity = agent.currentActivity === "dead" ? "idle" : (agent.currentActivity ?? "idle");
    agent.currentIntent = agent.currentIntent ?? null;
    agent.position ??= { ...fallback.position };
    agent.needs ??= clone(fallback.needs);
    if (!Number.isFinite(Number(agent.needs.health))) agent.needs.health = 100;
    for (const key of ["hunger", "thirst", "energy", "social", "safety"]) {
      if (!Number.isFinite(Number(agent.needs[key]))) agent.needs[key] = 80;
      agent.needs[key] = Math.max(0, Math.min(100, Number(agent.needs[key])));
    }
    agent.needs.health = Math.max(0, Math.min(100, Number(agent.needs.health)));
  }
}

async function loadState() {
  try {
    const raw = await fs.readFile(STATE_PATH, "utf8");
    const state = JSON.parse(raw);
    if (state?.version >= 3 && Array.isArray(state.agents) && state.world) return state;
  } catch {}
  return { version: 3, savedAt: Date.now(), day: defaultWorld.day, hour: defaultWorld.timeOfDay, world: clone(defaultWorld), agents: createInitialAgents(), events: [] };
}

function applyState(state) {
  const world = clone(state.world);
  const agents = clone(state.agents);
  recoverCoreAgents(agents);
  const simulation = createSimulation(world, agents);
  simulation.day = Number(state.day) || world.day || 1;
  simulation.hour = Number.isFinite(Number(state.hour)) ? Number(state.hour) : (world.timeOfDay || 8);
  simulation.events = Array.isArray(state.events) ? state.events.slice(-500) : [];
  return simulation;
}

function advance(simulation, seconds) {
  const step = 1;
  let remaining = Math.max(0, Math.min(seconds, MAX_CATCHUP_SECONDS));
  while (remaining > 0) {
    const delta = Math.min(step, remaining);
    tick(simulation, delta / 37.5);
    for (const agent of simulation.agents) {
      if (!agent.alive) continue;
      if (agent.currentIntent?.target) setMovementTarget(agent, agent.currentIntent.target, simulation.world.bounds);
      moveAgent(agent, delta);
    }
    remaining -= delta;
  }
  recoverCoreAgents(simulation.agents);
}

const state = await loadState();
const now = Date.now();
const previousSavedAt = Number(state.savedAt) || now;
const elapsedSeconds = Math.max(0, Math.min((now - previousSavedAt) / 1000, MAX_CATCHUP_SECONDS));
const simulation = applyState(state);
advance(simulation, elapsedSeconds);

await fs.writeFile(STATE_PATH, JSON.stringify({ version: 3, savedAt: now, day: simulation.day, hour: simulation.hour, world: simulation.world, agents: simulation.agents, events: simulation.events.slice(-500) }, null, 2) + "\n", "utf8");

console.log(JSON.stringify({ simulatedSeconds: Math.round(elapsedSeconds), day: simulation.day, hour: Number(simulation.hour.toFixed(3)), agents: simulation.agents.length, coreAlive: simulation.agents.filter(a => ["alex", "bruno"].includes(a.id)).every(a => a.alive) }));
