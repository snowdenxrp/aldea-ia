import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { world as defaultWorld } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";

const STATE_PATH = new URL("../world-state.json", import.meta.url);
const MAX_CATCHUP_SECONDS = 12 * 60 * 60;
let tempSequence = 0;

function clone(value) { return structuredClone(value); }

const STATE_LOCK_RETRY_MS = 10;
const STATE_LOCK_STALE_MS = 60_000;

function lockPathFor(statePath) {
  return `${statePath.pathname}.lock`;
}

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error?.code === "EPERM"; }
}

async function readLockOwner(lockPath) {
  try { return JSON.parse(await fs.readFile(path.join(lockPath, "owner.json"), "utf8")); } catch { return null; }
}

async function acquireStateLock(statePath) {
  const lockPath = lockPathFor(statePath);
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const owner = { pid: process.pid, token, createdAt: Date.now() };
  while (true) {
    try {
      await fs.mkdir(lockPath);
      await fs.writeFile(path.join(lockPath, "owner.json"), JSON.stringify(owner), "utf8");
      return async () => {
        const current = await readLockOwner(lockPath);
        if (current?.token === token) await fs.rm(lockPath, { recursive: true, force: true });
      };
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      const current = await readLockOwner(lockPath);
      let lockAge = 0;
      try { lockAge = Date.now() - (await fs.stat(lockPath)).mtimeMs; } catch {}
      const stale = current
        ? (lockAge > STATE_LOCK_STALE_MS && !processIsAlive(Number(current.pid)))
        : lockAge > STATE_LOCK_STALE_MS;
      if (stale) {
        await fs.rm(lockPath, { recursive: true, force: true }).catch(() => {});
        continue;
      }
      await new Promise(resolve => setTimeout(resolve, STATE_LOCK_RETRY_MS));
    }
  }
}


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
      state.stateRevision = Number.isInteger(Number(state.stateRevision)) && Number(state.stateRevision) >= 0 ? Number(state.stateRevision) : 0;
      return state;
    }
  } catch {}
  return { version: 5, stateRevision: 0, savedAt: Date.now(), day: defaultWorld.day, hour: defaultWorld.timeOfDay, world: clone(defaultWorld), agents: createInitialAgents(), events: [], nexoMemory: null };
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

export async function persistState(statePath, simulation, savedAt, { expectedRevision = null, stateRevision = null, loadCurrentState = loadState, fsModule = fs } = {}) {
  const releaseLock = await acquireStateLock(statePath);
  try {
  if (expectedRevision !== null) {
    const current = await loadCurrentState(statePath);
    const currentRevision = Number.isInteger(Number(current.stateRevision)) ? Number(current.stateRevision) : 0;
    if (currentRevision !== Number(expectedRevision)) {
      const error = new Error(`STATE_REVISION_CONFLICT: expected ${expectedRevision}, found ${currentRevision}`);
      error.code = "STATE_REVISION_CONFLICT";
      throw error;
    }
  }
  const nextRevision = stateRevision === null ? 0 : Number(stateRevision);
  if (!Number.isInteger(nextRevision) || nextRevision < 0) throw new TypeError("stateRevision must be a non-negative integer");
  const payload = {
    version: 5,
    stateRevision: nextRevision,
    savedAt,
    day: simulation.day,
    hour: simulation.hour,
    world: simulation.world,
    agents: simulation.agents,
    events: simulation.events.slice(-500),
    nexoMemory: simulation.nexoMemory
  };
  const tempPrefix = `${statePath.pathname}.tmp-`;
  try {
    const siblings = await fs.readdir(path.dirname(statePath.pathname));
    await Promise.all(siblings.filter(name => name.startsWith(path.basename(tempPrefix))).map(name => fs.rm(path.join(path.dirname(statePath.pathname), name), { force: true })));
  } catch {}
  const tempPath = `${statePath.pathname}.tmp-${process.pid}-${Date.now()}-${++tempSequence}`;
  try {
    await fsModule.writeFile(tempPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
    await fsModule.rename(tempPath, statePath);
  } catch (error) {
    await fs.rm(tempPath, { force: true }).catch(() => {});
    throw error;
  }
  return payload;
  } finally {
    await releaseLock();
  }
}

async function main() {
  const state = await loadState();
  const now = Date.now();
  const previousSavedAt = Number(state.savedAt) || now;
  const elapsedSeconds = Math.max(0, Math.min((now - previousSavedAt) / 1000, MAX_CATCHUP_SECONDS));
  const simulation = applyState(state);
  advance(simulation, elapsedSeconds);
  const persistedSavedAt = previousSavedAt + elapsedSeconds * 1000;

  await persistState(STATE_PATH, simulation, persistedSavedAt, { expectedRevision: state.stateRevision, stateRevision: state.stateRevision + 1 });

  console.log(JSON.stringify({ simulatedSeconds: Math.round(elapsedSeconds), day: simulation.day, hour: Number(simulation.hour.toFixed(3)), agents: simulation.agents.length, coreAlive: simulation.agents.filter(a => ["alex", "bruno"].includes(a.id)).every(a => a.alive), nexoMemory: Boolean(simulation.nexoMemory) }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}