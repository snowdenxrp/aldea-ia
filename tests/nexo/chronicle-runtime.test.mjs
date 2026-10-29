import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import { createNexoContinuityOwner } from "../../src/nexo/core/continuity-owner.mjs";
import { createNexoContinuityStore } from "../../src/nexo/core/continuity-store.mjs";
import { createNexoChronicleStore } from "../../src/nexo/core/chronicle-store.mjs";
import { createNexoChronicleEffectContracts } from "../../src/nexo/adapters/chronicle-effect.mjs";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";
import { runNexoChronicleAppend } from "../../src/nexo/application/index.mjs";
import { loadNexoContinuityStatus, loadNexoMissionStatus, loadNexoMissionPlan } from "../../src/nexo/application/continuity-queries.mjs";
import { publicChronicleResult, recordNexoMissionSafely } from "../../src/nexo/application/chronicle-append.mjs";
import { parseNexoChronicleArguments } from "../../scripts/nexo-chronicle-session.mjs";
import { NEXO_RESOURCE_LIMITS } from "../../src/nexo/core/resource-limits.mjs";
import { executeNexoStepWithContinuityOwner } from "../../src/nexo/runtime.js";
import { reconstructNexoMissionFromSnapshot } from "../../src/nexo/core/continuity-operations.mjs";

const publicAdmissionUnknown = publicChronicleResult({
  status: "unknown",
  code: "NEXO_TEST_MISSION_ADMISSION_UNKNOWN",
  missionAdmissionCommitted: "UNKNOWN",
  dispatchAttempted: false,
  redispatchAuthorized: false,
  target: { content: "PRIVATE_PUBLIC_RESULT_PAYLOAD" },
  adapterResult: { secret: "PRIVATE_INTERNAL_RESULT" }
}, "public-unknown-mission", "step-unknown");
assert.equal(publicAdmissionUnknown.status, "unknown");
assert.equal(publicAdmissionUnknown.authorization, "NOT_EVALUATED",
  "public results must not hide that owner authority was not evaluated");
assert.equal(publicAdmissionUnknown.missionId, "public-unknown-mission");
assert.equal(publicAdmissionUnknown.stepId, "step-unknown");
assert.equal(publicAdmissionUnknown.missionAdmissionCommitted, "UNKNOWN");
assert.equal(publicAdmissionUnknown.dispatchAttempted, false);
assert.equal(publicAdmissionUnknown.redispatchAuthorized, false);
assert.equal(Object.hasOwn(publicAdmissionUnknown, "target"), false);
assert.equal(Object.hasOwn(publicAdmissionUnknown, "adapterResult"), false);
assert.equal(JSON.stringify(publicAdmissionUnknown).includes("PRIVATE_PUBLIC_RESULT_PAYLOAD"), false);
assert.equal(JSON.stringify(publicAdmissionUnknown).includes("PRIVATE_INTERNAL_RESULT"), false);

const malformedPublicResult = publicChronicleResult({
  status: { nested: "PRIVATE_STATUS" },
  code: { nested: "PRIVATE_CODE" },
  dispatchAttempted: "true",
  redispatchAuthorized: true,
  preparedCommitted: { nested: "PRIVATE_COMMIT_STATE" },
  lineageCommitted: "UNKNOWN",
  journalSettled: false,
  terminalOutcomeRecorded: 7,
  missionAdmissionCommitted: "UNKNOWN",
  storeRevision: "9",
  target: { content: "PRIVATE_TARGET" }
}, "safe-mission", "safe-step");
assert.equal(malformedPublicResult.status, "unknown");
assert.equal(malformedPublicResult.authorization, "NOT_EVALUATED");
assert.equal(malformedPublicResult.code, undefined);
assert.equal(malformedPublicResult.dispatchAttempted, false);
assert.equal(malformedPublicResult.redispatchAuthorized, false);
assert.equal(malformedPublicResult.preparedCommitted, undefined);
assert.equal(malformedPublicResult.lineageCommitted, "UNKNOWN");
assert.equal(malformedPublicResult.journalSettled, false);
assert.equal(malformedPublicResult.terminalOutcomeRecorded, undefined);
assert.equal(malformedPublicResult.missionAdmissionCommitted, "UNKNOWN");
assert.equal(malformedPublicResult.storeRevision, undefined);
assert.equal(JSON.stringify(malformedPublicResult).includes("PRIVATE"), false);

const publicPreparedTimeout = publicChronicleResult({
  status: "blocked",
  code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT",
  dispatchAttempted: false,
  redispatchAuthorized: false,
  prepared: {
    status: "failed",
    code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT",
    phase: "lock_acquisition",
    writeStarted: false,
    lockRelease: { status: "failed", code: "EACCES" }
  }
}, "public-timeout-mission", "step-1");
assert.equal(publicPreparedTimeout.code, "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT");
assert.equal(publicPreparedTimeout.phase, "lock_acquisition");
assert.equal(publicPreparedTimeout.writeStarted, false);
assert.deepEqual(publicPreparedTimeout.lockRelease, { status: "failed", code: "EACCES" });
assert.equal(publicPreparedTimeout.dispatchAttempted, false);
assert.equal(publicPreparedTimeout.redispatchAuthorized, false);

const publicPostDispatchTimeout = publicChronicleResult({
  status: "unknown",
  code: "NEXO_EXECUTION_LINEAGE_COMMIT_NOT_CONFIRMED",
  dispatchAttempted: true,
  redispatchAuthorized: false,
  adapterResult: {
    status: "blocked",
    code: "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT",
    phase: "lock_acquisition",
    writeStarted: false
  }
}, "public-timeout-after-dispatch", "step-1");
assert.equal(publicPostDispatchTimeout.lockAcquisitionCode, "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT");
assert.equal(publicPostDispatchTimeout.phase, "lock_acquisition");
assert.equal(publicPostDispatchTimeout.writeStarted, false);
assert.equal(publicPostDispatchTimeout.dispatchAttempted, true);
assert.equal(publicPostDispatchTimeout.redispatchAuthorized, false);

const timeoutHandlerContracts = createNexoChronicleEffectContracts({
  store: {
    loadCurrent: async () => ({ status: "loaded", storeRevision: 0, entries: [] }),
    append: async () => ({
      status: "blocked",
      code: "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT",
      phase: "lock_acquisition",
      writeStarted: false,
      lockRelease: { status: "failed", code: "EACCES" }
    })
  }
});
const timeoutHandlerResult = await timeoutHandlerContracts.handlers.chronicle_append({
  missionId: "timeout-mission",
  stepId: "step-1",
  action: "chronicle_append",
  target: { content: "must not be written" }
});
assert.equal(timeoutHandlerResult.status, "blocked");
assert.equal(timeoutHandlerResult.code, "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT");
assert.equal(timeoutHandlerResult.phase, "lock_acquisition");
assert.equal(timeoutHandlerResult.writeStarted, false);
assert.deepEqual(timeoutHandlerResult.lockRelease, { status: "failed", code: "EACCES" });

const invalidApplicationInput = await runNexoChronicleAppend({
  continuityPath: "", chroniclePath: "/unused/chronicle.json",
  missionId: "invalid-mission", stepId: "step-1", content: "payload",
  initializeContinuity: true, initializeChronicle: true
});
assert.equal(invalidApplicationInput.status, "blocked");
assert.equal(invalidApplicationInput.code, "NEXO_CHRONICLE_SESSION_INPUT_INVALID");
assert.equal(invalidApplicationInput.authorization, "NOT_EVALUATED",
  "early public rejection must preserve the unevaluated authority state");
assert.equal(invalidApplicationInput.dispatchAttempted, false);
assert.equal(invalidApplicationInput.redispatchAuthorized, false);
const invalidInitializationType = await runNexoChronicleAppend({
  continuityPath: "/unused/continuity.json", chroniclePath: "/unused/chronicle.json",
  missionId: "invalid-mission", stepId: "step-1", content: "payload",
  initializeContinuity: "true", initializeChronicle: true
});
assert.equal(invalidInitializationType.status, "blocked");
assert.equal(invalidInitializationType.code, "NEXO_CHRONICLE_SESSION_INPUT_INVALID");

// Application-boundary timeout from Chronicle initialization preserves phase evidence.
const appChronicleTimeoutRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-app-chronicle-timeout-"));
try {
  const continuityPath = path.join(appChronicleTimeoutRoot, "continuity.json");
  const chroniclePath = path.join(appChronicleTimeoutRoot, "chronicle.json");
  const snapshot = {
    schema: "NEXO_OPERATIONAL_CONTINUITY", schemaVersion: 1,
    missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: []
  };
  assert.equal((await createNexoContinuityStore({ filePath: continuityPath }).initialize(snapshot)).status, "committed");
  const chronicleLock = chroniclePath + ".lock";
  await fs.mkdir(chronicleLock);
  await fs.writeFile(path.join(chronicleLock, "owner.json"), JSON.stringify({
    pid: process.pid, token: "application-timeout-owner"
  }), "utf8");
  const result = await runNexoChronicleAppend({
    continuityPath, chroniclePath, missionId: "app-timeout", stepId: "step-1",
    content: "must not initialize", initializeChronicle: true, lockWaitMs: 20
  });
  assert.equal(result.status, "blocked");
  assert.equal(result.code, "NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT");
  assert.equal(result.phase, "lock_acquisition");
  assert.equal(result.writeStarted, false);
  assert.equal(result.dispatchAttempted, false);
  assert.equal(result.redispatchAuthorized, false);
  await fs.rm(chronicleLock, { recursive: true, force: true });
} finally {
  await fs.rm(appChronicleTimeoutRoot, { recursive: true, force: true });
}

// A combined Continuity bootstrap + Chronicle operation is rejected before store access,
// even when a Continuity lock exists; the legacy timeout path must not be reached.
const appContinuityTimeoutRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-app-continuity-timeout-"));
try {
  const continuityPath = path.join(appContinuityTimeoutRoot, "continuity.json");
  const chroniclePath = path.join(appContinuityTimeoutRoot, "chronicle.json");
  assert.equal((await createNexoChronicleStore({ filePath: chroniclePath }).initialize()).status, "committed");
  const continuityLock = continuityPath + ".lock";
  await fs.mkdir(continuityLock);
  await fs.writeFile(path.join(continuityLock, "owner.json"), JSON.stringify({
    pid: process.pid, token: "application-timeout-owner"
  }), "utf8");
  const result = await runNexoChronicleAppend({
    continuityPath, chroniclePath, missionId: "app-timeout-continuity", stepId: "step-1",
    content: "must not initialize", initializeContinuity: true, lockWaitMs: 20
  });
  assert.equal(result.status, "blocked");
  assert.equal(result.code, "NEXO_M0_CONTINUITY_BOOTSTRAP_OPERATION_SEPARATION_REQUIRED");
  assert.equal(result.authorization, "NOT_EVALUATED");
  assert.equal(result.dispatchAttempted, false);
  assert.equal(result.redispatchAuthorized, false);
  await assert.rejects(fs.access(continuityPath), { code: "ENOENT" });
  await fs.access(continuityLock);
  await fs.rm(continuityLock, { recursive: true, force: true });
} finally {
  await fs.rm(appContinuityTimeoutRoot, { recursive: true, force: true });
}

const lostMissionAdmissionResponse = await recordNexoMissionSafely({
  owner: {
    recordMission: async () => {
      const error = new Error("private store failure detail");
      error.code = "NEXO_TEST_MISSION_ADMISSION_RESPONSE_LOST";
      throw error;
    }
  },
  expectedRevision: 0,
  mission: { missionId: "admission-unknown", steps: [] }
});
assert.equal(lostMissionAdmissionResponse.status, "unknown");
assert.equal(lostMissionAdmissionResponse.code, "NEXO_TEST_MISSION_ADMISSION_RESPONSE_LOST");
assert.equal(lostMissionAdmissionResponse.missionAdmissionCommitted, "UNKNOWN");
assert.equal(lostMissionAdmissionResponse.dispatchAttempted, false);
assert.equal(lostMissionAdmissionResponse.redispatchAuthorized, false);
assert.equal(JSON.stringify(lostMissionAdmissionResponse).includes("private store failure detail"), false);

const returnedUnknownMissionAdmission = await recordNexoMissionSafely({
  owner: {
    recordMission: async () => ({
      status: "unknown",
      code: "NEXO_TEST_MISSION_ADMISSION_UNKNOWN"
    })
  },
  expectedRevision: 0,
  mission: { missionId: "admission-unknown-return", steps: [] }
});
assert.equal(returnedUnknownMissionAdmission.status, "unknown");
assert.equal(returnedUnknownMissionAdmission.missionAdmissionCommitted, "UNKNOWN");
assert.equal(returnedUnknownMissionAdmission.dispatchAttempted, false);
assert.equal(returnedUnknownMissionAdmission.redispatchAuthorized, false);

