import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
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
    agent.currentActivity = agent.alive === false ? "dead" : (agent.currentActivity ?? "idle");
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

export async function loadState(statePath = STATE_PATH) {
  try {
    const raw = await fs.readFile(statePath, "utf8");
    const state = JSON.parse(raw);
    if (state?.version >= 3 && Array.isArray(state.agents) && state.world) {
      state.world.day = Number(state.day) || state.world.day || 1;
      state.world.timeOfDay = Number.isFinite(Number(state.hour)) ? Number(state.hour) : (state.world.timeOfDay || 8);
      for (const type of ["wild_plants", "fish"]) {
        const persisted = state.world.resources?.[type];
        const defaults = defaultWorld.resources?.[type];
        if (persisted && defaults) {
          persisted.regenerationPerDay = defaults.regenerationPerDay;
          if (Number(state.version) < 4 && Number(persisted.amount) <= 0) {
            persisted.amount = defaults.amount;
          }
        }
      }
      state.version = Math.max(4, Number(state.version) || 4);
      return state;
    }
  } catch {}
  return { version: 5, savedAt: Date.now(), day: defaultWorld.day, hour: defaultWorld.timeOfDay, world: clone(defaultWorld), agents: createInitialAgents(), events: [], nexoMemory: null };
}

export function applyState(state) {
  const world = clone(state.world);
  const agents = clone(state.agents);
  recoverCoreAgents(agents);
  const simulation = createSimulation(world, agents, { nexoMemory: state.nexoMemory ?? null });
  simulation.day = Number(state.day) || world.day || 1;
  simulation.hour = Number.isFinite(Number(state.hour)) ? Number(state.hour) : (world.timeOfDay || 8);
  simulation.events = Array.isArray(state.events) ? state.events.slice(-500) : [];
  simulation.world.day = simulation.day;
  simulation.world.timeOfDay = simulation.hour;
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

export async function persistState(statePath, simulation, savedAt) {
  const payload = {
    version: 5,
    savedAt,
    day: simulation.day,
    hour: simulation.hour,
    world: simulation.world,
    agents: simulation.agents,
    events: simulation.events.slice(-500),
    nexoMemory: simulation.nexoMemory
  };
  const tempPath = `${statePath.pathname}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tempPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  await fs.rename(tempPath, statePath);
  return payload;
}

async function main() {
  export async function persistState(statePath, simulation, savedAt) {
  const payload = {
    version: 5,
    savedAt,
    day: simulation.day,
    hour: simulation.hour,
    world: simulation.world,
    agents: simulation.agents,
    events: simulation.events.slice(-500),
    nexoMemory: simulation.nexoMemory
  };
  const tempPath = `${statePath.pathname}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tempPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  await fs.rename(tempPath, statePath);
  return payload;
}

async function main() {
  const state = await loadState();
  const now = Date.now();
  const previousSavedAt = Number(state.savedAt) || now;
  const elapsedSeconds = Math.max(0, Math.min((now - previousSavedAt) / 1000, MAX_CATCHUP_SECONDS));
  const simulation = applyState(state);
  advance(simulation, elapsedSeconds);
  const persistedSavedAt = previousSavedAt + elapsedSeconds * 1000;

  await persistState(STATE_PATH, simulation, persistedSavedAt);

  console.log(JSON.stringify({ simulatedSeconds: Math.round(elapsedSeconds), day: simulation.day, hour: Number(simulation.hour.toFixed(3)), agents: simulation.agents.length, coreAlive: simulation.agents.filter(a => ["alex", "bruno"].includes(a.id)).every(a => a.alive), nexoMemory: Boolean(simulation.nexoMemory) }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}