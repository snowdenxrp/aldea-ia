import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import { createNexoChronicleStore } from "../../src/nexo/core/chronicle-store.mjs";
import { createNexoChronicleEffectContracts } from "../../src/nexo/adapters/chronicle-effect.mjs";
import { createEffectAdapter } from "../../src/nexo/effect-adapter.js";
import { runNexoChronicleAppend, parseNexoChronicleArguments } from "../../scripts/nexo-chronicle-session.mjs";
import { executeNexoStepWithContinuityOwner } from "../../src/nexo/runtime.js";
import { reconstructNexoMissionFromSnapshot } from "../../src/nexo/core/continuity-operations.mjs";

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
  assert.equal(realContinuity.snapshot.attempts[0].status, "completed");
  const reconstructedChronicle = reconstructNexoMissionFromSnapshot(realContinuity.snapshot, "chronicle-real");
  assert.equal(reconstructedChronicle.steps[0].status, "completed",
    "a settled Chronicle append with a recorded outcome must not be downgraded as an observed repair");
  assert.notEqual(reconstructedChronicle.objective, "verify_observed_repair_goal");
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
  assert.equal(lostOutcomeDispatches, 1);
  const outcomeReopened = await openNexoContinuityOwner({
    filePath: lostOutcome.continuityPath, effectVerifiers: lostOutcome.contracts.verifiers
  });
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
  assert.equal(entryResult.dispatchAttempted, true);
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
    snapshot: {
      missions: [{
        missionId: "generic-mission",
        status: "planned",
        steps: [{ id: "step-1", action: "generic_write", target: "alpha", status: "planned", dependsOn: [] }]
      }],
      effectJournal: []
    }
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

console.log("Nexo Chronicle owner-backed runtime tests passed");