// Lock cleanup can fail after the canonical envelope has already been committed.
// Preserve that known persistence fact in the public result, but never dispatch.
const committedAdmissionWithUnsafeHandoff = await recordNexoMissionSafely({
  owner: {
    recordMission: async () => ({
      status: "failed",
      code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
      persistenceStatus: "committed",
      storeRevision: 1
    })
  },
  expectedRevision: 0,
  mission: { missionId: "admission-committed-handoff-unsafe", steps: [] }
});
assert.equal(committedAdmissionWithUnsafeHandoff.status, "blocked");
assert.equal(committedAdmissionWithUnsafeHandoff.code, "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED");
assert.equal(committedAdmissionWithUnsafeHandoff.missionAdmissionCommitted, true);
assert.equal(committedAdmissionWithUnsafeHandoff.storeRevision, 1);
assert.equal(committedAdmissionWithUnsafeHandoff.dispatchAttempted, false);
assert.equal(committedAdmissionWithUnsafeHandoff.redispatchAuthorized, false);
const publicCommittedAdmission = publicChronicleResult(
  committedAdmissionWithUnsafeHandoff,
  "admission-committed-handoff-unsafe",
  "step-1"
);
assert.equal(publicCommittedAdmission.status, "blocked");
assert.equal(publicCommittedAdmission.missionAdmissionCommitted, true);
assert.equal(publicCommittedAdmission.storeRevision, 1);
assert.equal(publicCommittedAdmission.dispatchAttempted, false);
assert.equal(publicCommittedAdmission.redispatchAuthorized, false);

// An unsafe handoff whose persistence status is unknown must remain UNKNOWN.
const unknownPersistenceAdmission = await recordNexoMissionSafely({
  owner: {
    recordMission: async () => ({
      status: "failed",
      code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
      persistenceStatus: "unknown"
    })
  },
  expectedRevision: 0,
  mission: { missionId: "admission-persistence-unknown", steps: [] }
});
assert.equal(unknownPersistenceAdmission.status, "unknown");
assert.equal(unknownPersistenceAdmission.missionAdmissionCommitted, "UNKNOWN");
assert.equal(unknownPersistenceAdmission.dispatchAttempted, false);
assert.equal(unknownPersistenceAdmission.redispatchAuthorized, false);

// Simulate the actual crash cut: the canonical store commits mission admission,
// then the caller loses the response. UNKNOWN is returned while the persisted
// mission remains recoverable on the next canonical read.
const admissionCrashRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-admission-crash-cut-"));
try {
  const admissionPath = path.join(admissionCrashRoot, "continuity.json");
  const durableStore = createNexoContinuityStore({ filePath: admissionPath });
  const initialized = await durableStore.initialize({
    schema: "NEXO_OPERATIONAL_CONTINUITY",
    schemaVersion: 1,
    missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: []
  });
  assert.equal(initialized.status, "committed");
  let loseNextCommitResponse = true;
  const wrappedStore = {
    loadCurrent: () => durableStore.loadCurrent(),
    commitIfCurrent: async (...args) => {
      const committed = await durableStore.commitIfCurrent(...args);
      if (loseNextCommitResponse && committed.status === "committed") {
        loseNextCommitResponse = false;
        const error = new Error("simulated response loss after durable commit");
        error.code = "NEXO_TEST_ADMISSION_RESPONSE_LOST_AFTER_COMMIT";
        throw error;
      }
      return committed;
    }
  };
  const admissionOwner = createNexoContinuityOwner({ store: wrappedStore });
  const candidateMission = {
    missionId: "admission-crash-cut",
    status: "planned",
    objective: "chronicle_append",
    steps: [{
      id: "step-1", action: "chronicle_append",
      target: { content: "PRIVATE_ADMISSION_PAYLOAD" },
      status: "planned", dependsOn: []
    }]
  };
  const uncertainAdmission = await recordNexoMissionSafely({
    owner: admissionOwner, expectedRevision: 0, mission: candidateMission
  });
  assert.equal(uncertainAdmission.status, "unknown");
  assert.equal(uncertainAdmission.missionAdmissionCommitted, "UNKNOWN");
  assert.equal(uncertainAdmission.dispatchAttempted, false);
  assert.equal(uncertainAdmission.redispatchAuthorized, false);
  const recoveredAdmission = await durableStore.loadCurrent();
  assert.equal(recoveredAdmission.storeRevision, 1);
  assert.equal(recoveredAdmission.snapshot.missions[0].missionId, "admission-crash-cut");
  assert.equal(recoveredAdmission.snapshot.missions.length, 1);
  const reconstructedAfterLostResponse = await admissionOwner.reconstructMission("admission-crash-cut");
  assert.equal(reconstructedAfterLostResponse.status, "reconstructed");
  assert.equal(reconstructedAfterLostResponse.mission.status, "planned");
  assert.equal(reconstructedAfterLostResponse.mission.steps[0].status, "planned");
  assert.equal((await durableStore.loadCurrent()).storeRevision, 1);
} finally {
  await fs.rm(admissionCrashRoot, { recursive: true, force: true });
}

function chronicleMission() {
  return {
    missionId: "chronicle-mission",
    status: "planned",
    steps: [{ id: "step-1", action: "chronicle_append", target: { content: "hello Nexo" }, status: "planned" }]
  };
}

function adapter(onDispatch = () => ({ status: "completed", verified: true })) {
  return {
    supports: action => action === "chronicle_append",
    supportsReconciliation: action => action === "chronicle_append",
    executePrepared: async () => onDispatch()
  };
}
function continuitySnapshot(missions, effectJournal = []) {
  return {
    schema: "NEXO_OPERATIONAL_CONTINUITY",
    schemaVersion: 1,
    missions,
    attempts: [],
    doNotRepeat: [],
    executions: [],
    effectJournal
  };
}


// After capability checks, a requested successor still must not reach
// PREPARED or dispatch while its predecessor remains planned in canonical state.
const dependencyGateMission = {
  missionId: "dependency-gate-mission",
  status: "planned",
  steps: [
    { id: "step-1", action: "chronicle_append", target: { content: "first" }, status: "planned", dependsOn: [] },
    { id: "step-2", action: "chronicle_append", target: { content: "second" }, status: "planned", dependsOn: ["step-1"] }
  ]
};
let dependencyGatePrepareCalls = 0;
let dependencyGateDispatchCalls = 0;
const dependencyGateOwner = {
  loadCurrent: async () => ({
    storeRevision: 0,
    snapshot: continuitySnapshot([dependencyGateMission])
  }),
  supportsReconciliation: () => true,
  recordPrepared: async () => {
    dependencyGatePrepareCalls += 1;
    return { status: "committed", preparedCommitted: true, storeRevision: 1 };
  },
  recordExecutionLineage: async () => ({ status: "committed", storeRevision: 2 }),
  reconcilePrepared: async () => ({
    status: "observed", observation: "applied", storeRevision: 3,
    observedRevision: 1, source: "nexo-chronicle-store", journalSettled: true
  }),
  recordOutcome: async () => ({ status: "committed", storeRevision: 4 })
};
const dependencyGateResult = await executeNexoStepWithContinuityOwner({
  missionId: "dependency-gate-mission",
  stepId: "step-2",
  owner: dependencyGateOwner,
  adapter: adapter(() => {
    dependencyGateDispatchCalls += 1;
    return { status: "completed", verified: true, evidence: { verified: true } };
  })
});
assert.equal(dependencyGateResult.status, "blocked",
  "the runtime must block a successor whose dependency is not completed");
assert.equal(dependencyGateResult.code, "NEXO_CANONICAL_RUNTIME_DEPENDENCIES_UNRESOLVED");
assert.equal(dependencyGateResult.dispatchAttempted, false);
assert.equal(dependencyGatePrepareCalls, 0, "dependency gate must run before PREPARED");
assert.equal(dependencyGateDispatchCalls, 0, "dependency gate must run before adapter dispatch");

const completedClaimMission = {
  missionId: "completed-claim-mission",
  status: "planned",
  steps: [{ id: "step-1", action: "chronicle_append", target: { content: "claimed" }, status: "completed", dependsOn: [] }]
};
let completedClaimPrepareCalls = 0;
let completedClaimDispatchCalls = 0;
const completedClaimOwner = {
  loadCurrent: async () => ({
    storeRevision: 0,
    snapshot: continuitySnapshot([completedClaimMission])
  }),
  supportsReconciliation: () => true,
  recordPrepared: async () => {
    completedClaimPrepareCalls += 1;
    return { status: "committed", preparedCommitted: true, storeRevision: 1 };
  },
  recordExecutionLineage: async () => ({ status: "committed", storeRevision: 2 }),
  reconcilePrepared: async () => ({
    status: "observed", observation: "applied", storeRevision: 3,
    observedRevision: 1, source: "nexo-chronicle-store", journalSettled: true
  }),
  recordOutcome: async () => ({ status: "committed", storeRevision: 4 })
};
const completedClaimResult = await executeNexoStepWithContinuityOwner({
  missionId: "completed-claim-mission",
  stepId: "step-1",
  owner: completedClaimOwner,
  adapter: adapter(() => {
    completedClaimDispatchCalls += 1;
    return { status: "completed", verified: true, evidence: { verified: true } };
  })
});
assert.equal(completedClaimResult.status, "blocked",
  "an unverified completed claim must not be treated as a fresh runnable step");
assert.equal(completedClaimResult.code, "NEXO_CANONICAL_RUNTIME_STEP_NOT_RUNNABLE");
assert.equal(completedClaimResult.dispatchAttempted, false);
assert.equal(completedClaimPrepareCalls, 0);
assert.equal(completedClaimDispatchCalls, 0);

const blockedMissionClaim = {
  missionId: "blocked-mission-with-planned-step",
  status: "blocked",
  steps: [{ id: "step-1", action: "chronicle_append", target: { content: "blocked" }, status: "planned", dependsOn: [] }]
};
let blockedMissionPrepareCalls = 0;
let blockedMissionDispatchCalls = 0;
const blockedMissionOwner = {
  loadCurrent: async () => ({
    storeRevision: 0,
    snapshot: continuitySnapshot([blockedMissionClaim])
  }),
  supportsReconciliation: () => true,
  recordPrepared: async () => {
    blockedMissionPrepareCalls += 1;
    return { status: "committed", preparedCommitted: true, storeRevision: 1 };
  },
  recordExecutionLineage: async () => ({ status: "committed", storeRevision: 2 }),
  reconcilePrepared: async () => ({
    status: "observed", observation: "applied", storeRevision: 3,
    observedRevision: 1, source: "nexo-chronicle-store", journalSettled: true
  }),
  recordOutcome: async () => ({ status: "committed", storeRevision: 4 })
};
const blockedMissionResult = await executeNexoStepWithContinuityOwner({
  missionId: "blocked-mission-with-planned-step",
  stepId: "step-1",
  owner: blockedMissionOwner,
  adapter: adapter(() => {
    blockedMissionDispatchCalls += 1;
    return { status: "completed", verified: true, evidence: { verified: true } };
  })
});
assert.equal(blockedMissionResult.status, "blocked",
  "the runtime must preserve the canonical blocked mission state before reconstruction");
assert.equal(blockedMissionResult.dispatchAttempted, false);
assert.equal(blockedMissionPrepareCalls, 0);
assert.equal(blockedMissionDispatchCalls, 0);



