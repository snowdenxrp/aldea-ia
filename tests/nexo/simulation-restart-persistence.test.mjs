import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { world as defaultWorld } from "../../src/world.js";
import { createInitialAgents } from "../../src/agents.js";
import { createLearningMemory, recordNexoPlan, recordNexoOutcome, reconstructNexoMission } from "../../src/assistants/memory.js";
import { persistState, loadState, applyState } from "../../scripts/simulate.mjs";

const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lumina-nexo-restart-"));
const statePath = pathToFileURL(path.join(dir, "world-state.json"));
const mission = {
  version: 4,
  missionId: "persisted-restart-mission",
  parentMissionId: null,
  replanReason: null,
  objective: "repair_agent_state",
  status: "planned",
  steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] }],
  generatedAt: "2026-09-26T00:00:00.000Z"
};

const memory = recordNexoOutcome(
  recordNexoPlan(createLearningMemory(), mission),
  {
    missionId: mission.missionId,
    stepId: "step-1",
    action: "repair_agent_state",
    target: "alex",
    status: "completed",
    evidence: { verified: true, kind: "agent-state", agentId: "alex" }
  }
);

const simulation = applyState({
  version: 5,
  savedAt: Date.now(),
  day: 7,
  hour: 12,
  world: structuredClone(defaultWorld),
  agents: createInitialAgents(),
  events: [{ id: "restart-event", type: "checkpoint", description: "before restart", participants: [] }],
  nexoMemory: memory
});
await persistState(statePath, simulation, 1234567890);

const raw = JSON.parse(await fs.readFile(statePath, "utf8"));
assert.equal(raw.version, 5);
assert.equal(raw.stateRevision, 0);
assert.ok(raw.nexoMemory);
assert.equal(raw.nexoMemory.nexo.missions[0].missionId, mission.missionId);
assert.equal(raw.nexoMemory.nexo.attempts[0].status, "completed");

const restartedState = await loadState(statePath);
const restarted = applyState(restartedState);
const reconstructed = reconstructNexoMission(restarted.nexoMemory, mission.missionId);
assert.equal(restarted.day, 7);
assert.equal(restarted.hour, 12);
assert.equal(restarted.events[0].id, "restart-event");
assert.equal(reconstructed.steps[0].status, "completed");
assert.equal(reconstructed.status, "awaiting_verification");

const staleSimulation = applyState(restartedState);
staleSimulation.hour = 13;
await persistState(statePath, staleSimulation, 1234567891, { expectedRevision: 0, stateRevision: 1 });
const freshSimulation = applyState(await loadState(statePath));
freshSimulation.hour = 14;
await persistState(statePath, freshSimulation, 1234567892, { expectedRevision: 1, stateRevision: 2 });
await assert.rejects(
  () => persistState(statePath, staleSimulation, 1234567893, { expectedRevision: 1, stateRevision: 2 }),
  error => error?.code === "STATE_REVISION_CONFLICT"
);
const finalState = await loadState(statePath);
assert.equal(finalState.stateRevision, 2);
assert.equal(finalState.hour, 14);

const raceDir = await fs.mkdtemp(path.join(os.tmpdir(), "lumina-nexo-race-"));
const racePath = pathToFileURL(path.join(raceDir, "world-state.json"));
const baseSimulation = applyState({
  version: 5,
  stateRevision: 0,
  savedAt: Date.now(),
  day: 1,
  hour: 8,
  world: structuredClone(defaultWorld),
  agents: createInitialAgents(),
  events: [],
  nexoMemory: null
});
await persistState(racePath, baseSimulation, 1000, { stateRevision: 0 });

const writerA = applyState(await loadState(racePath));
const writerB = applyState(await loadState(racePath));
let writersReady = 0;
let release;
const barrier = new Promise(resolve => { release = resolve; });
const coordinatedLoad = async statePathArg => loadState(statePathArg);
const beforeWrite = async () => {
  writersReady += 1;
  if (writersReady === 1) await barrier;
  else if (writersReady === 2) release();
};
const [resultA, resultB] = await Promise.allSettled([
  persistState(racePath, writerA, 1001, { expectedRevision: 0, stateRevision: 1, loadCurrentState: coordinatedLoad, beforeWrite }),
  persistState(racePath, writerB, 1002, { expectedRevision: 0, stateRevision: 1, loadCurrentState: coordinatedLoad, beforeWrite })
]);
assert.equal(resultA.status, "fulfilled");
assert.equal(resultB.status, "fulfilled");
const raceFinal = await loadState(racePath);
assert.equal(raceFinal.stateRevision, 1);
assert.ok([1001, 1002].includes(raceFinal.savedAt));
await fs.rm(raceDir, { recursive: true, force: true });

await fs.rm(dir, { recursive: true, force: true });
console.log("Nexo: real file save -> restart -> reconstruct preserves mission memory and simulation state.");
