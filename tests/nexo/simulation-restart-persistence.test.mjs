import assert from "node:assert/strict";
import { spawn } from "node:child_process";
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

const workerScript = path.join(path.dirname(new URL(import.meta.url).pathname), "persistence-lock-worker.mjs");
function runWorker(savedAt) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [workerScript, racePath.pathname, String(savedAt)], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = ""; let stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.once("exit", code => code === 0 ? resolve(JSON.parse(stdout)) : reject(new Error(stderr || `worker exited ${code}`)));
    child.once("error", reject);
  });
}
const [workerA, workerB] = await Promise.all([runWorker(1001), runWorker(1002)]);
assert.equal([workerA.status, workerB.status].filter(status => status === "committed").length, 1);
assert.equal([workerA.status, workerB.status].filter(status => status === "conflict").length, 1);
const raceFinal = await loadState(racePath);
assert.equal(raceFinal.stateRevision, 1);
assert.ok([1001, 1002].includes(raceFinal.savedAt));
await fs.rm(raceDir, { recursive: true, force: true });

const crashDir = await fs.mkdtemp(path.join(os.tmpdir(), "lumina-nexo-lock-crash-"));
const crashStatePath = path.join(crashDir, "world-state.json");
await fs.writeFile(crashStatePath, JSON.stringify({
  version: 5, stateRevision: 0, savedAt: 1000, day: 1, hour: 8,
  world: structuredClone(defaultWorld), agents: createInitialAgents(), events: [], nexoMemory: null
}));
const lockPath = `${crashStatePath}.lock`;
const childScript = `
  import fs from "node:fs/promises";
  import path from "node:path";
  const lock = process.argv[1];
  await fs.mkdir(lock);
  await fs.writeFile(path.join(lock, "owner.json"), JSON.stringify({pid:process.pid,token:"crash-test",createdAt:Date.now()}));
  process.kill(process.pid, "SIGKILL");
`;
await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ["--input-type=module", "-e", childScript, lockPath], { stdio: "ignore" });
  child.once("exit", () => resolve());
  child.once("error", reject);
});
const lockStat = await fs.stat(lockPath);
await fs.utimes(lockPath, new Date(lockStat.mtimeMs - 61_000), new Date(lockStat.mtimeMs - 61_000));
const recovered = applyState(await loadState(pathToFileURL(crashStatePath)));
await persistState(pathToFileURL(crashStatePath), recovered, 2000, { expectedRevision: 0, stateRevision: 1 });
assert.equal((await loadState(pathToFileURL(crashStatePath))).stateRevision, 1);
await fs.rm(crashDir, { recursive: true, force: true });

await fs.rm(dir, { recursive: true, force: true });
console.log("Nexo: real file save -> restart -> reconstruct preserves mission memory and simulation state.");