// First execution: PREPARED -> dispatch -> lineage -> trusted persisted observation -> terminal outcome.
const calls = [];
let current = { storeRevision: 0, snapshot: continuitySnapshot([chronicleMission()]) };
const owner = {
  loadCurrent: async () => structuredClone(current),
  supportsReconciliation: action => action === "chronicle_append",
  recordPrepared: async ({ expectedRevision, operation }) => {
    calls.push("prepare");
    assert.equal(expectedRevision, 0);
    current.snapshot.effectJournal.push({
      idempotencyKey: operation.idempotencyKey, missionId: operation.missionId,
      stepId: operation.stepId, action: operation.action, target: operation.target,
      status: "prepared"
    });
    current.storeRevision = 1;
    return { status: "committed", preparedCommitted: true, storeRevision: 1 };
  },
  recordExecutionLineage: async ({ expectedRevision }) => {
    calls.push("lineage");
    assert.equal(expectedRevision, 1);
    current.storeRevision = 2;
    return { status: "committed", storeRevision: 2 };
  },
  reconcilePrepared: async ({ expectedRevision, operation }) => {
    calls.push("reconcile");
    assert.equal(expectedRevision, 2);
    assert.equal(operation.action, "chronicle_append");
    current.snapshot.effectJournal[0].status = "settled_observed";
    current.snapshot.effectJournal[0].settlement = {
      status: "applied", observedRevision: 1, source: "nexo-chronicle-store"
    };
    current.storeRevision = 3;
    return {
      status: "observed", observation: "applied", storeRevision: 3,
      observedRevision: 1, source: "nexo-chronicle-store", journalSettled: true
    };
  },
  recordOutcome: async ({ expectedRevision, outcome }) => {
    calls.push("outcome");
    assert.equal(expectedRevision, 3);
    assert.equal(outcome.status, "completed");
    assert.equal(outcome.action, "chronicle_append");
    current.storeRevision = 4;
    return { status: "committed", storeRevision: 4 };
  }
};
const result = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission", stepId: "step-1", owner, adapter: adapter(() => {
    calls.push("dispatch");
    return { status: "completed", verified: true, evidence: { verified: true } };
  })
});
assert.equal(result.status, "completed");
assert.deepEqual(calls, ["prepare", "dispatch", "lineage", "reconcile", "outcome"]);
assert.equal(result.dispatchAttempted, true);
assert.equal(result.journalSettled, true);
assert.equal(result.terminalOutcomeRecorded, true);
assert.equal(result.redispatchAuthorized, false);

const prepareConflictResult = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission",
  stepId: "step-1",
  owner: {
    loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
    supportsReconciliation: () => true,
    recordPrepared: async () => ({
      status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", storeRevision: 5
    }),
    recordExecutionLineage: async () => { throw new Error("lineage must not follow PREPARED conflict"); },
    reconcilePrepared: async () => { throw new Error("reconciliation must not follow PREPARED conflict"); },
    recordOutcome: async () => { throw new Error("outcome must not follow PREPARED conflict"); }
  },
  adapter: adapter(() => { throw new Error("dispatch must not follow PREPARED conflict"); })
});
assert.equal(prepareConflictResult.status, "conflict");
assert.equal(prepareConflictResult.code, "NEXO_CONTINUITY_STORE_REVISION_CONFLICT");
assert.equal(prepareConflictResult.dispatchAttempted, false);
assert.equal(prepareConflictResult.preparedCommitted, false);
assert.equal(prepareConflictResult.storeRevision, 5);

const preparedUnknownResult = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission",
  stepId: "step-1",
  owner: {
    loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
    supportsReconciliation: () => true,
    recordPrepared: async () => ({ status: "unknown", code: "NEXO_COMMIT_RESULT_UNKNOWN" }),
    recordExecutionLineage: async () => { throw new Error("lineage must not follow unknown PREPARED commit"); },
    reconcilePrepared: async () => { throw new Error("reconcile must not follow unknown PREPARED commit"); },
    recordOutcome: async () => { throw new Error("outcome must not follow unknown PREPARED commit"); }
  },
  adapter: adapter(() => { throw new Error("dispatch must not follow unknown PREPARED commit"); })
});
assert.equal(preparedUnknownResult.status, "unknown");
assert.equal(preparedUnknownResult.preparedCommitted, "UNKNOWN");
assert.equal(preparedUnknownResult.dispatchAttempted, false);
assert.equal(preparedUnknownResult.lineageCommitted, false);
assert.equal(preparedUnknownResult.journalSettled, false);
assert.equal(preparedUnknownResult.terminalOutcomeRecorded, false);
assert.equal(preparedUnknownResult.redispatchAuthorized, false);

const preparedTimeoutResult = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission",
  stepId: "step-1",
  owner: {
    loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
    supportsReconciliation: () => true,
    recordPrepared: async () => ({
      status: "failed",
      code: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT",
      phase: "lock_acquisition",
      writeStarted: false,
      lockRelease: { status: "failed", code: "EACCES" }
    }),
    recordExecutionLineage: async () => { throw new Error("lineage must not follow PREPARED timeout"); },
    reconcilePrepared: async () => { throw new Error("reconcile must not follow PREPARED timeout"); },
    recordOutcome: async () => { throw new Error("outcome must not follow PREPARED timeout"); }
  },
  adapter: adapter(() => { throw new Error("dispatch must not follow PREPARED timeout"); })
});
assert.equal(preparedTimeoutResult.status, "blocked");
assert.equal(preparedTimeoutResult.code, "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT");
assert.equal(preparedTimeoutResult.phase, "lock_acquisition");
assert.equal(preparedTimeoutResult.writeStarted, false);
assert.equal(preparedTimeoutResult.dispatchAttempted, false);
assert.equal(preparedTimeoutResult.redispatchAuthorized, false);
assert.deepEqual(preparedTimeoutResult.prepared.lockRelease, { status: "failed", code: "EACCES" });

// A confirmed PREPARED write with failed lock handoff remains blocked, but the
// public result must preserve the fact that the journal entry was persisted.
let unsafePreparedDispatches = 0;
const unsafePreparedHandoff = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission", stepId: "step-1",
  owner: {
    loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
    supportsReconciliation: () => true,
    recordPrepared: async () => ({
      status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
      persistenceStatus: "committed", preparedCommitted: true, storeRevision: 5
    }),
    recordExecutionLineage: async () => { throw new Error("unsafe PREPARED handoff must stop before lineage"); },
    reconcilePrepared: async () => { throw new Error("unsafe PREPARED handoff must stop before reconciliation"); },
    recordOutcome: async () => { throw new Error("unsafe PREPARED handoff must stop before outcome"); }
  },
  adapter: adapter(() => { unsafePreparedDispatches++; return { status: "completed" }; })
});
assert.equal(unsafePreparedHandoff.status, "blocked");
assert.equal(unsafePreparedHandoff.preparedCommitted, true);
assert.equal(unsafePreparedHandoff.storeRevision, 5);
assert.equal(unsafePreparedHandoff.dispatchAttempted, false);
assert.equal(unsafePreparedHandoff.redispatchAuthorized, false);
assert.equal(unsafePreparedDispatches, 0);

const malformedPreparedResponses = [
  { label: "missing confirmation flag", value: { status: "committed", storeRevision: 5 } },
  { label: "false confirmation flag", value: { status: "committed", preparedCommitted: false, storeRevision: 5 } },
  { label: "missing revision", value: { status: "committed", preparedCommitted: true } },
  { label: "negative revision", value: { status: "committed", preparedCommitted: true, storeRevision: -1 } },
  { label: "fractional revision", value: { status: "committed", preparedCommitted: true, storeRevision: 1.5 } },
  { label: "unsafe revision", value: { status: "committed", preparedCommitted: true, storeRevision: Number.MAX_SAFE_INTEGER + 1 } },
  { label: "unchanged revision", value: { status: "committed", preparedCommitted: true, storeRevision: 4 } },
  { label: "skipped revision", value: { status: "committed", preparedCommitted: true, storeRevision: 6 } },
  { label: "unexpected status", value: { status: "failed", preparedCommitted: true, storeRevision: 5 } },
  { label: "null response", value: null }
];
for (const testCase of malformedPreparedResponses) {
  let adapterInvocations = 0;
  let handlerInvocations = 0;
  const result = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-mission",
    stepId: "step-1",
    owner: {
      loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
      supportsReconciliation: () => true,
      recordPrepared: async () => testCase.value,
      recordExecutionLineage: async () => { throw new Error(`lineage must not follow ${testCase.label}`); },
      reconcilePrepared: async () => { throw new Error(`reconciliation must not follow ${testCase.label}`); },
      recordOutcome: async () => { throw new Error(`outcome must not follow ${testCase.label}`); }
    },
    adapter: {
      supports: action => action === "chronicle_append",
      supportsReconciliation: action => action === "chronicle_append",
      executePrepared: async () => {
        adapterInvocations++;
        handlerInvocations++;
        return { status: "completed" };
      }
    }
  });
  assert.equal(result.status, "blocked", testCase.label);
  assert.equal(result.code, "NEXO_PREPARED_COMMIT_NOT_CONFIRMED", testCase.label);
  assert.equal(result.dispatchAttempted, false, testCase.label);
  assert.equal(result.preparedCommitted, false, testCase.label);
  assert.equal(result.redispatchAuthorized, false, testCase.label);
  assert.equal(adapterInvocations, 0, testCase.label);
  assert.equal(handlerInvocations, 0, testCase.label);
}

// A malformed "committed" lineage response cannot be used as the reconciliation CAS baseline.
for (const malformedLineage of [
  { status: "committed" },
  { status: "committed", storeRevision: 5 },
  { status: "committed", storeRevision: 7 }
]) {
  let dispatches = 0;
  let reconciliations = 0;
  const result = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-mission",
    stepId: "step-1",
    owner: {
      loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
      supportsReconciliation: () => true,
      recordPrepared: async () => ({ status: "committed", preparedCommitted: true, storeRevision: 5 }),
      recordExecutionLineage: async () => malformedLineage,
      reconcilePrepared: async () => { reconciliations++; return { status: "observed", observation: "applied", storeRevision: 7, journalSettled: true, source: "nexo-chronicle-store", observedRevision: 1 }; },
      recordOutcome: async () => { throw new Error("malformed lineage must not record outcome"); }
    },
    adapter: adapter(() => { dispatches++; return { status: "completed" }; })
  });
  assert.equal(result.status, "unknown");
  assert.equal(result.code, "NEXO_EXECUTION_LINEAGE_COMMIT_NOT_CONFIRMED");
  assert.equal(result.dispatchAttempted, true);
  assert.equal(result.preparedCommitted, true);
  assert.equal(result.lineageCommitted, "UNKNOWN");
  assert.equal(result.journalSettled, false);
  assert.equal(result.terminalOutcomeRecorded, false);
  assert.equal(result.redispatchAuthorized, false);
  assert.equal(dispatches, 1);
  assert.equal(reconciliations, 0);
}

// A lineage commit whose lock handoff fails is known persisted, but it cannot
// be used as a confirmed CAS handoff to reconciliation.
let unsafeLineageDispatches = 0;
let unsafeLineageReconciliations = 0;
const unsafeLineageHandoff = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission", stepId: "step-1",
  owner: {
    loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
    supportsReconciliation: () => true,
    recordPrepared: async () => ({ status: "committed", preparedCommitted: true, storeRevision: 5 }),
    recordExecutionLineage: async () => ({
      status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
      persistenceStatus: "committed", storeRevision: 6
    }),
    reconcilePrepared: async () => { unsafeLineageReconciliations++; throw new Error("must not reconcile after unsafe lineage handoff"); },
    recordOutcome: async () => { throw new Error("must not record outcome after unsafe lineage handoff"); }
  },
  adapter: adapter(() => { unsafeLineageDispatches++; return { status: "completed" }; })
});
assert.equal(unsafeLineageHandoff.status, "unknown");
assert.equal(unsafeLineageHandoff.dispatchAttempted, true);
assert.equal(unsafeLineageHandoff.lineageCommitted, true);
assert.equal(unsafeLineageHandoff.journalSettled, false);
assert.equal(unsafeLineageHandoff.redispatchAuthorized, false);
assert.equal(unsafeLineageDispatches, 1);
assert.equal(unsafeLineageReconciliations, 0);

let reconciliationDispatches = 0;
const reconciliationUnknownResult = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission",
  stepId: "step-1",
  owner: {
    loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
    supportsReconciliation: () => true,
    recordPrepared: async () => ({ status: "committed", preparedCommitted: true, storeRevision: 5 }),
    recordExecutionLineage: async () => ({ status: "committed", storeRevision: 6 }),
    reconcilePrepared: async () => { throw new Error("observation commit response lost"); },
    recordOutcome: async () => { throw new Error("outcome must wait for reconciliation"); }
  },
  adapter: adapter(() => { reconciliationDispatches++; return { status: "completed" }; })
});
assert.equal(reconciliationUnknownResult.status, "unknown");
assert.equal(reconciliationUnknownResult.dispatchAttempted, true);
assert.equal(reconciliationUnknownResult.preparedCommitted, true);
assert.equal(reconciliationUnknownResult.lineageCommitted, true);
assert.equal(reconciliationUnknownResult.journalSettled, "UNKNOWN");
assert.equal(reconciliationUnknownResult.terminalOutcomeRecorded, false);
assert.equal(reconciliationUnknownResult.redispatchAuthorized, false);
assert.equal(reconciliationDispatches, 1);

