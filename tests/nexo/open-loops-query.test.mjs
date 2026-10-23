import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createNexoContinuityStore } from "../../src/nexo/core/continuity-store.mjs";
import { NEXO_CONTINUITY_SCHEMA } from "../../src/nexo/core/continuity-snapshot.mjs";
import { recordNexoMissionInSnapshot } from "../../src/nexo/core/continuity-operations.mjs";
import { loadNexoOpenLoops } from "../../src/nexo/application/index.mjs";

const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-open-loops-"));
try {
  const missingPath = path.join(root, "missing.json");
  const missing = await loadNexoOpenLoops(missingPath);
  assert.equal(missing.status, "blocked");
  assert.equal(missing.code, "NEXO_CONTINUITY_STORE_NOT_FOUND");
  await assert.rejects(fs.access(missingPath), { code: "ENOENT" },
    "Open Loops must not fabricate an empty continuity store");

  assert.equal((await loadNexoOpenLoops(" ")).code, "NEXO_STATUS_CONTINUITY_PATH_REQUIRED");

  const filePath = path.join(root, "continuity.json");
  const store = createNexoContinuityStore({ filePath });
  const empty = {
    schema: NEXO_CONTINUITY_SCHEMA,
    schemaVersion: 1,
    missions: [],
    attempts: [],
    doNotRepeat: [],
    executions: [],
    effectJournal: []
  };
  assert.equal((await store.initialize(empty)).status, "committed");
  assert.deepEqual(await loadNexoOpenLoops(filePath), {
    status: "loaded", code: null, storeRevision: 0,
    missionLoops: [], effectObligations: [],
    authorization: "NOT_EVALUATED", dispatchAttempted: false
  }, "a valid empty snapshot is distinct from a missing store");

  let candidate = recordNexoMissionInSnapshot(empty, {
    missionId: "mission-open",
    objective: "local_analysis",
    status: "planned",
    steps: [{
      id: "step-open",
      action: "local_analysis",
      target: { privateTarget: "DO_NOT_RETURN_THIS" },
      status: "planned",
      dependsOn: []
    }]
  });
  candidate.effectJournal.push({
    idempotencyKey: "mission-open:step-open",
    missionId: "mission-open",
    stepId: "step-open",
    action: "local_analysis",
    target: { privateTarget: "DO_NOT_RETURN_THIS" },
    status: "prepared"
  });
  candidate.effectJournal.push({
    idempotencyKey: "mission-open:step-open",
    missionId: "mission-open",
    stepId: "step-open",
    action: "local_analysis",
    target: { privateTarget: "DO_NOT_RETURN_THIS" },
    status: "reconciled_observed"
  });
  candidate.effectJournal.push({
    idempotencyKey: "mission-open:step-open",
    missionId: "mission-open",
    stepId: "step-open",
    action: "local_analysis",
    target: { privateTarget: "DO_NOT_RETURN_THIS" },
    status: "settled_observed"
  });
  assert.equal((await store.commitIfCurrent(0, candidate)).status, "committed");

  const before = await fs.readFile(filePath, "utf8");
  const beforeStat = await fs.stat(filePath);
  const result = await loadNexoOpenLoops(filePath);
  const after = await fs.readFile(filePath, "utf8");
  const afterStat = await fs.stat(filePath);

  assert.equal(result.status, "loaded");
  assert.equal(result.code, null);
  assert.equal(result.storeRevision, 1);
  assert.equal(result.authorization, "NOT_EVALUATED");
  assert.equal(result.dispatchAttempted, false);
  assert.deepEqual(result.missionLoops, [{
    missionId: "mission-open",
    status: "blocked",
    objective: "reconcile_prepared_effect",
    openSteps: [{
      stepId: "step-open",
      action: "local_analysis",
      status: "blocked",
      blockCode: "NEXO_EFFECT_RECONCILIATION_REQUIRED"
    }]
  }], "a prepared effect must preserve the canonical reconciliation block");
  assert.deepEqual(result.effectObligations, [
    { missionId: "mission-open", stepId: "step-open", action: "local_analysis", status: "prepared" },
    { missionId: "mission-open", stepId: "step-open", action: "local_analysis", status: "reconciled_observed" }
  ], "settled-observed records must not be reported as open obligations");
  assert.equal(JSON.stringify(result).includes("DO_NOT_RETURN_THIS"), false,
    "Open Loops must not expose persisted target payloads");
  assert.equal(result.dispatchAttempted, false);
  assert.equal(after, before, "Open Loops must not mutate continuity bytes");
  assert.equal(afterStat.mtimeMs, beforeStat.mtimeMs, "Open Loops must not rewrite continuity");
  assert.deepEqual(await loadNexoOpenLoops(filePath), result,
    "the same continuity revision must produce a deterministic projection");

  // A planned mission without effect-journal entries is surfaced directly,
  // not hidden behind a synthetic journal obligation.
  const plannedPath = path.join(root, "planned-continuity.json");
  const plannedStore = createNexoContinuityStore({ filePath: plannedPath });
  assert.equal((await plannedStore.initialize(empty)).status, "committed");
  const plannedSnapshot = recordNexoMissionInSnapshot(empty, {
    missionId: "mission-planned",
    objective: "local_analysis",
    status: "planned",
    steps: [{ id: "step-planned", action: "local_analysis", status: "planned", dependsOn: [] }]
  });
  assert.equal((await plannedStore.commitIfCurrent(0, plannedSnapshot)).status, "committed");
  const plannedResult = await loadNexoOpenLoops(plannedPath);
  assert.equal(plannedResult.status, "loaded");
  assert.deepEqual(plannedResult.missionLoops, [{
    missionId: "mission-planned",
    status: "planned",
    objective: "local_analysis",
    openSteps: [{ stepId: "step-planned", action: "local_analysis", status: "planned" }]
  }]);

  // A failed step stays visible as a replan-required loop.
  const failedPath = path.join(root, "failed-continuity.json");
  const failedStore = createNexoContinuityStore({ filePath: failedPath });
  assert.equal((await failedStore.initialize(empty)).status, "committed");
  const failedSnapshot = recordNexoMissionInSnapshot(empty, {
    missionId: "mission-failed",
    objective: "local_analysis",
    status: "planned",
    steps: [{ id: "step-failed", action: "local_analysis", status: "planned", dependsOn: [] }]
  });
  failedSnapshot.missions[0].steps[0].status = "failed";
  assert.equal((await failedStore.commitIfCurrent(0, failedSnapshot)).status, "committed");
  const failedResult = await loadNexoOpenLoops(failedPath);
  assert.equal(failedResult.status, "loaded");
  assert.deepEqual(failedResult.missionLoops, [{
    missionId: "mission-failed",
    status: "needs_replan",
    objective: "replan_after_failure",
    openSteps: [{ stepId: "step-failed", action: "local_analysis", status: "failed" }]
  }]);

  // A persisted terminal claim unsupported by reconstruction must block the
  // inventory instead of silently omitting or trusting the claimed completion.
  const discrepancyPath = path.join(root, "discrepancy-continuity.json");
  const discrepancyStore = createNexoContinuityStore({ filePath: discrepancyPath });
  assert.equal((await discrepancyStore.initialize(empty)).status, "committed");
  const discrepancySnapshot = recordNexoMissionInSnapshot(empty, {
    missionId: "mission-discrepant",
    objective: "local_analysis",
    status: "planned",
    steps: [{ id: "step-discrepant", action: "local_analysis", status: "planned", dependsOn: [] }]
  });
  discrepancySnapshot.missions[0].status = "completed";
  assert.equal((await discrepancyStore.commitIfCurrent(0, discrepancySnapshot)).status, "committed");
  const discrepancy = await loadNexoOpenLoops(discrepancyPath);
  assert.equal(discrepancy.status, "blocked");
  assert.equal(discrepancy.code, "NEXO_MISSION_STATUS_DISCREPANCY");

  // Corrupt continuity must not be misreported as an empty inventory.
  const corruptPath = path.join(root, "corrupt-continuity.json");
  await fs.writeFile(corruptPath, "{not-json", "utf8");
  const corrupt = await loadNexoOpenLoops(corruptPath);
  assert.equal(corrupt.status, "blocked");
  assert.equal(corrupt.code, "NEXO_CONTINUITY_STORE_INVALID_JSON");

  // An unresolved journal row without stable mission/step/action linkage must
  // not be silently omitted or turned into a fabricated identity.
  const malformed = {
    ...candidate,
    effectJournal: [...candidate.effectJournal, { status: "reconciled_observed" }]
  };
  assert.equal((await store.commitIfCurrent(1, malformed)).status, "committed");
  const unknownLinkage = await loadNexoOpenLoops(filePath);
  assert.equal(unknownLinkage.status, "blocked");
  assert.equal(unknownLinkage.code, "NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN");
  assert.equal(unknownLinkage.authorization, "NOT_EVALUATED");
  assert.equal(unknownLinkage.dispatchAttempted, false);

  // Present-looking identifiers are not enough: an unresolved journal row
  // must resolve to the actual canonical mission and step in this snapshot.
  const orphanLinkageSnapshot = {
    ...candidate,
    effectJournal: [...candidate.effectJournal, {
      idempotencyKey: "ghost:step",
      missionId: "ghost",
      stepId: "ghost-step",
      action: "local_analysis",
      status: "reconciled_observed"
    }]
  };
  assert.equal((await store.commitIfCurrent(2, orphanLinkageSnapshot)).status, "committed");
  const orphanLinkage = await loadNexoOpenLoops(filePath);
  assert.equal(orphanLinkage.status, "blocked");
  assert.equal(orphanLinkage.code, "NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN");

  // The journal action must also agree with the linked canonical step.
  const actionMismatchSnapshot = {
    ...candidate,
    effectJournal: [...candidate.effectJournal, {
      idempotencyKey: "mission-open:step-open",
      missionId: "mission-open",
      stepId: "step-open",
      action: "different_action",
      status: "reconciled_observed"
    }]
  };
  assert.equal((await store.commitIfCurrent(3, actionMismatchSnapshot)).status, "committed");
  const actionMismatch = await loadNexoOpenLoops(filePath);
  assert.equal(actionMismatch.status, "blocked");
  assert.equal(actionMismatch.code, "NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN");

  // Unknown journal states must not disappear into an empty successful
  // inventory, including when there are no missions to reconstruct.
  const unknownJournalPath = path.join(root, "unknown-journal-continuity.json");
  const unknownJournalStore = createNexoContinuityStore({ filePath: unknownJournalPath });
  const unknownJournalSnapshot = {
    ...empty,
    effectJournal: [{ status: "future_unrecognized_state" }]
  };
  assert.equal((await unknownJournalStore.initialize(unknownJournalSnapshot)).status, "committed");
  const unknownJournal = await loadNexoOpenLoops(unknownJournalPath);
  assert.equal(unknownJournal.status, "blocked");
  assert.equal(unknownJournal.code, "NEXO_OPEN_LOOPS_JOURNAL_STATUS_UNKNOWN");
  assert.equal(unknownJournal.authorization, "NOT_EVALUATED");
  assert.equal(unknownJournal.dispatchAttempted, false);

  // The projection must fail explicitly rather than silently truncate its
  // inventory when the documented output ceiling is exceeded.
  const capPath = path.join(root, "cap-continuity.json");
  const capStore = createNexoContinuityStore({ filePath: capPath });
  assert.equal((await capStore.initialize(empty)).status, "committed");
  let capSnapshot = empty;
  for (let missionIndex = 0; missionIndex < 4; missionIndex += 1) {
    capSnapshot = recordNexoMissionInSnapshot(capSnapshot, {
      missionId: `cap-mission-${missionIndex}`,
      objective: "local_analysis",
      status: "planned",
      steps: Array.from({ length: 256 }, (_, stepIndex) => ({
        id: `step-${stepIndex}`,
        action: "local_analysis",
        status: "planned",
        dependsOn: []
      }))
    });
  }
  assert.equal((await capStore.commitIfCurrent(0, capSnapshot)).status, "committed");
  const capped = await loadNexoOpenLoops(capPath);
  assert.equal(capped.status, "blocked");
  assert.equal(capped.code, "NEXO_OPEN_LOOPS_OUTPUT_LIMIT_EXCEEDED");
  assert.equal(capped.outputLimit, 1000);
  assert.equal(capped.dispatchAttempted, false);
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

console.log("Nexo Open Loops: bounded read-only projection, journal separation, privacy and UNKNOWN linkage OK.");
