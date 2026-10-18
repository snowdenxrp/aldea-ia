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
import { prepareRepairAgainstPersistedState } from "../../scripts/nexo-repair-preparation.mjs";
import { dispatchPreparedRepair } from "../../scripts/nexo-repair-dispatch.mjs";
import { settlePreparedRepairFromPersistedState } from "../../scripts/nexo-repair-settlement.mjs";
import { verifyRepairMissionGoalFromPersistedState } from "../../scripts/nexo-repair-mission-verification.mjs";
import { createLuminaEffectAdapter } from "../../src/nexo/simulation-adapter.js";
import { observePersistedRepairInvariant, comparePersistedRepairRevision } from "../../src/nexo/adapters/persisted-repair-observation.mjs";

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
const preparedIntent = await prepareRepairAgainstPersistedState({
  owner: repairContinuity.owner,
  statePath: repairStatePath,
  expectedContinuityRevision: missionAdmission.storeRevision,
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
assert.equal(preparedIntent.environmentStateRevision, 0, "PREPARED revision must be derived from strict persisted state");
assert.equal(preparedIntent.environmentRevisionSource, "strict-persisted-world-state");

const repairedEffect = await dispatchPreparedRepair({
  statePath: repairStatePath,
  owner: repairContinuity.owner,
  idempotencyKey: "repair-crash-cut:step-1",
  savedAt: 2000
});
assert.equal(repairedEffect.status, "completed");
assert.equal(repairedEffect.persisted, true);
assert.equal(repairedEffect.environmentStateRevision, 1);
const durableRepairSnapshot = await loadStateStrict(repairStatePath);
assert.equal(durableRepairSnapshot.stateRevision, 1);
assert.equal(durableRepairSnapshot.agents[0].position.x, 0);
assert.equal(durableRepairSnapshot.agents[0].alive, true);

const staleDispatch = await dispatchPreparedRepair({
  statePath: repairStatePath,
  owner: repairContinuity.owner,
  idempotencyKey: "repair-crash-cut:step-1",
  savedAt: 3000
});
assert.equal(staleDispatch.status, "blocked");
assert.equal(staleDispatch.code, "NEXO_PREPARED_ENVIRONMENT_REVISION_STALE");
assert.equal(staleDispatch.persisted, false);
assert.equal((await loadStateStrict(repairStatePath)).stateRevision, 1);

const unpreparedDispatch = await dispatchPreparedRepair({
  statePath: repairStatePath,
  owner: repairContinuity.owner,
  idempotencyKey: "repair-crash-cut:not-prepared",
  savedAt: 4000
});
assert.equal(unpreparedDispatch.status, "blocked");
assert.equal(unpreparedDispatch.code, "NEXO_PREPARED_JOURNAL_ENTRY_UNKNOWN");
assert.equal((await loadStateStrict(repairStatePath)).stateRevision, 1);



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

const missingRepairRevision = await restartedRepairContinuity.owner.recordPrepared({
  expectedRevision: persistedRepairJournal.storeRevision,
  operation: {
    missionId: "repair-crash-cut",
    stepId: "step-1",
    action: "repair_agent_state",
    target: "alex",
    idempotencyKey: "repair-crash-cut:step-1"
  }
});
assert.equal(missingRepairRevision.status, "blocked");
assert.equal(missingRepairRevision.code, "NEXO_PREPARED_ENVIRONMENT_REVISION_REQUIRED");
assert.equal((await restartedRepairContinuity.owner.loadCurrent()).snapshot.effectJournal[0].status, "prepared");

const mismatchedRepairRevision = await restartedRepairContinuity.owner.recordPrepared({
  expectedRevision: persistedRepairJournal.storeRevision,
  operation: {
    missionId: "repair-crash-cut",
    stepId: "step-1",
    action: "repair_agent_state",
    target: "alex",
    idempotencyKey: "repair-crash-cut:step-1",
    environmentStateRevision: 1
  }
});
assert.equal(mismatchedRepairRevision.status, "blocked");
assert.equal(mismatchedRepairRevision.code, "NEXO_PREPARED_ENVIRONMENT_REVISION_MISMATCH");
assert.equal((await restartedRepairContinuity.owner.loadCurrent()).snapshot.effectJournal[0].environmentStateRevision, 0,
  "an existing PREPARED repair must never be rebound to a different environment revision");

const settledRepair = await settlePreparedRepairFromPersistedState({
  store: restartedRepairContinuity.store,
  statePath: repairStatePath,
  idempotencyKey: "repair-crash-cut:step-1",
  expectedContinuityRevision: persistedRepairJournal.storeRevision
});
assert.equal(settledRepair.status, "settled_observed");
assert.equal(settledRepair.verified, true);
assert.equal(settledRepair.causalAttribution, "not_claimed");
assert.equal(settledRepair.environmentStateRevision, 1);
const settledJournal = await restartedRepairContinuity.owner.loadCurrent();
assert.equal(settledJournal.snapshot.effectJournal[0].status, "settled_observed");
assert.equal(settledJournal.snapshot.effectJournal[0].settlement.causalAttribution, "not_claimed");

const reconstructedAfterObservedSettlement = await restartedRepairContinuity.owner.reconstructMission("repair-crash-cut");
assert.equal(reconstructedAfterObservedSettlement.status, "reconstructed");
assert.equal(reconstructedAfterObservedSettlement.mission.status, "blocked");
assert.equal(reconstructedAfterObservedSettlement.mission.objective, "verify_observed_repair_goal");
assert.equal(reconstructedAfterObservedSettlement.mission.steps[0].status, "blocked");
assert.equal(reconstructedAfterObservedSettlement.mission.steps[0].blockReason.code, "NEXO_REPAIR_SETTLED_BY_OBSERVATION");

const observedMissionGoal = await verifyRepairMissionGoalFromPersistedState({
  store: restartedRepairContinuity.store,
  statePath: repairStatePath,
  missionId: "repair-crash-cut"
});
assert.equal(observedMissionGoal.status, "goal_observed");
assert.equal(observedMissionGoal.verified, true);
assert.equal(observedMissionGoal.missionCompleted, false);
assert.equal(observedMissionGoal.causalAttribution, "not_claimed");
assert.equal(observedMissionGoal.stepObservations.length, 1);

const cyclicMissionSnapshot = structuredClone(settledJournal.snapshot);
cyclicMissionSnapshot.missions[0].steps = [
  { id: "cycle-a", action: "repair_agent_state", target: "alex", status: "blocked", dependsOn: ["cycle-b"] },
  { id: "cycle-b", action: "repair_agent_needs", target: "alex", status: "blocked", dependsOn: ["cycle-a"] }
];
const cyclicMissionGoal = await verifyRepairMissionGoalFromPersistedState({
  store: { loadCurrent: async () => ({ storeRevision: settledJournal.storeRevision, snapshot: cyclicMissionSnapshot }) },
  statePath: repairStatePath,
  missionId: "repair-crash-cut"
});
assert.equal(cyclicMissionGoal.status, "unknown");
assert.equal(cyclicMissionGoal.code, "NEXO_REPAIR_MISSION_DEPENDENCY_CYCLE");

const duplicateStepSnapshot = structuredClone(settledJournal.snapshot);
duplicateStepSnapshot.missions[0].steps = [
  { id: "step-1", action: "repair_agent_state", target: "alex", status: "blocked", dependsOn: [] },
  { id: "step-1", action: "repair_agent_state", target: "alex", status: "blocked", dependsOn: [] }
];
const duplicateStepGoal = await verifyRepairMissionGoalFromPersistedState({
  store: { loadCurrent: async () => ({ storeRevision: settledJournal.storeRevision, snapshot: duplicateStepSnapshot }) },
  statePath: repairStatePath,
  missionId: "repair-crash-cut"
});
assert.equal(duplicateStepGoal.status, "unknown");
assert.equal(duplicateStepGoal.code, "NEXO_REPAIR_MISSION_STEP_OR_DEPENDENCY_UNSUPPORTED",
  "duplicate step IDs must not let one journal entry satisfy multiple mission steps");

const extraJournalSnapshot = structuredClone(settledJournal.snapshot);
extraJournalSnapshot.effectJournal.push({
  idempotencyKey: "repair-crash-cut:ghost",
  missionId: "repair-crash-cut",
  stepId: "ghost",
  action: "repair_agent_state",
  target: "alex",
  status: "settled_observed",
  settlement: {
    causalAttribution: "not_claimed",
    environmentStateRevision: 1
  }
});
const extraJournalGoal = await verifyRepairMissionGoalFromPersistedState({
  store: { loadCurrent: async () => ({ storeRevision: settledJournal.storeRevision, snapshot: extraJournalSnapshot }) },
  statePath: repairStatePath,
  missionId: "repair-crash-cut"
});
assert.equal(extraJournalGoal.status, "unknown");
assert.equal(extraJournalGoal.code, "NEXO_REPAIR_MISSION_JOURNAL_COVERAGE_MISMATCH",
  "journal entries outside the mission step set must not be ignored");





const staleSettlement = await settlePreparedRepairFromPersistedState({
  store: restartedRepairContinuity.store,
  statePath: repairStatePath,
  idempotencyKey: "repair-crash-cut:step-1",
  expectedContinuityRevision: persistedRepairJournal.storeRevision
});
assert.equal(staleSettlement.status, "conflict");
assert.equal(staleSettlement.code, "NEXO_CONTINUITY_STORE_REVISION_CONFLICT");

const revisionOneSnapshot = await loadStateStrict(repairStatePath);
const malformedForNegativeTest = applyState(revisionOneSnapshot);
malformedForNegativeTest.agents[0].position.x = "not-normalized";
await persistState(repairStatePath, malformedForNegativeTest, 5000, {
  expectedRevision: 1,
  stateRevision: 2
});

const negativeMission = await restartedRepairContinuity.owner.recordMission({
  expectedRevision: settledJournal.storeRevision,
  mission: {
    missionId: "repair-negative-settlement",
    status: "planned",
    objective: "normalize_agent_state",
    steps: [{ id: "step-negative", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] }]
  }
});
assert.equal(negativeMission.status, "committed");
const negativePrepared = await prepareRepairAgainstPersistedState({
  owner: restartedRepairContinuity.owner,
  statePath: repairStatePath,
  expectedContinuityRevision: negativeMission.storeRevision,
  operation: {
    missionId: "repair-negative-settlement",
    stepId: "step-negative",
    action: "repair_agent_state",
    target: "alex",
    idempotencyKey: "repair-negative-settlement:step-negative"
  }
});
assert.equal(negativePrepared.status, "committed");
const absentInvariantSettlement = await settlePreparedRepairFromPersistedState({
  store: restartedRepairContinuity.store,
  statePath: repairStatePath,
  idempotencyKey: "repair-negative-settlement:step-negative",
  expectedContinuityRevision: negativePrepared.storeRevision
});
assert.equal(absentInvariantSettlement.status, "blocked");
assert.equal(absentInvariantSettlement.code, "NEXO_REPAIR_SETTLEMENT_INVARIANT_NOT_PROVEN");
assert.equal((await restartedRepairContinuity.owner.loadCurrent()).snapshot.effectJournal.find(
  entry => entry.idempotencyKey === "repair-negative-settlement:step-negative"
).status, "prepared");

const revisionTwoSnapshot = await loadStateStrict(repairStatePath);
const laterSnapshot = applyState(revisionTwoSnapshot);
await persistState(repairStatePath, laterSnapshot, 6000, {
  expectedRevision: 2,
  stateRevision: 4
});
const unrelatedRevisionSettlement = await settlePreparedRepairFromPersistedState({
  store: restartedRepairContinuity.store,
  statePath: repairStatePath,
  idempotencyKey: "repair-negative-settlement:step-negative",
  expectedContinuityRevision: negativePrepared.storeRevision
});
assert.equal(unrelatedRevisionSettlement.status, "blocked");
assert.equal(unrelatedRevisionSettlement.code, "NEXO_REPAIR_SETTLEMENT_ENVIRONMENT_REVISION_UNRELATED");
assert.equal((await restartedRepairContinuity.owner.loadCurrent()).snapshot.effectJournal.find(
  entry => entry.idempotencyKey === "repair-negative-settlement:step-negative"
).status, "prepared");

const currentNegativeEnvironment = await loadStateStrict(repairStatePath);
const normalizedForCommitAmbiguity = applyState(currentNegativeEnvironment);
normalizedForCommitAmbiguity.agents[0].position = { x: 0, z: 4 };
await persistState(repairStatePath, normalizedForCommitAmbiguity, 7000, {
  expectedRevision: 4,
  stateRevision: 5
});

const beforeAmbiguousMission = await restartedRepairContinuity.owner.loadCurrent();
const ambiguousMission = await restartedRepairContinuity.owner.recordMission({
  expectedRevision: beforeAmbiguousMission.storeRevision,
  mission: {
    missionId: "repair-ambiguous-settlement",
    status: "planned",
    objective: "normalize_agent_state",
    steps: [{ id: "step-ambiguous", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] }]
  }
});
assert.equal(ambiguousMission.status, "committed");
const ambiguousPrepared = await prepareRepairAgainstPersistedState({
  owner: restartedRepairContinuity.owner,
  statePath: repairStatePath,
  expectedContinuityRevision: ambiguousMission.storeRevision,
  operation: {
    missionId: "repair-ambiguous-settlement",
    stepId: "step-ambiguous",
    action: "repair_agent_state",
    target: "alex",
    idempotencyKey: "repair-ambiguous-settlement:step-ambiguous"
  }
});
assert.equal(ambiguousPrepared.status, "committed");
const ambiguousStore = {
  loadCurrent: () => restartedRepairContinuity.store.loadCurrent(),
  commitIfCurrent: async () => ({
    status: "unknown",
    code: "NEXO_CONTINUITY_STORE_COMMIT_OUTCOME_UNKNOWN"
  })
};
const ambiguousSettlement = await settlePreparedRepairFromPersistedState({
  store: ambiguousStore,
  statePath: repairStatePath,
  idempotencyKey: "repair-ambiguous-settlement:step-ambiguous",
  expectedContinuityRevision: ambiguousPrepared.storeRevision
});
assert.equal(ambiguousSettlement.status, "unknown");
assert.equal(ambiguousSettlement.verified, false);
assert.equal(ambiguousSettlement.code, "NEXO_CONTINUITY_STORE_COMMIT_OUTCOME_UNKNOWN");
assert.equal((await restartedRepairContinuity.owner.loadCurrent()).snapshot.effectJournal.find(
  entry => entry.idempotencyKey === "repair-ambiguous-settlement:step-ambiguous"
).status, "prepared");