// A Chronicle settlement whose commit is confirmed but whose lock handoff fails
// must remain non-terminal at the mission-outcome layer while preserving the
// durable journal-settlement fact. Replay may record the outcome only.
let unsafeReconcileDispatches = 0;
let unsafeReconcileOutcomeCalls = 0;
const unsafeReconcileHandoff = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission", stepId: "step-1",
  owner: {
    loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
    supportsReconciliation: () => true,
    recordPrepared: async () => ({ status: "committed", preparedCommitted: true, storeRevision: 5 }),
    recordExecutionLineage: async () => ({ status: "committed", storeRevision: 6 }),
    reconcilePrepared: async () => ({
      status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
      persistenceStatus: "committed", storeRevision: 7,
      observationCommitted: true, observation: "applied", observedRevision: 1,
      source: "nexo-chronicle-store", journalSettled: true
    }),
    recordOutcome: async () => { unsafeReconcileOutcomeCalls++; throw new Error("must wait for a confirmed reconciliation handoff"); }
  },
  adapter: adapter(() => { unsafeReconcileDispatches++; return { status: "completed" }; })
});
assert.equal(unsafeReconcileHandoff.status, "unknown");
assert.equal(unsafeReconcileHandoff.dispatchAttempted, true);
assert.equal(unsafeReconcileHandoff.lineageCommitted, true);
assert.equal(unsafeReconcileHandoff.journalSettled, true);
assert.equal(unsafeReconcileHandoff.terminalOutcomeRecorded, false);
assert.equal(unsafeReconcileHandoff.redispatchAuthorized, false);
assert.equal(unsafeReconcileDispatches, 1);
assert.equal(unsafeReconcileOutcomeCalls, 0);

const adapterThrowResult = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission",
  stepId: "step-1",
  owner: {
    loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
    supportsReconciliation: () => true,
    recordPrepared: async () => ({ status: "committed", preparedCommitted: true, storeRevision: 5 }),
    recordExecutionLineage: async () => { throw new Error("must not record lineage after adapter throw"); },
    reconcilePrepared: async () => { throw new Error("must not reconcile after adapter throw"); },
    recordOutcome: async () => { throw new Error("must not record outcome after adapter throw"); }
  },
  adapter: adapter(() => { throw new Error("effect may have happened before throw"); })
});
assert.equal(adapterThrowResult.status, "unknown");
assert.equal(adapterThrowResult.dispatchAttempted, true);
assert.equal(adapterThrowResult.preparedCommitted, true);
assert.equal(adapterThrowResult.lineageCommitted, false);
assert.equal(adapterThrowResult.journalSettled, false);
assert.equal(adapterThrowResult.terminalOutcomeRecorded, false);
assert.equal(adapterThrowResult.redispatchAuthorized, false);
assert.equal(JSON.stringify(adapterThrowResult).includes("effect may have happened before throw"), false,
  "raw adapter exception text must not leak through the application result contract");

let lineageConflictDispatches = 0;
const lineageConflictResult = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission",
  stepId: "step-1",
  owner: {
    loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
    supportsReconciliation: () => true,
    recordPrepared: async () => ({ status: "committed", preparedCommitted: true, storeRevision: 5 }),
    recordExecutionLineage: async () => ({
      status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", storeRevision: 6
    }),
    reconcilePrepared: async () => { throw new Error("must not reconcile after lineage conflict"); },
    recordOutcome: async () => { throw new Error("must not record outcome after lineage conflict"); }
  },
  adapter: adapter(() => { lineageConflictDispatches++; return { status: "completed" }; })
});
assert.equal(lineageConflictResult.status, "unknown",
  "effect outcome stays unresolved after dispatch even when lineage CAS conflict is known");
assert.equal(lineageConflictResult.dispatchAttempted, true);
assert.equal(lineageConflictResult.preparedCommitted, true);
assert.equal(lineageConflictResult.lineageCommitted, false);
assert.equal(lineageConflictResult.journalSettled, false);
assert.equal(lineageConflictResult.terminalOutcomeRecorded, false);
assert.equal(lineageConflictResult.redispatchAuthorized, false);
assert.equal(lineageConflictDispatches, 1);

// Restart after dispatch but before settlement: reconcile only, never dispatch again.
let recoveryCalls = [];
const preparedSnapshot = {
  storeRevision: 5,
  snapshot: {
    missions: [chronicleMission()],
    effectJournal: [{
      idempotencyKey: "chronicle-mission:step-1", missionId: "chronicle-mission",
      stepId: "step-1", action: "chronicle_append", target: { content: "hello Nexo" }, status: "prepared"
    }]
  }
};
const recoveryOwner = {
  loadCurrent: async () => structuredClone(preparedSnapshot),
  recordPrepared: async () => { throw new Error("recovery must not prepare again"); },
  recordExecutionLineage: async () => { throw new Error("recovery must not redispatch or add lineage"); },
  supportsReconciliation: () => true,
  reconcilePrepared: async ({ expectedRevision }) => {
    recoveryCalls.push("reconcile");
    assert.equal(expectedRevision, 5);
    return {
      status: "observed", observation: "applied", storeRevision: 6,
      observedRevision: 1, source: "nexo-chronicle-store", journalSettled: true
    };
  },
  recordOutcome: async ({ expectedRevision }) => {
    recoveryCalls.push("outcome");
    assert.equal(expectedRevision, 6);
    return { status: "committed", storeRevision: 7 };
  }
};
const recovered = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission", stepId: "step-1", owner: recoveryOwner,
  adapter: adapter(() => { recoveryCalls.push("dispatch"); return { status: "completed" }; })
});
assert.equal(recovered.status, "completed");
assert.deepEqual(recoveryCalls, ["reconcile", "outcome"]);
assert.equal(recovered.dispatchAttempted, false);
assert.equal(recovered.redispatchAuthorized, false);

const preparedRecoveryUnknown = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission", stepId: "step-1",
  owner: {
    loadCurrent: async () => ({
      storeRevision: 5,
      snapshot: {
        missions: [chronicleMission()],
        effectJournal: [{
          idempotencyKey: "chronicle-mission:step-1", missionId: "chronicle-mission",
          stepId: "step-1", action: "chronicle_append",
          target: { content: "hello Nexo" }, status: "prepared"
        }]
      }
    }),
    supportsReconciliation: () => true,
    recordPrepared: async () => { throw new Error("restart must not prepare again"); },
    recordExecutionLineage: async () => { throw new Error("restart must not rewrite lineage blindly"); },
    reconcilePrepared: async () => { throw new Error("settlement may have committed before response loss"); },
    recordOutcome: async () => { throw new Error("outcome waits for confirmed settlement"); }
  },
  adapter: adapter(() => { throw new Error("restart must never dispatch"); })
});
assert.equal(preparedRecoveryUnknown.status, "unknown");
assert.equal(preparedRecoveryUnknown.dispatchAttempted, false);
assert.equal(preparedRecoveryUnknown.preparedCommitted, true);
assert.equal(preparedRecoveryUnknown.lineageCommitted, "UNKNOWN");
assert.equal(preparedRecoveryUnknown.journalSettled, "UNKNOWN");
assert.equal(preparedRecoveryUnknown.terminalOutcomeRecorded, false);
assert.equal(preparedRecoveryUnknown.redispatchAuthorized, false);

// A settled append whose terminal outcome response was lost is recovered by outcome replay only.
let replayCalls = [];
const settledOwner = {
  loadCurrent: async () => ({
    storeRevision: 9,
    snapshot: {
      missions: [chronicleMission()],
      effectJournal: [{
        idempotencyKey: "chronicle-mission:step-1", missionId: "chronicle-mission",
        stepId: "step-1", action: "chronicle_append", target: { content: "hello Nexo" },
        status: "settled_observed",
        settlement: {
          status: "applied",
          observedRevision: 1,
          source: "nexo-chronicle-store",
          evidence: {
            kind: "persisted-chronicle-entry",
            operationKey: "chronicle-mission:step-1",
            content: "hello Nexo"
          },
          observedAt: "2026-10-19T00:00:00.000Z"
        }
      }]
    }
  }),
  recordPrepared: async () => { throw new Error("settled replay must not prepare again"); },
  recordExecutionLineage: async () => { throw new Error("settled replay must not redispatch"); },
  recordPrepared: async () => { throw new Error("settled replay must not prepare again"); },
  recordExecutionLineage: async () => { throw new Error("settled replay must not redispatch"); },
  supportsReconciliation: () => true,
  reconcilePrepared: async () => { throw new Error("settled replay must not reconcile again"); },
  recordOutcome: async ({ expectedRevision }) => {
    replayCalls.push("outcome");
    assert.equal(expectedRevision, 9);
    return { status: "already_recorded", storeRevision: 9 };
  }
};
const replayed = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission", stepId: "step-1", owner: settledOwner,
  adapter: adapter(() => { replayCalls.push("dispatch"); return { status: "completed" }; })
});
assert.equal(replayed.status, "completed");
assert.deepEqual(replayCalls, ["outcome"]);
assert.equal(replayed.dispatchAttempted, false);

// Runtime recovery must use the same complete settlement contract as the owner.
// A merely settled_observed label with null evidence cannot claim journal settlement.
let malformedReplayOutcomeCalls = 0;
let malformedReplayDispatches = 0;
const malformedSettledOwner = {
  ...settledOwner,
  loadCurrent: async () => {
    const current = await settledOwner.loadCurrent();
    current.snapshot.effectJournal[0].settlement.evidence = null;
    return current;
  },
  recordOutcome: async () => {
    malformedReplayOutcomeCalls += 1;
    return { status: "committed", storeRevision: 9 };
  }
};
const malformedSettledReplay = await executeNexoStepWithContinuityOwner({
  missionId: "chronicle-mission", stepId: "step-1", owner: malformedSettledOwner,
  adapter: adapter(() => { malformedReplayDispatches++; return { status: "completed" }; })
});
assert.equal(malformedSettledReplay.status, "unknown");
assert.equal(malformedSettledReplay.code, "NEXO_CHRONICLE_EXISTING_OBLIGATION_UNRESOLVED");
assert.equal(malformedSettledReplay.dispatchAttempted, false);
assert.equal(malformedSettledReplay.journalSettled, false);
assert.equal(malformedSettledReplay.terminalOutcomeRecorded, false);
assert.equal(malformedReplayOutcomeCalls, 0);
assert.equal(malformedReplayDispatches, 0);

