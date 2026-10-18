import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { world as defaultWorld } from "../../src/world.js";
import { createInitialAgents } from "../../src/agents.js";
import { persistState, loadState, loadStateStrict, applyState } from "../../scripts/simulate.mjs";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import { createLuminaEffectAdapter } from "../../src/nexo/simulation-adapter.js";

const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lumina-nexo-restart-"));
const statePath = pathToFileURL(path.join(dir, "world-state.json"));

await assert.rejects(
  () => loadStateStrict(statePath),
  error => error?.code === "NEXO_STATE_NOT_FOUND"
);
await fs.writeFile(statePath, "{invalid-json", "utf8");
await assert.rejects(
  () => loadStateStrict(statePath),
  error => error?.code === "NEXO_STATE_INVALID_JSON"
);
await fs.writeFile(statePath, JSON.stringify({
  version: 5, day: 1, hour: 8, world: structuredClone(defaultWorld), agents: createInitialAgents()
}), "utf8");
await assert.rejects(
  () => loadStateStrict(statePath),
  error => error?.code === "NEXO_STATE_REVISION_UNKNOWN"
);
await fs.writeFile(statePath, JSON.stringify({ version: 5, stateRevision: 0, world: [], agents: [] }), "utf8");
await assert.rejects(
  () => loadStateStrict(statePath),
  error => error?.code === "NEXO_STATE_SCHEMA_INVALID"
);

const malformedLegacyPath = path.join(dir, "malformed-nexo-continuity.json");
await assert.rejects(
  () => openNexoContinuityOwner({
    filePath: malformedLegacyPath,
    legacyMemory: { version: 4, nexo: { missions: [] } }
  }),
  error => error?.code === "NEXO_MEMORY_SCHEMA_UNKNOWN",
  "legacy Nexo data must be validated by Nexo migration, not by Lúmina's state loader"
);

const orphanLegacyPath = path.join(dir, "orphan-nexo-continuity.json");
await assert.rejects(
  () => openNexoContinuityOwner({
    filePath: orphanLegacyPath,
    legacyMemory: {
      version: 4, runs: [], lessons: [], patterns: [],
      nexo: {
        missions: [], attempts: [], doNotRepeat: [], executions: [],
        effectJournal: [{ idempotencyKey: "orphan:step-1", missionId: "orphan", stepId: "step-1", action: "repair_agent_state", target: "alex", status: "prepared" }]
      }
    }
  }),
  error => error?.code === "NEXO_RECOVERY_CONTEXT_MISSING",
  "migration must preserve the fail-closed prepared-context rule"
);

await fs.rm(statePath);

const simulation = applyState({
  version: 5,
  savedAt: Date.now(),
  day: 7,
  hour: 12,
  world: structuredClone(defaultWorld),
  agents: createInitialAgents(),
  events: [{ id: "restart-event", type: "checkpoint", description: "before restart", participants: [] }]
});
await persistState(statePath, simulation, 1234567890);

const strictLoadedState = await loadStateStrict(statePath);
assert.equal(strictLoadedState.stateRevision, 0);
assert.equal(strictLoadedState.version, 5);

const raw = JSON.parse(await fs.readFile(statePath, "utf8"));
assert.equal(raw.version, 5);
assert.equal(raw.stateRevision, 0);
assert.equal("nexoMemory" in raw, false, "Lúmina's canonical state file must not serialize Nexo operational continuity");

