import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import { createNexoChronicleStore } from "../../src/nexo/core/chronicle-store.mjs";
import { createNexoChronicleEffectContracts } from "../../src/nexo/adapters/chronicle-effect.mjs";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";
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
  assert.equal(realContinuity.snapshot.attempts[0].status, "completed");
  assert.equal((await real.chronicleStore.loadCurrent()).entries.length, 1);

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
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

console.log("Nexo Chronicle owner-backed runtime tests passed");