// Real stores and real owner: verify the entire first Chronicle vertical.
const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-chronicle-runtime-"));
try {
  function legacyMemory(missionId) {
    return {
      version: 4, runs: [], lessons: [], patterns: [],
      nexo: {
        missions: [{
          missionId, status: "planned", objective: "chronicle_append",
          steps: [{
            id: "step-1", action: "chronicle_append",
            target: { content: "hello Nexo" }, status: "planned", dependsOn: []
          }]
        }],
        attempts: [], doNotRepeat: [], executions: [], effectJournal: []
      }
    };
  }
  async function setup(missionId) {
    const continuityPath = path.join(root, missionId + "-continuity.json");
    const chroniclePath = path.join(root, missionId + "-chronicle.json");
    const chronicleStore = createNexoChronicleStore({ filePath: chroniclePath });
    assert.equal((await chronicleStore.initialize()).status, "committed");
    const contracts = createNexoChronicleEffectContracts({ store: chronicleStore });
    const opened = await openNexoContinuityOwner({
      filePath: continuityPath,
      legacyMemory: legacyMemory(missionId),
      effectVerifiers: contracts.verifiers
    });
    return { continuityPath, chroniclePath, chronicleStore, contracts, opened };
  }
  const real = await setup("chronicle-real");
  const fabricatedCompletion = await real.opened.owner.recordOutcome({
    expectedRevision: real.opened.current.storeRevision,
    outcome: {
      missionId: "chronicle-real", stepId: "step-1", action: "chronicle_append",
      target: { content: "hello Nexo" }, status: "completed",
      evidence: { verified: true, source: "caller-claim" }
    }
  });
  assert.equal(fabricatedCompletion.status, "blocked");
  assert.equal(fabricatedCompletion.code, "NEXO_CHRONICLE_SETTLEMENT_REQUIRED");
  let dispatches = 0;
  const realAdapter = createEffectAdapter({
    handlers: {
      chronicle_append: async request => {
        dispatches++;
        return real.contracts.handlers.chronicle_append(request);
      }
    },
    verifiers: real.contracts.verifiers
  });
  const realResult = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-real", stepId: "step-1",
    owner: real.opened.owner, adapter: realAdapter,
    postcondition: real.contracts.postcondition
  });
  assert.equal(realResult.status, "completed");
  assert.equal(dispatches, 1);
  const realContinuity = await real.opened.owner.loadCurrent();
  assert.equal(realContinuity.snapshot.effectJournal[0].status, "settled_observed");
  assert.equal(realContinuity.snapshot.effectJournal[0].settlement.source, "nexo-chronicle-store");
  assert.deepEqual(realContinuity.snapshot.effectJournal[0].settlement.evidence, {
    kind: "persisted-chronicle-entry",
    operationKey: "chronicle-real:step-1",
    content: "hello Nexo"
  });
  assert.equal(
    new Date(realContinuity.snapshot.effectJournal[0].settlement.observedAt).toISOString(),
    realContinuity.snapshot.effectJournal[0].settlement.observedAt
  );
  assert.equal(realContinuity.snapshot.attempts[0].status, "completed");
  assert.deepEqual(Object.keys(realContinuity.snapshot.attempts[0].evidence).sort(),
    ["kind", "observedRevision", "source", "verified"],
    "the canonical Chronicle outcome evidence shape must not expose unbound extra claims");
  const reconstructedChronicle = reconstructNexoMissionFromSnapshot(realContinuity.snapshot, "chronicle-real");
  assert.equal(reconstructedChronicle.steps[0].status, "completed",
    "a settled Chronicle append with a recorded outcome must not be downgraded as an observed repair");
  assert.notEqual(reconstructedChronicle.objective, "verify_observed_repair_goal");
  assert.equal((await real.chronicleStore.loadCurrent()).entries.length, 1);

  // A known CAS conflict while recording the terminal outcome is not the same
  // as an unknown commit result. The settled append is recovered by outcome
  // replay only; no second dispatch is allowed.
  const outcomeConflict = await setup("chronicle-outcome-conflict");
  let conflictDispatches = 0;
  let returnOutcomeConflict = true;
  const conflictOwner = Object.freeze({
    ...outcomeConflict.opened.owner,
    recordOutcome: async args => {
      if (returnOutcomeConflict) {
        returnOutcomeConflict = false;
        const current = await outcomeConflict.opened.owner.loadCurrent();
        return { status: "conflict", code: "NEXO_CONTINUITY_STORE_REVISION_CONFLICT", storeRevision: current.storeRevision };
      }
      return outcomeConflict.opened.owner.recordOutcome(args);
    }
  });
  const conflictAdapter = createEffectAdapter({
    handlers: {
      chronicle_append: async request => {
        conflictDispatches++;
        return outcomeConflict.contracts.handlers.chronicle_append(request);
      }
    },
    verifiers: outcomeConflict.contracts.verifiers
  });
  const conflictResult = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-outcome-conflict", stepId: "step-1",
    owner: conflictOwner, adapter: conflictAdapter,
    postcondition: outcomeConflict.contracts.postcondition
  });
  assert.equal(conflictResult.status, "conflict");
  assert.equal(conflictResult.code, "NEXO_CONTINUITY_STORE_REVISION_CONFLICT");
  assert.equal(conflictResult.journalSettled, true);
  assert.equal(conflictResult.terminalOutcomeRecorded, false);
  assert.equal(conflictDispatches, 1);
  assert.equal((await outcomeConflict.opened.owner.loadCurrent()).snapshot.effectJournal[0].status, "settled_observed");
  const conflictReopened = await openNexoContinuityOwner({
    filePath: outcomeConflict.continuityPath, effectVerifiers: outcomeConflict.contracts.verifiers
  });
  const conflictReplay = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-outcome-conflict", stepId: "step-1",
    owner: conflictReopened.owner,
    adapter: createEffectAdapter({
      handlers: { chronicle_append: async () => { conflictDispatches++; return { status: "completed" }; } },
      verifiers: outcomeConflict.contracts.verifiers
    }),
    postcondition: outcomeConflict.contracts.postcondition
  });
  assert.equal(conflictReplay.status, "completed");
  assert.equal(conflictReplay.dispatchAttempted, false);
  assert.equal(conflictDispatches, 1);
  assert.equal((await conflictReopened.owner.loadCurrent()).snapshot.attempts[0].status, "completed");

  // A terminal-outcome status string alone is not a commit receipt. Once the
  // Chronicle effect is settled, malformed owner revisions must preserve UNKNOWN
  // and must not claim a terminal outcome or redispatch the append.
  const malformedOutcomeReceipts = [
    {
      label: "missing committed revision",
      response: () => ({ status: "committed" })
    },
    {
      label: "committed revision did not advance",
      response: ({ expectedRevision }) => ({ status: "committed", storeRevision: expectedRevision })
    },
    {
      label: "committed revision skipped",
      response: ({ expectedRevision }) => ({ status: "committed", storeRevision: expectedRevision + 2 })
    },
    {
      label: "already-recorded revision advanced unexpectedly",
      response: ({ expectedRevision }) => ({ status: "already_recorded", storeRevision: expectedRevision + 1 })
    }
  ];
  for (let index = 0; index < malformedOutcomeReceipts.length; index++) {
    const testCase = malformedOutcomeReceipts[index];
    const malformedOutcomeSetup = await setup(`chronicle-malformed-outcome-${index}`);
    let malformedOutcomeDispatches = 0;
    const malformedOutcomeOwner = Object.freeze({
      ...malformedOutcomeSetup.opened.owner,
      recordOutcome: async args => testCase.response(args)
    });
    const malformedOutcomeAdapter = createEffectAdapter({
      handlers: {
        chronicle_append: async request => {
          malformedOutcomeDispatches++;
          return malformedOutcomeSetup.contracts.handlers.chronicle_append(request);
        }
      },
      verifiers: malformedOutcomeSetup.contracts.verifiers
    });
    const malformedOutcomeResult = await executeNexoStepWithContinuityOwner({
      missionId: `chronicle-malformed-outcome-${index}`,
      stepId: "step-1",
      owner: malformedOutcomeOwner,
      adapter: malformedOutcomeAdapter,
      postcondition: malformedOutcomeSetup.contracts.postcondition
    });
    assert.equal(malformedOutcomeResult.status, "unknown", testCase.label);
    assert.equal(malformedOutcomeResult.code, "NEXO_CHRONICLE_OUTCOME_COMMIT_NOT_CONFIRMED", testCase.label);
    assert.equal(malformedOutcomeResult.dispatchAttempted, true, testCase.label);
    assert.equal(malformedOutcomeResult.journalSettled, true, testCase.label);
    assert.equal(malformedOutcomeResult.terminalOutcomeRecorded, "UNKNOWN", testCase.label);
    assert.equal(malformedOutcomeResult.redispatchAuthorized, false, testCase.label);
    assert.equal(malformedOutcomeDispatches, 1, testCase.label);
    const malformedOutcomeCurrent = await malformedOutcomeSetup.opened.owner.loadCurrent();
    assert.equal(malformedOutcomeCurrent.snapshot.effectJournal[0].status, "settled_observed", testCase.label);
    assert.equal(malformedOutcomeCurrent.snapshot.attempts.length, 0, testCase.label);
  }

  // If the terminal outcome was committed but lock release failed, preserve
  // the known outcome receipt without upgrading the overall response to success.
  const outcomeLockFailure = await setup("chronicle-outcome-lock-release-failed");
  let outcomeLockFailureDispatches = 0;
  const ownerWithOutcomeLockFailure = Object.freeze({
    ...outcomeLockFailure.opened.owner,
    recordOutcome: async args => {
      const committed = await outcomeLockFailure.opened.owner.recordOutcome(args);
      return {
        ...committed,
        status: "failed",
        code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
        persistenceStatus: "committed"
      };
    }
  });
  const outcomeLockFailureResult = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-outcome-lock-release-failed", stepId: "step-1",
    owner: ownerWithOutcomeLockFailure,
    adapter: createEffectAdapter({
      handlers: { chronicle_append: async request => {
        outcomeLockFailureDispatches++;
        return outcomeLockFailure.contracts.handlers.chronicle_append(request);
      } },
      verifiers: outcomeLockFailure.contracts.verifiers
    }),
    postcondition: outcomeLockFailure.contracts.postcondition
  });
  assert.equal(outcomeLockFailureResult.status, "blocked");
  assert.equal(outcomeLockFailureResult.terminalOutcomeRecorded, true);
  assert.equal(outcomeLockFailureResult.journalSettled, true);
  assert.equal(outcomeLockFailureResult.redispatchAuthorized, false);
  assert.equal(outcomeLockFailureDispatches, 1);
  assert.equal((await outcomeLockFailure.opened.owner.loadCurrent()).snapshot.attempts[0].status, "completed");

  // Unknown outcome persistence must not be collapsed to a definite failure.
  const outcomePersistenceUnknown = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-mission", stepId: "step-1",
    owner: {
      loadCurrent: async () => ({ storeRevision: 4, snapshot: continuitySnapshot([chronicleMission()]) }),
      supportsReconciliation: () => true,
      recordPrepared: async () => ({ status: "committed", preparedCommitted: true, storeRevision: 5 }),
      recordExecutionLineage: async () => ({ status: "committed", storeRevision: 6 }),
      reconcilePrepared: async () => ({
        status: "observed", observation: "applied", storeRevision: 7,
        observedRevision: 1, source: "nexo-chronicle-store", journalSettled: true
      }),
      recordOutcome: async () => ({
        status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED",
        persistenceStatus: "unknown"
      })
    },
    adapter: adapter(() => ({ status: "completed" }))
  });
  assert.equal(outcomePersistenceUnknown.status, "unknown");
  assert.equal(outcomePersistenceUnknown.terminalOutcomeRecorded, "UNKNOWN");
  assert.equal(outcomePersistenceUnknown.journalSettled, true);
  assert.equal(outcomePersistenceUnknown.redispatchAuthorized, false);

  // Two callers racing on an already-admitted operation must not duplicate the
  // append. A loser may report conflict/unknown; an explicit retry recovers the
  // persisted result without automatic redispatch.
  const concurrent = await setup("chronicle-concurrent");
  const concurrentArgs = {
    continuityPath: concurrent.continuityPath,
    chroniclePath: concurrent.chroniclePath,
    missionId: "chronicle-concurrent",
    stepId: "step-1",
    content: "hello Nexo",
    initializeContinuity: false,
    initializeChronicle: false
  };
  const concurrentResults = await Promise.all([
    runNexoChronicleAppend(concurrentArgs),
    runNexoChronicleAppend(concurrentArgs)
  ]);
  assert.ok(concurrentResults.some(result => result.status === "completed"));
  assert.ok(concurrentResults.filter(result => result.dispatchAttempted === true).length <= 1,
    "concurrent same-operation calls must not dispatch the effect twice");
  assert.equal((await concurrent.chronicleStore.loadCurrent()).entries.length, 1);
  const concurrentContinuityBeforeRetry = await fs.readFile(concurrent.continuityPath, "utf8");
  const concurrentChronicleBeforeRetry = await fs.readFile(concurrent.chroniclePath, "utf8");
  const concurrentRetry = await runNexoChronicleAppend(concurrentArgs);
  assert.equal(concurrentRetry.status, "completed");
  assert.equal(concurrentRetry.dispatchAttempted, false);
  assert.equal(await fs.readFile(concurrent.continuityPath, "utf8"), concurrentContinuityBeforeRetry);
  assert.equal(await fs.readFile(concurrent.chroniclePath, "utf8"), concurrentChronicleBeforeRetry);

  // Concurrent first-time bootstrap is not a cross-store transaction. It may
  // produce a blocked loser, but an explicit retry must converge to one append.
  const bootstrapRaceArgs = {
    continuityPath: path.join(root, "bootstrap-race-continuity.json"),
    chroniclePath: path.join(root, "bootstrap-race-chronicle.json"),
    missionId: "chronicle-bootstrap-race",
    stepId: "step-1",
    content: "first-time concurrent append",
    initializeContinuity: true,
    initializeChronicle: true
  };
  const bootstrapRaceResults = await Promise.all([
    runNexoChronicleAppend(bootstrapRaceArgs),
    runNexoChronicleAppend(bootstrapRaceArgs)
  ]);
  assert.ok(bootstrapRaceResults.filter(result => result.dispatchAttempted === true).length <= 1);
  const bootstrapRetry = await runNexoChronicleAppend(bootstrapRaceArgs);
  assert.equal(bootstrapRetry.status, "completed");
  assert.ok(
    [...bootstrapRaceResults, bootstrapRetry].filter(result => result.dispatchAttempted === true).length <= 1,
    "first-time concurrent calls plus explicit retry must dispatch at most once"
  );
  const bootstrapChronicle = createNexoChronicleStore({ filePath: bootstrapRaceArgs.chroniclePath });
  assert.equal((await bootstrapChronicle.loadCurrent()).entries.length, 1);
  const bootstrapContinuityBeforeFinalReplay = await fs.readFile(bootstrapRaceArgs.continuityPath, "utf8");
  const bootstrapChronicleBeforeFinalReplay = await fs.readFile(bootstrapRaceArgs.chroniclePath, "utf8");
  const bootstrapFinalReplay = await runNexoChronicleAppend(bootstrapRaceArgs);
  assert.equal(bootstrapFinalReplay.status, "completed");
  assert.equal(bootstrapFinalReplay.dispatchAttempted, false);
  assert.equal(await fs.readFile(bootstrapRaceArgs.continuityPath, "utf8"), bootstrapContinuityBeforeFinalReplay);
  assert.equal(await fs.readFile(bootstrapRaceArgs.chroniclePath, "utf8"), bootstrapChronicleBeforeFinalReplay);

  // Restart after the append but before lineage/settlement: recover by reading Chronicle, never redispatch.
  const interrupted = await setup("chronicle-interrupted");
  const prepared = await interrupted.opened.owner.recordPrepared({
    expectedRevision: interrupted.opened.current.storeRevision,
    operation: {
      idempotencyKey: "chronicle-interrupted:step-1", missionId: "chronicle-interrupted",
      stepId: "step-1", action: "chronicle_append", target: { content: "hello Nexo" }
    }
  });
  assert.equal(prepared.status, "committed");
  assert.equal((await interrupted.chronicleStore.append({
    operationKey: "chronicle-interrupted:step-1", content: "hello Nexo"
  })).status, "committed");
  const reopenedOwner = await openNexoContinuityOwner({
    filePath: interrupted.continuityPath, effectVerifiers: interrupted.contracts.verifiers
  });
  let recoveryDispatches = 0;
  const recoveryAdapter = createEffectAdapter({
    handlers: { chronicle_append: async () => { recoveryDispatches++; return { status: "completed" }; } },
    verifiers: interrupted.contracts.verifiers
  });
  const recoveredReal = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-interrupted", stepId: "step-1",
    owner: reopenedOwner.owner, adapter: recoveryAdapter,
    postcondition: interrupted.contracts.postcondition
  });
  assert.equal(recoveredReal.status, "completed");
  assert.equal(recoveredReal.dispatchAttempted, false);
  assert.equal(recoveryDispatches, 0);
  const recoveredSnapshot = await reopenedOwner.owner.loadCurrent();
  assert.equal(recoveredSnapshot.snapshot.effectJournal[0].status, "settled_observed");
  assert.equal(recoveredSnapshot.snapshot.attempts[0].status, "completed");

  // Restart after settlement but before/after outcome response: replay outcome only.
  const reopenedAgain = await openNexoContinuityOwner({
    filePath: real.continuityPath, effectVerifiers: real.contracts.verifiers
  });
  let replayDispatches = 0;
  const replayAdapter = createEffectAdapter({
    handlers: { chronicle_append: async () => { replayDispatches++; return { status: "completed" }; } },
    verifiers: real.contracts.verifiers
  });
  const replayResult = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-real", stepId: "step-1",
    owner: reopenedAgain.owner, adapter: replayAdapter,
    postcondition: real.contracts.postcondition
  });
  assert.equal(replayResult.status, "completed");
  assert.equal(replayResult.dispatchAttempted, false);
  assert.equal(replayDispatches, 0);
  // PREPARED with no persisted entry remains blocked after restart; no implicit retry.
  const absent = await setup("chronicle-absent");
  const absentPrepared = await absent.opened.owner.recordPrepared({
    expectedRevision: absent.opened.current.storeRevision,
    operation: {
      idempotencyKey: "chronicle-absent:step-1", missionId: "chronicle-absent",
      stepId: "step-1", action: "chronicle_append", target: { content: "hello Nexo" }
    }
  });
  assert.equal(absentPrepared.status, "committed");
  const absentReopened = await openNexoContinuityOwner({
    filePath: absent.continuityPath, effectVerifiers: absent.contracts.verifiers
  });
  let absentDispatches = 0;
  const absentAdapter = createEffectAdapter({
    handlers: { chronicle_append: async () => { absentDispatches++; return { status: "completed" }; } },
    verifiers: absent.contracts.verifiers
  });
  const absentResult = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-absent", stepId: "step-1",
    owner: absentReopened.owner, adapter: absentAdapter,
    postcondition: absent.contracts.postcondition
  });
  assert.equal(absentResult.status, "unknown");
  assert.equal(absentResult.dispatchAttempted, false);
  assert.equal(absentDispatches, 0);
  assert.equal((await absentReopened.owner.loadCurrent()).snapshot.effectJournal[0].status, "reconciled_observed");

  // Outcome response lost after its commit: restart replays only the outcome, never the append.
  const lostOutcome = await setup("chronicle-lost-outcome");
  let loseOutcomeResponse = true;
  const ownerWithLostOutcomeResponse = Object.freeze({
    ...lostOutcome.opened.owner,
    recordOutcome: async args => {
      const committed = await lostOutcome.opened.owner.recordOutcome(args);
      if (loseOutcomeResponse && (committed.status === "committed" || committed.status === "already_recorded")) {
        loseOutcomeResponse = false;
        throw new Error("simulated outcome response loss after commit");
      }
      return committed;
    }
  });
  let lostOutcomeDispatches = 0;
  const lostOutcomeAdapter = createEffectAdapter({
    handlers: {
      chronicle_append: async request => {
        lostOutcomeDispatches++;
        return lostOutcome.contracts.handlers.chronicle_append(request);
      }
    },
    verifiers: lostOutcome.contracts.verifiers
  });
  const uncertainOutcome = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-lost-outcome", stepId: "step-1",
    owner: ownerWithLostOutcomeResponse, adapter: lostOutcomeAdapter,
    postcondition: lostOutcome.contracts.postcondition
  });
  assert.equal(uncertainOutcome.status, "unknown");
  assert.equal(uncertainOutcome.dispatchAttempted, true);
  assert.equal(uncertainOutcome.preparedCommitted, true);
  assert.equal(uncertainOutcome.lineageCommitted, true);
  assert.equal(uncertainOutcome.journalSettled, true);
  assert.equal(uncertainOutcome.terminalOutcomeRecorded, "UNKNOWN");
  assert.equal(uncertainOutcome.redispatchAuthorized, false);
  assert.equal(lostOutcomeDispatches, 1);
  const outcomeReopened = await openNexoContinuityOwner({
    filePath: lostOutcome.continuityPath, effectVerifiers: lostOutcome.contracts.verifiers
  });
  const reconstructedOutcome = await outcomeReopened.owner.reconstructMission("chronicle-lost-outcome");
  assert.equal(reconstructedOutcome.status, "reconstructed");
  assert.equal(reconstructedOutcome.mission.steps[0].status, "completed",
    "valid Chronicle settlement plus persisted terminal outcome must survive restart reconstruction");
  assert.equal(reconstructedOutcome.mission.status, "awaiting_verification",
    "a completed step does not imply the overall mission goal has been independently verified");
  const outcomeReplayAdapter = createEffectAdapter({
    handlers: { chronicle_append: async () => { lostOutcomeDispatches++; return { status: "completed" }; } },
    verifiers: lostOutcome.contracts.verifiers
  });
  const outcomeReplay = await executeNexoStepWithContinuityOwner({
    missionId: "chronicle-lost-outcome", stepId: "step-1",
    owner: outcomeReopened.owner, adapter: outcomeReplayAdapter,
    postcondition: lostOutcome.contracts.postcondition
  });
  assert.equal(outcomeReplay.status, "completed");
  assert.equal(outcomeReplay.dispatchAttempted, false);
  assert.equal(lostOutcomeDispatches, 1);
  assert.equal((await outcomeReopened.owner.loadCurrent()).snapshot.attempts[0].status, "completed");

} finally {
  await fs.rm(root, { recursive: true, force: true });
}

