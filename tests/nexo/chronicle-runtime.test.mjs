import assert from "node:assert/strict";
import { executeNexoStepWithContinuityOwner } from "../../src/nexo/runtime.js";

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

// First execution: PREPARED -> dispatch -> lineage -> trusted persisted observation -> terminal outcome.
const calls = [];
let current = { storeRevision: 0, snapshot: { missions: [chronicleMission()], effectJournal: [] } };
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
        settlement: { status: "applied", observedRevision: 1, source: "nexo-chronicle-store" }
      }]
    }
  }),
  supportsReconciliation: () => true,
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

console.log("Nexo Chronicle owner-backed runtime tests passed");