await fs.rm(repairDir, { recursive: true, force: true });


/*
 * Read-only repair observation contract: classify durable desired state without
 * settling PREPARED, authorizing redispatch, or mutating the supplied snapshot.
 */
const observationSnapshot = {
  version: 5,
  stateRevision: 7,
  world: { resources: { wood: { amount: -2 }, water: { amount: 0 } } },
  agents: [
    { id: "normalized", alive: true, position: { x: 1, z: 2 }, needs: { hunger: 100, thirst: 0, energy: 50, social: 50, safety: 50, health: 100 } },
    { id: "needs-repair", alive: true, position: { x: 1, z: 2 }, needs: { hunger: 120, thirst: 0, energy: 50, social: 50, safety: 50, health: 100 } },
    { id: "unknown-life", position: { x: 1, z: 2 }, needs: {} }
  ]
};
const observationSnapshotBefore = structuredClone(observationSnapshot);
assert.deepEqual(
  observePersistedRepairInvariant({ snapshot: observationSnapshot, action: "repair_agent_state", target: "normalized" }),
  {
    status: "observed",
    outcome: "desired_state_present",
    reason: "repair_invariant_holds_in_persisted_snapshot",
    evidence: {
      kind: "persisted-repair-invariant-observation",
      source: "world-state.json",
      action: "repair_agent_state",
      target: "normalized",
      stateRevision: 7
    }
  }
);
assert.equal(
  observePersistedRepairInvariant({ snapshot: observationSnapshot, action: "repair_agent_needs", target: "needs-repair" }).outcome,
  "desired_state_absent"
);
assert.equal(
  observePersistedRepairInvariant({ snapshot: observationSnapshot, action: "repair_resource_state", target: "wood" }).outcome,
  "desired_state_absent"
);
assert.equal(
  observePersistedRepairInvariant({ snapshot: observationSnapshot, action: "repair_agent_state", target: "unknown-life" }).reason,
  "REPAIR_AGENT_ALIVE_STATE_UNKNOWN"
);
assert.equal(
  observePersistedRepairInvariant({ snapshot: observationSnapshot, action: "repair_resource_state", target: "missing" }).outcome,
  "unknown"
);