// CLI parsing rejects unknown, repeated, and missing options before touching either store.
const validCli = [
  "--continuity", "/tmp/nexo-continuity.json",
  "--chronicle", "/tmp/nexo-chronicle.json",
  "--mission", "mission-1",
  "--step", "step-1",
  "--content-stdin"
];
assert.equal(parseNexoChronicleArguments(validCli).contentFromStdin, true);
assert.throws(() => parseNexoChronicleArguments([...validCli, "--content-stdin"]), { code: "NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID" });
assert.throws(() => parseNexoChronicleArguments([...validCli, "--content", "private body"]), { code: "NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID" });
assert.throws(() => parseNexoChronicleArguments([...validCli, "--unexpected"]), { code: "NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID" });
assert.throws(() => parseNexoChronicleArguments([...validCli, "--mission", "mission-2"]), { code: "NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID" });
assert.throws(() => parseNexoChronicleArguments(["--continuity"]), { code: "NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID" });
assert.throws(() => parseNexoChronicleArguments(["--content", "--initialize-chronicle"]), { code: "NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID" });
assert.throws(() => parseNexoChronicleArguments([...validCli, "--initialize-continuity", "--initialize-continuity"]), { code: "NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID" });

// Exercise the actual executable boundary: invalid args exit nonzero, create no
// stores, and never echo private Chronicle content to stdout/stderr.
const cliRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-chronicle-cli-"));
try {
  const cliContinuity = path.join(cliRoot, "continuity.json");
  const cliChronicle = path.join(cliRoot, "chronicle.json");
  const privateContent = "PRIVATE_CHRONICLE_SENTINEL_DO_NOT_LOG";
  const cliArgs = [
    "scripts/nexo-chronicle-session.mjs",
    "--continuity", cliContinuity,
    "--chronicle", cliChronicle,
    "--mission", "cli-mission",
    "--step", "cli-step",
    "--content-stdin",
    "--unknown-option"
  ];
  assert.equal(cliArgs.includes(privateContent), false);
  const cli = spawnSync(process.execPath, cliArgs, { cwd: process.cwd(), encoding: "utf8", input: privateContent });
  assert.equal(cli.status, 1);
  assert.equal(cli.stderr, "");
  const cliOutput = JSON.parse(cli.stdout.trim());
  assert.equal(cliOutput.status, "blocked");
  assert.equal(cliOutput.code, "NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID");
  assert.equal(cli.stdout.includes(privateContent), false);
  assert.equal(cli.stderr.includes(privateContent), false);
  await assert.rejects(fs.access(cliContinuity), { code: "ENOENT" });
  await assert.rejects(fs.access(cliChronicle), { code: "ENOENT" });

  // Valid invocation receives content over stdin; payload is not an argv value
  // and is not echoed to the terminal.
  const successfulCliArgs = [
    "scripts/nexo-chronicle-session.mjs",
    "--continuity", path.join(cliRoot, "valid-continuity.json"),
    "--chronicle", path.join(cliRoot, "valid-chronicle.json"),
    "--mission", "cli-valid-mission",
    "--step", "cli-valid-step",
    "--content-stdin",
    "--initialize-continuity",
    "--initialize-chronicle"
  ];
  assert.equal(successfulCliArgs.includes(privateContent), false);
  const successfulCli = spawnSync(process.execPath, successfulCliArgs, { cwd: process.cwd(), encoding: "utf8", input: privateContent });
  assert.equal(successfulCli.status, 0, JSON.stringify({ stdout: successfulCli.stdout, stderr: successfulCli.stderr, error: successfulCli.error?.message }));
  assert.equal(successfulCli.stderr, "");
  assert.equal(successfulCli.stdout.includes(privateContent), false);
  assert.equal(JSON.parse(successfulCli.stdout.trim()).status, "completed");
  const persistedCliChronicle = JSON.parse(await fs.readFile(path.join(cliRoot, "valid-chronicle.json"), "utf8"));
  assert.equal(persistedCliChronicle.entries[0].content, privateContent);

  const exactStdinContinuity = path.join(cliRoot, "exact-stdin-continuity.json");
  const exactStdinChronicle = path.join(cliRoot, "exact-stdin-chronicle.json");
  const exactStdin = spawnSync(process.execPath, [
    "scripts/nexo-chronicle-session.mjs",
    "--continuity", exactStdinContinuity,
    "--chronicle", exactStdinChronicle,
    "--mission", "exact-stdin-mission",
    "--step", "exact-stdin-step",
    "--content-stdin",
    "--initialize-continuity",
    "--initialize-chronicle"
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    input: "z".repeat(NEXO_RESOURCE_LIMITS.stdinBytes)
  });
  assert.equal(exactStdin.status, 0, JSON.stringify({ stdout: exactStdin.stdout, stderr: exactStdin.stderr }));
  assert.equal(JSON.parse(exactStdin.stdout.trim()).status, "completed");
  assert.equal(JSON.parse(await fs.readFile(exactStdinChronicle, "utf8")).entries[0].content.length,
    NEXO_RESOURCE_LIMITS.stdinBytes, "stdin at the exact byte limit is accepted");

  // Oversized stdin is rejected during accumulation; no store is created and no payload is echoed.
  const oversizedStdinContinuity = path.join(cliRoot, "oversized-stdin-continuity.json");
  const oversizedStdinChronicle = path.join(cliRoot, "oversized-stdin-chronicle.json");
  const oversizedStdin = spawnSync(process.execPath, [
    "scripts/nexo-chronicle-session.mjs",
    "--continuity", oversizedStdinContinuity,
    "--chronicle", oversizedStdinChronicle,
    "--mission", "oversized-stdin-mission",
    "--step", "oversized-stdin-step",
    "--content-stdin",
    "--initialize-continuity",
    "--initialize-chronicle"
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    input: "x".repeat(NEXO_RESOURCE_LIMITS.stdinBytes + 1)
  });
  assert.equal(oversizedStdin.status, 1);
  assert.equal(JSON.parse(oversizedStdin.stdout.trim()).code, "NEXO_CHRONICLE_STDIN_RESOURCE_LIMIT_EXCEEDED");
  assert.equal(oversizedStdin.stdout.includes("x".repeat(128)), false);
  assert.equal(oversizedStdin.stderr, "");
  await assert.rejects(fs.access(oversizedStdinContinuity), { code: "ENOENT" });
  await assert.rejects(fs.access(oversizedStdinChronicle), { code: "ENOENT" });

  const directOversizeContinuity = path.join(cliRoot, "direct-oversize-continuity.json");
  const directOversizeChronicle = path.join(cliRoot, "direct-oversize-chronicle.json");
  const directOversize = await runNexoChronicleAppend({
    continuityPath: directOversizeContinuity,
    chroniclePath: directOversizeChronicle,
    missionId: "direct-oversize-mission",
    stepId: "direct-oversize-step",
    content: "é".repeat(Math.floor(NEXO_RESOURCE_LIMITS.chronicleEntryBytes / 2) + 1),
    initializeContinuity: true,
    initializeChronicle: true
  });
  assert.equal(directOversize.status, "blocked");
  assert.equal(directOversize.code, "NEXO_CHRONICLE_RESOURCE_LIMIT_EXCEEDED");
  await assert.rejects(fs.access(directOversizeContinuity), { code: "ENOENT" },
    "oversized direct application input must not admit a mission");
  await assert.rejects(fs.access(directOversizeChronicle), { code: "ENOENT" },
    "oversized direct application input must not initialize Chronicle");
} finally {
  await fs.rm(cliRoot, { recursive: true, force: true });
}