const restartedState = await loadState(statePath);
const restarted = applyState(restartedState);
assert.equal(restarted.day, 7);
assert.equal(restarted.hour, 12);
assert.equal(restarted.events[0].id, "restart-event");
assert.equal("nexoMemory" in restarted, false, "Lúmina simulation must not own Nexo operational memory");

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
    const child = spawn(process.execPath, [workerScript, racePath.pathname, String(savedAt), raceDir], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = ""; let stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.once("exit", code => code === 0 ? resolve(JSON.parse(stdout)) : reject(new Error(stderr || `worker exited ${code}`)));
    child.once("error", reject);
  });
}
const workerPromises = [runWorker(1001), runWorker(1002)];
const readyFiles = [path.join(raceDir, "ready-1001"), path.join(raceDir, "ready-1002")];
let bothWorkersReady = false;
for (let attempt = 0; attempt < 1000; attempt += 1) {
  try {
    await Promise.all(readyFiles.map(file => fs.access(file)));
    bothWorkersReady = true;
    break;
  } catch {
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}
assert.equal(bothWorkersReady, true, "both workers must load the same starting revision before competing");
await fs.writeFile(path.join(raceDir, "release"), "go", "utf8");
const [workerA, workerB] = await Promise.all(workerPromises);
assert.equal([workerA.status, workerB.status].filter(status => status === "committed").length, 1);
assert.equal([workerA.status, workerB.status].filter(status => status === "conflict").length, 1);
const raceFinal = await loadState(racePath);
assert.equal(raceFinal.stateRevision, 1);
assert.ok([1001, 1002].includes(raceFinal.savedAt));
await fs.rm(raceDir, { recursive: true, force: true });

const failureDir = await fs.mkdtemp(path.join(os.tmpdir(), "lumina-nexo-write-failure-"));
const failurePath = pathToFileURL(path.join(failureDir, "world-state.json"));
const failureBase = applyState({
  version: 5, stateRevision: 0, savedAt: 1000, day: 1, hour: 8,
  world: structuredClone(defaultWorld), agents: createInitialAgents(), events: [], nexoMemory: null
});
await persistState(failurePath, failureBase, 1000, { stateRevision: 0 });
const originalFailureState = await loadState(failurePath);

const writeFailureFs = {
  writeFile: async () => { const error = new Error("INJECTED_WRITE_FAILURE"); error.code = "INJECTED_WRITE_FAILURE"; throw error; },
  rename: fs.rename
};
await assert.rejects(
  () => persistState(failurePath, failureBase, 2000, { expectedRevision: 0, stateRevision: 1, fsModule: writeFailureFs }),
  error => error?.code === "INJECTED_WRITE_FAILURE"
);
const afterWriteFailure = await loadState(failurePath);
assert.equal(afterWriteFailure.stateRevision, originalFailureState.stateRevision);
assert.equal(afterWriteFailure.savedAt, originalFailureState.savedAt);

const renameFailureFs = {
  writeFile: fs.writeFile,
  rename: async () => { const error = new Error("INJECTED_RENAME_FAILURE"); error.code = "INJECTED_RENAME_FAILURE"; throw error; }
};
await assert.rejects(
  () => persistState(failurePath, failureBase, 3000, { expectedRevision: 0, stateRevision: 1, fsModule: renameFailureFs }),
  error => error?.code === "INJECTED_RENAME_FAILURE"
);
const afterRenameFailure = await loadState(failurePath);
assert.equal(afterRenameFailure.stateRevision, originalFailureState.stateRevision);
assert.equal(afterRenameFailure.savedAt, originalFailureState.savedAt);
const tempFiles = (await fs.readdir(failureDir)).filter(name => name.includes(".tmp-"));
assert.equal(tempFiles.length, 0);
await fs.rm(failureDir, { recursive: true, force: true });

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


/*
 * Crash cut: a convergent repair reaches the authoritative Lúmina snapshot,
 * but Nexo has not settled the separate PREPARED journal entry. The invariant
 * is durable after restart; that alone must not silently rewrite Nexo history.
 */
const repairDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-repair-crash-cut-"));
const repairStatePath = pathToFileURL(path.join(repairDir, "world-state.json"));
const repairContinuityPath = path.join(repairDir, ".nexo-continuity.json");
const repairSimulation = applyState({
  version: 5,
  stateRevision: 0,
  savedAt: 1000,
  day: 1,
  hour: 8,
  world: structuredClone(defaultWorld),
  agents: [{
    id: "alex",
    alive: true,
    position: { x: "not-a-number", z: 4 },
    needs: { hunger: 50, thirst: 50, energy: 50, social: 50, safety: 50, health: 100 },
    inventory: [],
    skills: []
  }],
  events: []
});
await persistState(repairStatePath, repairSimulation, 1000, { stateRevision: 0 });

const repairContinuity = await openNexoContinuityOwner({
  filePath: repairContinuityPath,
  allowEmptyInitialization: true
});
const missionAdmission = await repairContinuity.owner.recordMission({
  expectedRevision: 0,
  mission: {
    missionId: "repair-crash-cut",
    status: "planned",
    objective: "normalize_agent_state",
    steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] }]
  }
});
assert.equal(missionAdmission.status, "committed");
const preparedIntent = await repairContinuity.owner.recordPrepared({
  expectedRevision: missionAdmission.storeRevision,
  operation: {
    missionId: "repair-crash-cut",
    stepId: "step-1",
    action: "repair_agent_state",
    target: "alex",
    idempotencyKey: "repair-crash-cut:step-1",
    at: "2026-10-18T00:00:00.000Z"
  }
});
assert.equal(preparedIntent.status, "committed");
assert.equal(preparedIntent.preparedCommitted, true);

const repairAdapter = createLuminaEffectAdapter(repairSimulation);
const repairedEffect = await repairAdapter.execute({
  missionId: "repair-crash-cut",
  stepId: "step-1",
  action: "repair_agent_state",
  target: "alex",
  idempotencyKey: "repair-crash-cut:step-1",
  precondition: ({ stateVersion }) => stateVersion === 0,
  postcondition: ({ effectResult }) =>
    effectResult?.status === "completed" &&
    repairSimulation.agents[0].alive === true &&
    Number.isFinite(repairSimulation.agents[0].position.x) &&
    Number.isFinite(repairSimulation.agents[0].position.z)
});
assert.equal(repairedEffect.status, "completed");
assert.equal(repairSimulation.agents[0].position.x, 0);

await persistState(repairStatePath, repairSimulation, 2000, {
  expectedRevision: 0,
  stateRevision: 1
});
const durableRepairSnapshot = await loadStateStrict(repairStatePath);
assert.equal(durableRepairSnapshot.stateRevision, 1);
assert.equal(durableRepairSnapshot.agents[0].position.x, 0);
assert.equal(durableRepairSnapshot.agents[0].alive, true);

// Simulate process restart by reopening the separate Nexo continuity owner.
const restartedRepairContinuity = await openNexoContinuityOwner({
  filePath: repairContinuityPath
});
const unresolvedRepair = await restartedRepairContinuity.owner.reconcilePrepared({
  idempotencyKey: "repair-crash-cut:step-1"
});
assert.equal(unresolvedRepair.status, "blocked");
assert.equal(unresolvedRepair.code, "NEXO_EFFECT_RECONCILIATION_REQUIRED");
assert.equal(unresolvedRepair.verified, false);
const persistedRepairJournal = await restartedRepairContinuity.owner.loadCurrent();
assert.equal(persistedRepairJournal.snapshot.effectJournal[0].status, "prepared",
  "durable desired state must not be silently treated as owner settlement");
await fs.rm(repairDir, { recursive: true, force: true });

await fs.rm(dir, { recursive: true, force: true });
console.log("Nexo: real file save -> restart -> reconstruct preserves mission memory and simulation state; repair crash-cut remains explicitly unsettled.");