assert.deepEqual(
  comparePersistedRepairRevision({ expectedStateRevision: 7, currentSnapshot: observationSnapshot }),
  { status: "observed", outcome: "current", reason: "PERSISTED_ENVIRONMENT_REVISION_MATCHES", expectedStateRevision: 7, currentStateRevision: 7 }
);
assert.deepEqual(
  comparePersistedRepairRevision({ expectedStateRevision: 6, currentSnapshot: observationSnapshot }),
  { status: "observed", outcome: "stale", reason: "PERSISTED_ENVIRONMENT_REVISION_CHANGED", expectedStateRevision: 6, currentStateRevision: 7 }
);
assert.deepEqual(
  comparePersistedRepairRevision({ currentSnapshot: observationSnapshot }),
  { status: "observed", outcome: "unknown", reason: "PREPARED_ENVIRONMENT_REVISION_NOT_BOUND", expectedStateRevision: null, currentStateRevision: 7 }
);
assert.deepEqual(
  comparePersistedRepairRevision({ expectedStateRevision: 7, currentSnapshot: { ...observationSnapshot, stateRevision: NaN } }),
  { status: "observed", outcome: "unknown", reason: "PERSISTED_ENVIRONMENT_REVISION_UNKNOWN", expectedStateRevision: 7, currentStateRevision: null }
);

assert.equal(
  observePersistedRepairInvariant({
    snapshot: { ...observationSnapshot, agents: [...observationSnapshot.agents, structuredClone(observationSnapshot.agents[0])] },
    action: "repair_agent_state",
    target: "normalized"
  }).reason,
  "REPAIR_TARGET_AGENT_AMBIGUOUS"
);
assert.equal(
  observePersistedRepairInvariant({
    snapshot: { ...observationSnapshot, world: { resources: {} } },
    action: "repair_resource_state",
    target: "toString"
  }).reason,
  "REPAIR_TARGET_RESOURCE_UNKNOWN"
);
assert.deepEqual(observationSnapshot, observationSnapshotBefore, "repair observation must not mutate persisted state");
assert.equal(
  observePersistedRepairInvariant({ snapshot: { ...observationSnapshot, stateRevision: -1 }, action: "repair_agent_state", target: "normalized" }).outcome,
  "unknown"
);

await fs.rm(dir, { recursive: true, force: true });
console.log("Nexo: real file save -> restart -> reconstruct preserves mission memory and simulation state; repair crash-cut remains explicitly unsettled; read-only repair observations are non-mutating.");