// The real Nexo entrypoint is explicitly initialized and remains independent of Lúmina.
const entryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-chronicle-entry-"));
try {
  const args = {
    continuityPath: path.join(entryRoot, "continuity.json"),
    chroniclePath: path.join(entryRoot, "chronicle.json"),
    missionId: "caller-provided-mission",
    stepId: "caller-provided-step",
    content: "Nexo owns this history",
    initializeContinuity: true,
    initializeChronicle: true
  };
  const separatorCollision = await runNexoChronicleAppend({ ...args, missionId: "caller:provided-mission" });
  assert.equal(separatorCollision.status, "blocked");
  assert.equal(separatorCollision.code, "NEXO_CHRONICLE_ID_INVALID");
  const stepSeparatorCollision = await runNexoChronicleAppend({ ...args, stepId: "caller:provided-step" });
  assert.equal(stepSeparatorCollision.status, "blocked");
  assert.equal(stepSeparatorCollision.code, "NEXO_CHRONICLE_ID_INVALID");
  const paddedIdentity = await runNexoChronicleAppend({ ...args, missionId: " caller-provided-mission " });
  assert.equal(paddedIdentity.status, "blocked");
  assert.equal(paddedIdentity.code, "NEXO_CHRONICLE_ID_INVALID");

  const delimiterCollision = await runNexoChronicleAppend({
    ...args, missionId: "caller-provided-mission:caller-provided", stepId: "step"
  });
  assert.equal(delimiterCollision.status, "blocked");
  assert.equal(delimiterCollision.code, "NEXO_CHRONICLE_ID_INVALID");
  const entryResult = await runNexoChronicleAppend(args);
  assert.equal(entryResult.status, "completed");
  assert.equal(entryResult.authorization, "NOT_EVALUATED",
    "local Chronicle settlement must not imply owner authorization");
  assert.equal(entryResult.dispatchAttempted, true);
  assert.equal(JSON.stringify(entryResult).includes(args.content), false,
    "public application results must not expose Chronicle payloads");
  for (const internalField of ["adapterResult", "lineage", "reconciliation", "outcome", "target", "context"]) {
    assert.equal(Object.hasOwn(entryResult, internalField), false,
      `public application result must not expose internal field ${internalField}`);
  }
  const replay = await runNexoChronicleAppend(args);
  assert.equal(replay.status, "completed");
  assert.equal(replay.dispatchAttempted, false);
  const changedPayload = await runNexoChronicleAppend({ ...args, content: "attempt to change same mission" });
  assert.equal(changedPayload.status, "blocked");
  assert.equal(changedPayload.code, "NEXO_CHRONICLE_MISSION_CONTENT_MISMATCH");
  const noInitialization = await runNexoChronicleAppend({
    ...args,
    continuityPath: path.join(entryRoot, "missing-continuity.json"),
    chroniclePath: path.join(entryRoot, "missing-chronicle.json"),
    initializeContinuity: false,
    initializeChronicle: false
  });
  assert.equal(noInitialization.status, "blocked");

  // Opt-in initialization never overwrites an existing corrupt store.
  const corruptChroniclePath = path.join(entryRoot, "corrupt-chronicle.json");
  await fs.writeFile(corruptChroniclePath, "{broken", "utf8");
  const corruptChronicle = await runNexoChronicleAppend({
    ...args, chroniclePath: corruptChroniclePath, initializeChronicle: true
  });
  assert.equal(corruptChronicle.status, "blocked");
  assert.equal(await fs.readFile(corruptChroniclePath, "utf8"), "{broken");

  const corruptContinuityPath = path.join(entryRoot, "corrupt-continuity.json");
  await fs.writeFile(corruptContinuityPath, "{broken", "utf8");
  const corruptContinuity = await runNexoChronicleAppend({
    ...args, continuityPath: corruptContinuityPath, initializeContinuity: true
  });
  assert.equal(corruptContinuity.status, "blocked");
  assert.equal(await fs.readFile(corruptContinuityPath, "utf8"), "{broken");

  // Preflight both stores before any initialization side effect.
  const corruptContinuityPath2 = path.join(entryRoot, "corrupt-continuity-no-partial.json");
  const missingChroniclePath = path.join(entryRoot, "must-not-create-chronicle.json");
  await fs.writeFile(corruptContinuityPath2, "{broken", "utf8");
  const preflightContinuity = await runNexoChronicleAppend({
    ...args, continuityPath: corruptContinuityPath2, chroniclePath: missingChroniclePath,
    initializeContinuity: true, initializeChronicle: true
  });
  assert.equal(preflightContinuity.status, "blocked");
  assert.equal(await fs.readFile(corruptContinuityPath2, "utf8"), "{broken");
  await assert.rejects(fs.access(missingChroniclePath), { code: "ENOENT" });

  const corruptChroniclePath2 = path.join(entryRoot, "corrupt-chronicle-no-partial.json");
  const missingContinuityPath = path.join(entryRoot, "must-not-create-continuity.json");
  await fs.writeFile(corruptChroniclePath2, "{broken", "utf8");
  const preflightChronicle = await runNexoChronicleAppend({
    ...args, continuityPath: missingContinuityPath, chroniclePath: corruptChroniclePath2,
    initializeContinuity: true, initializeChronicle: true
  });
  assert.equal(preflightChronicle.status, "blocked");
  assert.equal(await fs.readFile(corruptChroniclePath2, "utf8"), "{broken");
  await assert.rejects(fs.access(missingContinuityPath), { code: "ENOENT" });

  // If the second store's parent becomes unavailable at initialization time,
  // the first store may already have been committed. The partial state must be
  // explicit and recoverable: no mission/Chronicle append is dispatched, and a
  // later explicit retry can initialize the missing companion without resetting
  // the existing Continuity store.
  const partialBootstrapContinuityPath = path.join(entryRoot, "partial-bootstrap-continuity.json");
  const lateChronicleParent = path.join(entryRoot, "late-chronicle-parent");
  const partialBootstrapChroniclePath = path.join(lateChronicleParent, "chronicle.json");
  const partialBootstrapArgs = {
    ...args,
    continuityPath: partialBootstrapContinuityPath,
    chroniclePath: partialBootstrapChroniclePath,
    missionId: "partial-bootstrap-recovery",
    stepId: "step-1",
    initializeContinuity: true,
    initializeChronicle: true
  };
  const partialBootstrap = await runNexoChronicleAppend(partialBootstrapArgs);
  assert.equal(partialBootstrap.status, "blocked");
  assert.equal(partialBootstrap.authorization, "NOT_EVALUATED");
  assert.equal(partialBootstrap.dispatchAttempted, false);
  assert.equal(partialBootstrap.code, "NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE");
  const partialContinuity = await createNexoContinuityStore({
    filePath: partialBootstrapContinuityPath
  }).loadCurrent();
  assert.equal(partialContinuity.status, "loaded");
  assert.equal(partialContinuity.snapshot.missions.length, 0,
    "failed second-store bootstrap must not admit a mission or append Chronicle");
  await assert.rejects(fs.access(partialBootstrapChroniclePath), { code: "ENOENT" });

  await fs.mkdir(lateChronicleParent);
  const recoveredBootstrap = await runNexoChronicleAppend({
    ...partialBootstrapArgs,
    initializeContinuity: false,
    initializeChronicle: true
  });
  assert.equal(recoveredBootstrap.status, "completed");
  assert.equal(recoveredBootstrap.authorization, "NOT_EVALUATED");
  assert.equal(recoveredBootstrap.dispatchAttempted, true);
  assert.equal((await createNexoContinuityStore({
    filePath: partialBootstrapContinuityPath
  }).loadCurrent()).snapshot.missions.length, 1);
  assert.equal((await createNexoChronicleStore({
    filePath: partialBootstrapChroniclePath
  }).loadCurrent()).entries.length, 1);
 } finally {
  await fs.rm(entryRoot, { recursive: true, force: true });
}

// A supplied generic handler/verifier is not sufficient to enable an action:
 // only Chronicle has the complete operation-specific settlement contract here.
let unsupportedPrepareCalls = 0;
let unsupportedDispatchCalls = 0;
const unsupportedOwner = {
  loadCurrent: async () => ({
    storeRevision: 0,
    snapshot: continuitySnapshot([{
      missionId: "generic-mission",
      status: "planned",
      steps: [{ id: "step-1", action: "generic_write", target: "alpha", status: "planned", dependsOn: [] }]
    }])
  }),
  recordPrepared: async () => { unsupportedPrepareCalls += 1; return { status: "committed", preparedCommitted: true, storeRevision: 1 }; },
  recordExecutionLineage: async () => ({ status: "committed", storeRevision: 2 }),
  reconcilePrepared: async () => ({ status: "observed", observation: "applied", storeRevision: 3, journalSettled: false }),
  supportsReconciliation: () => true
};
const unsupportedAction = await executeNexoStepWithContinuityOwner({
  missionId: "generic-mission",
  stepId: "step-1",
  owner: unsupportedOwner,
  adapter: {
    supports: () => true,
    supportsReconciliation: () => true,
    executePrepared: async () => {
      unsupportedDispatchCalls += 1;
      return { status: "completed", verified: true, evidence: { verified: true } };
    }
  }
});
assert.equal(unsupportedAction.status, "blocked");
assert.equal(unsupportedAction.code, "NEXO_CANONICAL_RUNTIME_ACTION_NOT_ENABLED");
assert.equal(unsupportedAction.dispatchAttempted, false);
assert.equal(unsupportedAction.preparedCommitted, false);
assert.equal(unsupportedPrepareCalls, 0);
assert.equal(unsupportedDispatchCalls, 0);

const runtimeReadFailureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-runtime-prepared-read-failure-"));
try {
  const continuityPath = path.join(runtimeReadFailureRoot, "continuity.json");
  const chroniclePath = path.join(runtimeReadFailureRoot, "chronicle.json");
  const chronicleStore = createNexoChronicleStore({ filePath: chroniclePath });
  assert.equal((await chronicleStore.initialize()).status, "committed");
  const contracts = createNexoChronicleEffectContracts({ store: chronicleStore });
  const readFailureMemory = {
    version: 4, runs: [], lessons: [], patterns: [],
    nexo: {
      missions: [{
        missionId: "runtime-read-failure",
        status: "planned",
        objective: "chronicle_append",
        steps: [{
          id: "step-1", action: "chronicle_append",
          target: { content: "hello Nexo" }, status: "planned", dependsOn: []
        }]
      }],
      attempts: [], doNotRepeat: [], executions: [], effectJournal: []
    }
  };
  const opened = await openNexoContinuityOwner({
    filePath: continuityPath,
    legacyMemory: readFailureMemory,
    effectVerifiers: contracts.verifiers
  });
  const readError = Object.assign(new Error("simulated PREPARED read failure"), {
    code: "TEST_PREPARED_READ_FAILED"
  });
  let readCount = 0;
  let commits = 0;
  let dispatches = 0;
  const flakyStore = {
    loadCurrent: async (...args) => {
      readCount++;
      if (readCount === 2) throw readError;
      return opened.store.loadCurrent(...args);
    },
    commitIfCurrent: async (...args) => {
      commits++;
      return opened.store.commitIfCurrent(...args);
    }
  };
  const owner = createNexoContinuityOwner({
    store: flakyStore,
    effectVerifiers: contracts.verifiers
  });
  const adapter = createEffectAdapter({
    handlers: {
      chronicle_append: async request => {
        dispatches++;
        return contracts.handlers.chronicle_append(request);
      }
    },
    verifiers: contracts.verifiers
  });
  const result = await executeNexoStepWithContinuityOwner({
    missionId: "runtime-read-failure",
    stepId: "step-1",
    owner,
    adapter,
    postcondition: contracts.postcondition
  });
  assert.equal(result.status, "blocked");
  assert.equal(result.code, "TEST_PREPARED_READ_FAILED");
  assert.equal(result.dispatchAttempted, false);
  assert.equal(result.preparedCommitted, false);
  assert.equal(readCount, 2, "one runtime snapshot read and one PREPARED admission read are expected");
  assert.equal(commits, 0);
  assert.equal(dispatches, 0, "a read failure before PREPARED must never invoke the adapter");
} finally {
  await fs.rm(runtimeReadFailureRoot, { recursive: true, force: true });
}

// Unexpected failures in injected capability code must not escape the public runtime boundary.
const throwingCapabilityMission = chronicleMission();
const throwingCapabilityOwner = {
  loadCurrent: async () => ({
    storeRevision: 0,
    snapshot: continuitySnapshot([throwingCapabilityMission])
  }),
  recordPrepared: async () => {
    throw new Error("must not reach PREPARED when capability check throws");
  },
  recordExecutionLineage: async () => ({ status: "committed", storeRevision: 2 }),
  reconcilePrepared: async () => ({ status: "unknown" }),
  supportsReconciliation: () => true
};
const throwingCapabilityResult = await executeNexoStepWithContinuityOwner({
  missionId: throwingCapabilityMission.missionId,
  stepId: "step-1",
  owner: throwingCapabilityOwner,
  adapter: {
    supports: () => { throw new Error("private injected capability failure"); },
    supportsReconciliation: () => true,
    executePrepared: async () => {
      throw new Error("dispatch must not happen");
    }
  }
});
assert.deepEqual(throwingCapabilityResult, {
  status: "blocked",
  code: "NEXO_RUNTIME_INTERNAL_FAILURE",
  dispatchAttempted: false,
  preparedCommitted: false,
  lineageCommitted: false,
  journalSettled: false,
  terminalOutcomeRecorded: false,
  redispatchAuthorized: false
}, "unexpected pre-dispatch exceptions must become a closed public result");
assert.equal(JSON.stringify(throwingCapabilityResult).includes("private injected"), false);


const readOnlyQueryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-read-only-query-"));
try {
  const existingPath = path.join(readOnlyQueryRoot, "continuity.json");
  const missingPath = path.join(readOnlyQueryRoot, "missing-continuity.json");
  const snapshot = continuitySnapshot([{
    missionId: "read-only-query-mission",
    status: "planned",
    steps: [{ id: "step-1", action: "chronicle_append", target: { content: "read-only" }, status: "planned", dependsOn: [] }]
  }]);
  assert.equal((await createNexoContinuityStore({ filePath: existingPath }).initialize(snapshot)).status, "committed");
  const beforeBytes = await fs.readFile(existingPath);
  const beforeStat = await fs.stat(existingPath);

  const status = await loadNexoContinuityStatus(existingPath);
  assert.equal(status.status, "loaded");
  const mission = await loadNexoMissionStatus(existingPath, "read-only-query-mission");
  assert.equal(mission.status, "reconstructed");
  const plan = await loadNexoMissionPlan(existingPath, "read-only-query-mission");
  assert.equal(plan.status, "planned");
  assert.equal(plan.authorization, "NOT_EVALUATED");
  assert.equal(plan.dispatchAttempted, false);
  const absentPlan = await loadNexoMissionPlan(existingPath, "not-present");
  assert.equal(absentPlan.status, "not_found");
  assert.equal(absentPlan.authorization, "NOT_EVALUATED");
  assert.equal(absentPlan.dispatchAttempted, false);
  const absentMission = await loadNexoMissionStatus(existingPath, "not-present");
  assert.equal(absentMission.status, "not_found");

  const afterBytes = await fs.readFile(existingPath);
  const afterStat = await fs.stat(existingPath);
  assert.deepEqual(afterBytes, beforeBytes, "status queries must not alter persisted Continuity bytes");
  assert.equal(afterStat.mtimeMs, beforeStat.mtimeMs, "status queries must not rewrite the Continuity file");
  await assert.rejects(fs.access(missingPath), { code: "ENOENT" });
  assert.equal((await loadNexoContinuityStatus(missingPath)).status, "blocked");
  assert.equal((await loadNexoMissionStatus(missingPath, "not-present")).status, "blocked");
  await assert.rejects(fs.access(missingPath), { code: "ENOENT" },
    "read-only status queries must not initialize a missing store");
} finally {
  await fs.rm(readOnlyQueryRoot, { recursive: true, force: true });
}

// The exported public-result sanitizer must not execute ordinary accessors
// while projecting untrusted internal result records.
let publicResultGetterCalls = 0;
const accessorResult = { code: "NEXO_TEST_PUBLIC_RESULT_CODE", dispatchAttempted: true };
Object.defineProperty(accessorResult, "status", {
  enumerable: true,
  get() { publicResultGetterCalls += 1; throw new Error("status getter must not execute"); }
});
const sanitizedAccessorResult = publicChronicleResult(accessorResult, "safe-mission", "safe-step");
assert.equal(publicResultGetterCalls, 0);
assert.equal(sanitizedAccessorResult.status, "unknown");
assert.equal(sanitizedAccessorResult.code, "NEXO_TEST_PUBLIC_RESULT_CODE");
assert.equal(sanitizedAccessorResult.dispatchAttempted, true);
assert.equal(sanitizedAccessorResult.authorization, "NOT_EVALUATED");
assert.equal(sanitizedAccessorResult.redispatchAuthorized, false);

const accessorTimeout = {
  status: "blocked",
  dispatchAttempted: false,
  code: "NEXO_TEST_PUBLIC_TIMEOUT"
};
Object.defineProperty(accessorTimeout, "prepared", {
  enumerable: true,
  get() { publicResultGetterCalls += 1; throw new Error("prepared getter must not execute"); }
});
const nestedAccessorTimeout = {};
Object.defineProperties(nestedAccessorTimeout, {
  code: { enumerable: true, value: "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT" },
  phase: { enumerable: true, get() { publicResultGetterCalls += 1; throw new Error("phase getter must not execute"); } },
  writeStarted: { enumerable: true, get() { publicResultGetterCalls += 1; throw new Error("writeStarted getter must not execute"); } },
  lockRelease: { enumerable: true, get() { publicResultGetterCalls += 1; throw new Error("lockRelease getter must not execute"); } }
});
Object.defineProperty(accessorTimeout, "lineage", {
  enumerable: true,
  value: nestedAccessorTimeout
});
const sanitizedNestedAccessorTimeout = publicChronicleResult(accessorTimeout, "safe-timeout", "step-1");
assert.equal(publicResultGetterCalls, 0);
assert.equal(sanitizedNestedAccessorTimeout.status, "blocked");
assert.equal(sanitizedNestedAccessorTimeout.lockAcquisitionCode,
  "NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT");
assert.equal(Object.hasOwn(sanitizedNestedAccessorTimeout, "phase"), false);
assert.equal(Object.hasOwn(sanitizedNestedAccessorTimeout, "writeStarted"), false);
assert.equal(Object.hasOwn(sanitizedNestedAccessorTimeout, "lockRelease"), false);

const accessorLockRelease = { status: "failed" };
Object.defineProperty(accessorLockRelease, "code", {
  enumerable: true,
  get() { publicResultGetterCalls += 1; throw new Error("lock release code getter must not execute"); }
});
const lockReleaseAccessorResult = publicChronicleResult({
  status: "blocked",
  dispatchAttempted: false,
  prepared: {
    phase: "lock_acquisition",
    writeStarted: false,
    lockRelease: accessorLockRelease
  }
}, "safe-lock-release", "step-1");
assert.equal(publicResultGetterCalls, 0);
assert.equal(lockReleaseAccessorResult.phase, "lock_acquisition");
assert.equal(lockReleaseAccessorResult.writeStarted, false);
assert.equal(Object.hasOwn(lockReleaseAccessorResult, "lockRelease"), false);

// The exported owner-backed runtime must not spread caller-owned options or
// access injected capability methods through ordinary property reads.
let runtimeInputGetterCalls = 0;
const accessorRuntimeOptions = {};
Object.defineProperty(accessorRuntimeOptions, "missionId", {
  enumerable: true,
  get() {
    runtimeInputGetterCalls += 1;
    throw new Error("missionId getter must not execute");
  }
});
const accessorRuntimeResult = await executeNexoStepWithContinuityOwner(accessorRuntimeOptions);
assert.equal(runtimeInputGetterCalls, 0);
assert.equal(accessorRuntimeResult.status, "invalid");
assert.equal(accessorRuntimeResult.code, "NEXO_CANONICAL_RUNTIME_CONTEXT_INVALID");
assert.equal(accessorRuntimeResult.dispatchAttempted, false);
assert.equal(accessorRuntimeResult.redispatchAuthorized, false);

let ownerMethodGetterCalls = 0;
let ownerMethodCalls = 0;
const accessorRuntimeOwner = {};
Object.defineProperty(accessorRuntimeOwner, "loadCurrent", {
  enumerable: true,
  get() {
    ownerMethodGetterCalls += 1;
    throw new Error("loadCurrent getter must not execute");
  }
});
const validRuntimeAdapter = {
  executePrepared: async () => ({ status: "completed" }),
  supports: () => true,
  supportsReconciliation: () => true
};
const accessorOwnerRuntimeResult = await executeNexoStepWithContinuityOwner({
  missionId: "accessor-owner",
  stepId: "step-1",
  owner: accessorRuntimeOwner,
  adapter: validRuntimeAdapter
});
assert.equal(ownerMethodGetterCalls, 0);
assert.equal(ownerMethodCalls, 0);
assert.equal(accessorOwnerRuntimeResult.status, "invalid");
assert.equal(accessorOwnerRuntimeResult.dispatchAttempted, false);

const runtimeOwnerNoCalls = {
  loadCurrent: async () => { ownerMethodCalls += 1; return { storeRevision: 0, snapshot: { missions: [], effectJournal: [] } }; },
  recordPrepared: async () => { ownerMethodCalls += 1; return { status: "committed", storeRevision: 1 }; },
  recordExecutionLineage: async () => { ownerMethodCalls += 1; return { status: "committed", storeRevision: 2 }; },
  reconcilePrepared: async () => { ownerMethodCalls += 1; return { status: "observed" }; },
  supportsReconciliation: () => true
};
let adapterMethodGetterCalls = 0;
const accessorRuntimeAdapter = {
  executePrepared: async () => { throw new Error("dispatch must not occur"); },
  supportsReconciliation: () => true
};
Object.defineProperty(accessorRuntimeAdapter, "supports", {
  enumerable: true,
  get() {
    adapterMethodGetterCalls += 1;
    throw new Error("supports getter must not execute");
  }
});
const accessorAdapterRuntimeResult = await executeNexoStepWithContinuityOwner({
  missionId: "accessor-adapter",
  stepId: "step-1",
  owner: runtimeOwnerNoCalls,
  adapter: accessorRuntimeAdapter
});
assert.equal(adapterMethodGetterCalls, 0);
assert.equal(ownerMethodCalls, 0, "invalid adapter capability must be rejected before owner calls");
assert.equal(accessorAdapterRuntimeResult.status, "invalid");
assert.equal(accessorAdapterRuntimeResult.dispatchAttempted, false);

console.log("Nexo Chronicle owner-backed runtime tests passed");
