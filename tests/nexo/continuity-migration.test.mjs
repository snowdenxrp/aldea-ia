import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";

const dir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-continuity-migration-"));
const filePath = path.join(dir, ".nexo-continuity.json");

const legacyMemory = {
  version: 4,
  runs: [{ id: "lumina-run-must-not-migrate" }],
  lessons: [{ id: "lumina-lesson-must-not-migrate" }],
  patterns: [{ id: "lumina-pattern-must-not-migrate" }],
  nexo: {
    missions: [{
      missionId: "mission-legacy-1",
      status: "planned",
      objective: "preserve continuity",
      steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned" }]
    }],
    attempts: [{ missionId: "mission-legacy-1", stepId: "step-1", status: "blocked" }],
    doNotRepeat: [{ action: "repair_agent_needs", target: "bruno" }],
    executions: [{ missionId: "mission-legacy-1", stepId: "step-1", result: { status: "blocked" } }],
    effectJournal: [{
      idempotencyKey: "mission-legacy-1:step-1",
      missionId: "mission-legacy-1",
      stepId: "step-1",
      action: "repair_agent_state",
      target: "alex",
      status: "prepared",
      environmentStateRevision: 10,
      at: "2026-10-18T00:00:00.000Z"
    }]
  }
};

try {
  const migrated = await openNexoContinuityOwner({ filePath, legacyMemory });
  assert.equal(migrated.current.storeRevision, 0);
  assert.deepEqual(migrated.current.snapshot.missions, legacyMemory.nexo.missions);
  assert.deepEqual(migrated.current.snapshot.attempts, legacyMemory.nexo.attempts);
  assert.deepEqual(migrated.current.snapshot.doNotRepeat, legacyMemory.nexo.doNotRepeat);
  assert.deepEqual(migrated.current.snapshot.executions, legacyMemory.nexo.executions);
  assert.deepEqual(migrated.current.snapshot.effectJournal, legacyMemory.nexo.effectJournal);
  assert.equal("runs" in migrated.current.snapshot, false);
  assert.equal("lessons" in migrated.current.snapshot, false);
  assert.equal("patterns" in migrated.current.snapshot, false);
  assert.equal(migrated.current.snapshot.effectJournal[0].status, "prepared");

  // Reopening prefers the canonical Nexo store and never merges stale legacy data.
  const reopened = await openNexoContinuityOwner({
    filePath,
    legacyMemory: { version: 4, runs: [], lessons: [], patterns: [], nexo: {
      missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: []
    } }
  });
  assert.deepEqual(reopened.current.snapshot, migrated.current.snapshot);
  assert.equal(reopened.current.storeRevision, migrated.current.storeRevision);

  // Corruption of the canonical store must not silently fall back to legacy data.
  await fs.writeFile(filePath, "{corrupt", "utf8");
  await assert.rejects(
    () => openNexoContinuityOwner({ filePath, legacyMemory }),
    error => error?.code === "NEXO_CONTINUITY_STORE_INVALID_JSON"
  );
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}

const missingDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-continuity-missing-"));
try {
  await assert.rejects(
    () => openNexoContinuityOwner({ filePath: path.join(missingDir, "nexo.json") }),
    error => error?.code === "NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN",
    "missing prior continuity must not be fabricated as empty by default"
  );
  const fresh = await openNexoContinuityOwner({
    filePath: path.join(missingDir, "fresh-nexo.json"),
    allowEmptyInitialization: true
  });
  assert.equal(fresh.current.storeRevision, 0);
  assert.deepEqual(fresh.current.snapshot.missions, []);
  assert.deepEqual(fresh.current.snapshot.effectJournal, []);
} finally {
  await fs.rm(missingDir, { recursive: true, force: true });
}

const lineageDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-execution-lineage-"));
try {
  const opened = await openNexoContinuityOwner({
    filePath: path.join(lineageDir, "nexo.json"),
    legacyMemory
  });
  const operation = {
    idempotencyKey: "mission-legacy-1:step-1",
    missionId: "mission-legacy-1",
    stepId: "step-1",
    action: "repair_agent_state",
    target: "alex",
    environmentStateRevision: 10
  };
  const missingRevision = await opened.owner.recordExecutionLineage({
    expectedRevision: 0,
    operation: (({ environmentStateRevision, ...withoutRevision }) => withoutRevision)(operation),
    result: { status: "completed", verified: true }
  });
  assert.equal(missingRevision.status, "blocked");
  assert.equal(missingRevision.code, "NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 0,
    "missing repair revision must not append lineage or advance the Nexo store");

  const mismatchedRevision = await opened.owner.recordExecutionLineage({
    expectedRevision: 0,
    operation: { ...operation, environmentStateRevision: 11 },
    result: { status: "completed", verified: true }
  });
  assert.equal(mismatchedRevision.status, "blocked");
  assert.equal(mismatchedRevision.code, "NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 0,
    "mismatched environment revision must not append lineage or advance the Nexo store");

  const recorded = await opened.owner.recordExecutionLineage({
    expectedRevision: 0,
    operation,
    // Even a caller-supplied terminal-looking result is lineage, not proof.
    result: { status: "completed", verified: true, evidence: { source: "caller" } }
  });
  assert.equal(recorded.status, "committed");
  assert.equal(recorded.journalSettled, false);
  const afterLineage = await opened.owner.loadCurrent();
  assert.equal(afterLineage.storeRevision, 1);
  assert.equal(afterLineage.snapshot.executions.length, 2);
  assert.equal(afterLineage.snapshot.effectJournal[0].status, "prepared",
    "execution lineage must never settle the unresolved effect journal");
  const reconstructed = await opened.owner.reconstructMission("mission-legacy-1");
  assert.equal(reconstructed.status, "reconstructed");
  assert.equal(reconstructed.mission.status, "blocked");
  assert.equal(reconstructed.mission.objective, "reconcile_prepared_effect");

  const replayWithWrongBaseline = await opened.owner.recordExecutionLineage({
    expectedRevision: 1,
    operation: { ...operation, environmentStateRevision: 11 },
    result: { status: "completed", verified: true, evidence: { source: "caller" } }
  });
  assert.equal(replayWithWrongBaseline.status, "blocked");
  assert.equal(replayWithWrongBaseline.code, "NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 1,
    "lineage replay with a different PREPARED baseline must not mutate continuity");

  const duplicate = await opened.owner.recordExecutionLineage({
    expectedRevision: 1,
    operation,
    result: { status: "failed", verified: false }
  });
  assert.equal(duplicate.status, "blocked");
  assert.equal(duplicate.code, "NEXO_EXECUTION_RESULT_MISMATCH");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 1,
    "conflicting lineage replay must not rewrite or advance the first lineage record");

  const stale = await opened.owner.recordExecutionLineage({
    expectedRevision: 0,
    operation: { ...operation, idempotencyKey: "mission-legacy-1:step-1" },
    result: { status: "blocked" }
  });
  assert.equal(stale.status, "conflict");
} finally {
  await fs.rm(lineageDir, { recursive: true, force: true });
}

const noPreparedDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-lineage-without-prepared-"));
try {
  const opened = await openNexoContinuityOwner({
    filePath: path.join(noPreparedDir, "nexo.json"),
    allowEmptyInitialization: true
  });
  const admitted = await opened.owner.recordMission({
    expectedRevision: 0,
    mission: {
      missionId: "mission-no-prepared",
      status: "planned",
      objective: "must not create execution lineage before PREPARED",
      steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned" }]
    }
  });
  assert.equal(admitted.status, "committed");
  const rejected = await opened.owner.recordExecutionLineage({
    expectedRevision: 1,
    operation: {
      idempotencyKey: "mission-no-prepared:step-1",
      missionId: "mission-no-prepared",
      stepId: "step-1",
      action: "repair_agent_state",
      target: "alex"
    },
    result: { status: "completed" }
  });
  assert.equal(rejected.status, "blocked");
  assert.equal(rejected.code, "NEXO_EXECUTION_PREPARED_OBLIGATION_REQUIRED");
  const unchanged = await opened.owner.loadCurrent();
  assert.equal(unchanged.storeRevision, 1);
  assert.equal(unchanged.snapshot.executions.length, 0);
  assert.equal(unchanged.snapshot.effectJournal.length, 0);
} finally {
  await fs.rm(noPreparedDir, { recursive: true, force: true });
}

const mismatchedAttemptDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-mismatched-attempt-"));
try {
  const mismatchedAttemptMemory = structuredClone(legacyMemory);
  mismatchedAttemptMemory.nexo.missions[0].status = "planned";
  mismatchedAttemptMemory.nexo.missions[0].objective = "generic_write";
  mismatchedAttemptMemory.nexo.missions[0].steps[0].action = "generic_write";
  mismatchedAttemptMemory.nexo.missions[0].steps[0].target = "alpha";
  mismatchedAttemptMemory.nexo.effectJournal = [];
  mismatchedAttemptMemory.nexo.attempts = [{
    missionId: "mission-legacy-1",
    stepId: "step-1",
    action: "different_action",
    target: "different-target",
    status: "completed",
    evidence: { verified: true, kind: "unrelated-operation", source: "unrelated-reader" },
    at: "2026-10-18T00:00:00.000Z"
  }];
  const opened = await openNexoContinuityOwner({
    filePath: path.join(mismatchedAttemptDir, "nexo.json"),
    legacyMemory: mismatchedAttemptMemory
  });
  const reconstructed = await opened.owner.reconstructMission("mission-legacy-1");
  assert.equal(reconstructed.status, "reconstructed");
  assert.equal(reconstructed.mission.steps[0].status, "blocked",
    "an attempt for a different action/target must not complete or re-enable this canonical step");
  assert.equal(reconstructed.mission.steps[0].blockReason.code, "NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH");
  assert.equal(reconstructed.mission.steps[0].result, undefined);
} finally {
  await fs.rm(mismatchedAttemptDir, { recursive: true, force: true });
}

const unverifiedCompletionDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-unverified-completion-attempt-"));
try {
  const unverifiedCompletionMemory = structuredClone(legacyMemory);
  unverifiedCompletionMemory.nexo.missions[0].status = "planned";
  unverifiedCompletionMemory.nexo.missions[0].objective = "repair_agent_state";
  unverifiedCompletionMemory.nexo.missions[0].steps[0].status = "planned";
  unverifiedCompletionMemory.nexo.attempts = [{
    missionId: "mission-legacy-1",
    stepId: "step-1",
    action: "repair_agent_state",
    target: "alex",
    status: "completed",
    evidence: { verified: false, kind: "caller-claim", source: "caller" },
    at: "2026-10-18T00:00:00.000Z"
  }];
  unverifiedCompletionMemory.nexo.effectJournal = [];
  const opened = await openNexoContinuityOwner({
    filePath: path.join(unverifiedCompletionDir, "nexo.json"),
    legacyMemory: unverifiedCompletionMemory
  });
  const reconstructed = await opened.owner.reconstructMission("mission-legacy-1");
  assert.equal(reconstructed.mission.steps[0].status, "blocked");
  assert.equal(reconstructed.mission.steps[0].blockReason.code, "NEXO_COMPLETION_EVIDENCE_UNVERIFIED");
} finally {
  await fs.rm(unverifiedCompletionDir, { recursive: true, force: true });
}

const blockedStepAdmissionAfterClaimDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-blocked-step-admission-after-claim-"));
try {
  const claimMemory = structuredClone(legacyMemory);
  claimMemory.nexo.missions[0].status = "planned";
  claimMemory.nexo.missions[0].steps[0].status = "planned";
  claimMemory.nexo.attempts = [{
    missionId: "mission-legacy-1",
    stepId: "step-1",
    action: "repair_agent_state",
    target: "alex",
    status: "completed",
    evidence: { verified: true, kind: "caller-asserted", source: "legacy-runtime" },
    at: "2026-10-19T00:00:00.000Z"
  }];
  claimMemory.nexo.effectJournal = [];
  const opened = await openNexoContinuityOwner({
    filePath: path.join(blockedStepAdmissionAfterClaimDir, "nexo.json"),
    legacyMemory: claimMemory
  });
  const reconstructed = await opened.owner.reconstructMission("mission-legacy-1");
  assert.equal(reconstructed.mission.steps[0].status, "blocked");
  const prepared = await opened.owner.recordPrepared({
    expectedRevision: 0,
    operation: {
      idempotencyKey: "mission-legacy-1:step-1",
      missionId: "mission-legacy-1",
      stepId: "step-1",
      action: "repair_agent_state",
      target: "alex",
      environmentStateRevision: 0
    }
  });
  assert.equal(prepared.status, "blocked",
    "PREPARED admission must use the reconstructed current-step status, not only the raw plan");
  assert.equal(prepared.code, "NEXO_PREPARED_STEP_NOT_RUNNABLE");
  const current = await opened.owner.loadCurrent();
  assert.equal(current.storeRevision, 0);
  assert.equal(current.snapshot.effectJournal.length, 0);
} finally {
  await fs.rm(blockedStepAdmissionAfterClaimDir, { recursive: true, force: true });
}

function chronicleSettlementMemory({ withCompletedAttempt = false, evidence = {
  kind: "persisted-chronicle-entry",
  operationKey: "mission-legacy-1:step-1",
  content: "hello Nexo"
} } = {}) {
  const memory = structuredClone(legacyMemory);
  memory.nexo.missions[0].status = "planned";
  memory.nexo.missions[0].objective = "chronicle_append";
  memory.nexo.missions[0].steps[0] = {
    id: "step-1",
    action: "chronicle_append",
    target: { content: "hello Nexo" },
    status: "planned",
    dependsOn: []
  };
  memory.nexo.attempts = withCompletedAttempt ? [{
    missionId: "mission-legacy-1",
    stepId: "step-1",
    action: "chronicle_append",
    target: { content: "hello Nexo" },
    status: "completed",
    evidence: { verified: true, kind: "nexo-chronicle-persisted-invariant", source: "nexo-chronicle-store" },
    at: "2026-10-19T00:00:00.000Z"
  }] : [];
  memory.nexo.effectJournal = [{
    idempotencyKey: "mission-legacy-1:step-1",
    missionId: "mission-legacy-1",
    stepId: "step-1",
    action: "chronicle_append",
    target: { content: "hello Nexo" },
    status: "settled_observed",
    settlement: {
      status: "applied",
      observedRevision: 1,
      source: "nexo-chronicle-store",
      evidence,
      observedAt: "2026-10-19T00:00:00.000Z"
    }
  }];
  return memory;
}

const chronicleNoOutcomeDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-chronicle-settled-no-outcome-"));
try {
  const opened = await openNexoContinuityOwner({
    filePath: path.join(chronicleNoOutcomeDir, "nexo.json"),
    legacyMemory: chronicleSettlementMemory()
  });
  const reconstructed = await opened.owner.reconstructMission("mission-legacy-1");
  assert.equal(reconstructed.mission.steps[0].status, "blocked",
    "a settled Chronicle operation without a terminal attempt must not reconstruct as executable");
  assert.equal(reconstructed.mission.steps[0].blockReason.code, "NEXO_CHRONICLE_OUTCOME_REPLAY_REQUIRED");
} finally {
  await fs.rm(chronicleNoOutcomeDir, { recursive: true, force: true });
}

const chronicleInvalidSettlementDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-chronicle-invalid-settlement-with-outcome-"));
try {
  const opened = await openNexoContinuityOwner({
    filePath: path.join(chronicleInvalidSettlementDir, "nexo.json"),
    legacyMemory: chronicleSettlementMemory({ withCompletedAttempt: true, evidence: null })
  });
  const reconstructed = await opened.owner.reconstructMission("mission-legacy-1");
  assert.equal(reconstructed.mission.steps[0].status, "blocked",
    "a completed attempt cannot override a Chronicle settlement without evidence");
  assert.equal(reconstructed.mission.steps[0].blockReason.code, "NEXO_CHRONICLE_SETTLEMENT_REQUIRED");
} finally {
  await fs.rm(chronicleInvalidSettlementDir, { recursive: true, force: true });
}

const unsupportedCompletionDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-unsupported-completion-reconstruction-"));
try {
  const unsupportedCompletionMemory = structuredClone(legacyMemory);
  unsupportedCompletionMemory.nexo.missions[0].status = "planned";
  unsupportedCompletionMemory.nexo.missions[0].objective = "repair_agent_state";
  unsupportedCompletionMemory.nexo.missions[0].steps[0].status = "planned";
  unsupportedCompletionMemory.nexo.attempts = [{
    missionId: "mission-legacy-1",
    stepId: "step-1",
    action: "repair_agent_state",
    target: "alex",
    status: "completed",
    evidence: { verified: true, kind: "caller-asserted", source: "legacy-runtime" },
    at: "2026-10-19T00:00:00.000Z"
  }];
  unsupportedCompletionMemory.nexo.effectJournal = [];
  const opened = await openNexoContinuityOwner({
    filePath: path.join(unsupportedCompletionDir, "nexo.json"),
    legacyMemory: unsupportedCompletionMemory
  });
  const reconstructed = await opened.owner.reconstructMission("mission-legacy-1");
  assert.equal(reconstructed.mission.steps[0].status, "blocked",
    "caller-labelled completion for a mutating action must not bypass the canonical goal-verification gate");
  assert.equal(reconstructed.mission.steps[0].blockReason.code, "NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED");
} finally {
  await fs.rm(unsupportedCompletionDir, { recursive: true, force: true });
}

const localAnalysisCompletionDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-local-analysis-completion-reconstruction-"));
try {
  const localAnalysisMemory = structuredClone(legacyMemory);
  localAnalysisMemory.nexo.missions[0].status = "planned";
  localAnalysisMemory.nexo.missions[0].objective = "local_analysis";
  localAnalysisMemory.nexo.missions[0].steps[0] = {
    id: "step-1", action: "local_analysis", target: "alex", status: "planned", dependsOn: []
  };
  localAnalysisMemory.nexo.attempts = [{
    missionId: "mission-legacy-1",
    stepId: "step-1",
    action: "local_analysis",
    target: "alex",
    status: "completed",
    evidence: { verified: true, kind: "local-analysis", source: "nexo-local-analysis" },
    at: "2026-10-19T00:00:00.000Z"
  }];
  localAnalysisMemory.nexo.effectJournal = [];
  const opened = await openNexoContinuityOwner({
    filePath: path.join(localAnalysisCompletionDir, "nexo.json"),
    legacyMemory: localAnalysisMemory
  });
  const reconstructed = await opened.owner.reconstructMission("mission-legacy-1");
  assert.equal(reconstructed.mission.steps[0].status, "completed",
    "the explicitly non-mutating local_analysis action remains eligible for reconstruction");
} finally {
  await fs.rm(localAnalysisCompletionDir, { recursive: true, force: true });
}

const observedSettlementDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-observed-settlement-"));
try {
  const observedMemory = structuredClone(legacyMemory);
  observedMemory.nexo.effectJournal[0] = {
    ...observedMemory.nexo.effectJournal[0],
    status: "settled_observed",
    settlement: {
      kind: "persisted-repair-invariant-observed",
      source: "world-state.json",
      observation: "desired_state_present",
      environmentStateRevision: 11,
      preparedEnvironmentStateRevision: 10,
      causalAttribution: "not_claimed",
      at: "2026-10-18T00:00:00.000Z"
    }
  };
  const opened = await openNexoContinuityOwner({
    filePath: path.join(observedSettlementDir, "nexo.json"),
    legacyMemory: observedMemory
  });
  const reconstructed = await opened.owner.reconstructMission("mission-legacy-1");
  assert.equal(reconstructed.status, "reconstructed");
  assert.equal(reconstructed.mission.status, "blocked");
  assert.equal(reconstructed.mission.objective, "verify_observed_repair_goal");
  assert.equal(reconstructed.mission.steps[0].status, "blocked");
  assert.equal(reconstructed.mission.steps[0].blockReason.code, "NEXO_REPAIR_SETTLED_BY_OBSERVATION");
  assert.equal(reconstructed.mission.steps[0].blockReason.next, "verify_mission_goal_without_redispatch");
} finally {
  await fs.rm(observedSettlementDir, { recursive: true, force: true });
}


const outcomeDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owner-outcome-"));
try {
  const opened = await openNexoContinuityOwner({
    filePath: path.join(outcomeDir, "nexo.json"),
    allowEmptyInitialization: true
  });
  const mission = {
    missionId: "owner-outcome-mission",
    status: "planned",
    objective: "verify owner-backed outcome persistence",
    steps: [{ id: "step-1", action: "local_analysis", target: { item: "alpha" }, status: "planned", dependsOn: [] }]
  };
  assert.equal((await opened.owner.recordMission({ expectedRevision: 0, mission })).status, "committed");

  const incompleteEvidence = await opened.owner.recordOutcome({
    expectedRevision: 1,
    outcome: {
      missionId: mission.missionId, stepId: "step-1", action: "local_analysis",
      target: { item: "alpha" }, status: "completed",
      evidence: { verified: true, kind: "test-result" }
    }
  });
  assert.equal(incompleteEvidence.status, "failed");
  assert.equal(incompleteEvidence.code, "NEXO_COMPLETION_EVIDENCE_UNVERIFIED");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 1);

  const completed = await opened.owner.recordOutcome({
    expectedRevision: 1,
    outcome: {
      missionId: mission.missionId, stepId: "step-1", action: "local_analysis",
      target: { item: "alpha" }, status: "completed",
      evidence: { verified: true, kind: "test-result", source: "continuity-migration-regression" }
    }
  });
  assert.equal(completed.status, "committed");
  assert.equal(completed.journalSettled, false);
  assert.equal(completed.authorization, "NOT_EVALUATED");
  assert.equal(completed.storeRevision, 2);
  assert.equal((await opened.owner.reconstructMission(mission.missionId)).mission.steps[0].status, "completed");

  const replay = await opened.owner.recordOutcome({
    expectedRevision: 2,
    outcome: {
      missionId: mission.missionId, stepId: "step-1", action: "local_analysis",
      target: { item: "alpha" }, status: "failed",
      evidence: { verified: false, kind: "late-replay", source: "regression" }
    }
  });
  assert.equal(replay.status, "blocked");
  assert.equal(replay.code, "NEXO_OUTCOME_RESULT_MISMATCH");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 2);
  assert.equal((await opened.owner.reconstructMission(mission.missionId)).mission.steps[0].status, "completed");
} finally {
  await fs.rm(outcomeDir, { recursive: true, force: true });
}

const unresolvedOutcomeDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owner-outcome-prepared-"));
try {
  const opened = await openNexoContinuityOwner({
    filePath: path.join(unresolvedOutcomeDir, "nexo.json"),
    allowEmptyInitialization: true
  });
  const mission = {
    missionId: "owner-outcome-prepared",
    status: "planned",
    objective: "preserve unresolved effect",
    steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] }]
  };
  assert.equal((await opened.owner.recordMission({ expectedRevision: 0, mission })).status, "committed");
  const operation = {
    idempotencyKey: "owner-outcome-prepared:step-1",
    missionId: mission.missionId, stepId: "step-1",
    action: "repair_agent_state", target: "alex", environmentStateRevision: 0
  };
  assert.equal((await opened.owner.recordPrepared({ expectedRevision: 1, operation })).status, "committed");

  const falseCompletion = await opened.owner.recordOutcome({
    expectedRevision: 2,
    outcome: {
      missionId: mission.missionId, stepId: "step-1", action: "repair_agent_state",
      target: "alex", status: "completed",
      evidence: { verified: true, kind: "adapter-result", source: "caller" }
    }
  });
  assert.equal(falseCompletion.status, "blocked");
  assert.equal(falseCompletion.code, "NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 2);

  const blocked = await opened.owner.recordOutcome({
    expectedRevision: 2,
    outcome: {
      missionId: mission.missionId, stepId: "step-1", action: "repair_agent_state",
      target: "alex", status: "blocked",
      evidence: { verified: false, kind: "runtime-outcome", source: "continuity-migration-regression" }
    }
  });
  assert.equal(blocked.status, "blocked");
  assert.equal(blocked.code, "NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED");
  assert.equal(blocked.journalSettled, false);
  const current = await opened.owner.loadCurrent();
  assert.equal(current.storeRevision, 2, "terminal outcomes must not be committed while PREPARED is unresolved");
  assert.equal(current.snapshot.effectJournal[0].status, "prepared");
  assert.equal(current.snapshot.attempts.some(item => item.missionId === mission.missionId && item.stepId === "step-1"), false);
  const recovered = await opened.owner.reconstructMission(mission.missionId);
  assert.equal(recovered.mission.status, "blocked");
  assert.equal(recovered.mission.objective, "reconcile_prepared_effect");
} finally {
  await fs.rm(unresolvedOutcomeDir, { recursive: true, force: true });
}

const blockedStepAdmissionDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-blocked-step-admission-"));
try {
  const blockedStepMemory = structuredClone(legacyMemory);
  blockedStepMemory.nexo.missions[0].status = "planned";
  blockedStepMemory.nexo.missions[0].objective = "repair_agent_state";
  blockedStepMemory.nexo.missions[0].steps[0] = {
    id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: []
  };
  blockedStepMemory.nexo.attempts = [{
    missionId: "mission-legacy-1", stepId: "step-1",
    action: "repair_agent_state", target: "alex", status: "completed",
    evidence: { verified: true, kind: "caller-asserted", source: "legacy-runtime" },
    at: "2026-10-19T00:00:00.000Z"
  }];
  blockedStepMemory.nexo.effectJournal = [];
  const opened = await openNexoContinuityOwner({
    filePath: path.join(blockedStepAdmissionDir, "nexo.json"),
    legacyMemory: blockedStepMemory
  });
  const reconstructed = await opened.owner.reconstructMission("mission-legacy-1");
  assert.equal(reconstructed.mission.steps[0].status, "blocked");
  const current = await opened.owner.loadCurrent();
  const prepared = await opened.owner.recordPrepared({
    expectedRevision: current.storeRevision,
    operation: {
      idempotencyKey: "mission-legacy-1:step-1",
      missionId: "mission-legacy-1", stepId: "step-1",
      action: "repair_agent_state", target: "alex", environmentStateRevision: 0
    }
  });
  assert.equal(prepared.status, "blocked",
    "PREPARED admission must use reconstructed step status, not the plan's stale planned status");
  assert.equal(prepared.code, "NEXO_PREPARED_STEP_NOT_RUNNABLE");
  const after = await opened.owner.loadCurrent();
  assert.equal(after.storeRevision, current.storeRevision);
  assert.equal(after.snapshot.effectJournal.length, 0);
} finally {
  await fs.rm(blockedStepAdmissionDir, { recursive: true, force: true });
}

const planOnlyCompletedDependencyDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-plan-only-completed-dependency-"));
try {
  const opened = await openNexoContinuityOwner({
    filePath: path.join(planOnlyCompletedDependencyDir, "nexo.json"),
    allowEmptyInitialization: true
  });
  const mission = {
    missionId: "mission-plan-only-completed-dependency",
    status: "planned",
    objective: "dependency must be backed by a canonical outcome",
    steps: [
      { id: "step-1", action: "repair_agent_state", target: "alex", status: "completed", dependsOn: [] },
      { id: "step-2", action: "repair_agent_needs", target: "alex", status: "planned", dependsOn: ["step-1"] }
    ]
  };
  assert.equal((await opened.owner.recordMission({ expectedRevision: 0, mission })).status, "committed");
  const reconstructed = await opened.owner.reconstructMission(mission.missionId);
  assert.equal(reconstructed.mission.steps[0].status, "blocked",
    "plan status alone must not reconstruct a mutating dependency as completed");
  assert.equal(reconstructed.mission.steps[0].blockReason.code, "NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED");
  const prepared = await opened.owner.recordPrepared({
    expectedRevision: 1,
    operation: {
      idempotencyKey: "mission-plan-only-completed-dependency:step-2",
      missionId: mission.missionId,
      stepId: "step-2",
      action: "repair_agent_needs",
      target: "alex",
      environmentStateRevision: 0
    }
  });
  assert.equal(prepared.status, "blocked");
  assert.equal(prepared.code, "NEXO_PREPARED_DEPENDENCIES_UNMET");
  const current = await opened.owner.loadCurrent();
  assert.equal(current.storeRevision, 1);
  assert.equal(current.snapshot.effectJournal.length, 0);
} finally {
  await fs.rm(planOnlyCompletedDependencyDir, { recursive: true, force: true });
}

const preparedAdmissionDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owner-prepared-admission-"));
try {
  const opened = await openNexoContinuityOwner({
    filePath: path.join(preparedAdmissionDir, "nexo.json"),
    allowEmptyInitialization: true
  });
  const mission = {
    missionId: "owner-prepared-admission",
    status: "planned",
    objective: "enforce canonical step admission before PREPARED",
    steps: [
      { id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] },
      { id: "step-2", action: "repair_agent_needs", target: "alex", status: "planned", dependsOn: ["step-1"] }
    ]
  };
  assert.equal((await opened.owner.recordMission({ expectedRevision: 0, mission })).status, "committed");
  const blockedDependency = await opened.owner.recordPrepared({
    expectedRevision: 1,
    operation: {
      idempotencyKey: "owner-prepared-admission:step-2",
      missionId: mission.missionId, stepId: "step-2",
      action: "repair_agent_needs", target: "alex", environmentStateRevision: 0
    }
  });
  assert.equal(blockedDependency.status, "blocked");
  assert.equal(blockedDependency.code, "NEXO_PREPARED_DEPENDENCIES_UNMET");
  assert.equal((await opened.owner.loadCurrent()).storeRevision, 1);
  assert.equal((await opened.owner.loadCurrent()).snapshot.effectJournal.length, 0);

  const nonRunnableMission = {
    missionId: "owner-prepared-nonrunnable",
    status: "planned",
    objective: "must not prepare terminal step",
    steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "completed", dependsOn: [] }]
  };
  assert.equal((await opened.owner.recordMission({ expectedRevision: 1, mission: nonRunnableMission })).status, "committed");
  const blockedStatus = await opened.owner.recordPrepared({
    expectedRevision: 2,
    operation: {
      idempotencyKey: "owner-prepared-nonrunnable:step-1",
      missionId: nonRunnableMission.missionId, stepId: "step-1",
      action: "repair_agent_state", target: "alex", environmentStateRevision: 0
    }
  });
  assert.equal(blockedStatus.status, "blocked");
  assert.equal(blockedStatus.code, "NEXO_PREPARED_STEP_NOT_RUNNABLE");
  const unchanged = await opened.owner.loadCurrent();
  assert.equal(unchanged.storeRevision, 2);
  assert.equal(unchanged.snapshot.effectJournal.length, 0);
} finally {
  await fs.rm(preparedAdmissionDir, { recursive: true, force: true });
}

const singleUnresolvedPreparedDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-single-unresolved-prepared-per-mission-"));
try {
  const opened = await openNexoContinuityOwner({
    filePath: path.join(singleUnresolvedPreparedDir, "nexo.json"),
    allowEmptyInitialization: true
  });
  const mission = {
    missionId: "owner-single-unresolved-prepared",
    status: "planned",
    objective: "one unresolved PREPARED blocks new step admissions in this mission",
    steps: [
      { id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] },
      { id: "step-2", action: "repair_agent_needs", target: "alex", status: "planned", dependsOn: [] }
    ]
  };
  assert.equal((await opened.owner.recordMission({ expectedRevision: 0, mission })).status, "committed");
  const first = await opened.owner.recordPrepared({
    expectedRevision: 1,
    operation: {
      idempotencyKey: "owner-single-unresolved-prepared:step-1",
      missionId: mission.missionId, stepId: "step-1",
      action: "repair_agent_state", target: "alex", environmentStateRevision: 0
    }
  });
  assert.equal(first.status, "committed");
  const second = await opened.owner.recordPrepared({
    expectedRevision: 2,
    operation: {
      idempotencyKey: "owner-single-unresolved-prepared:step-2",
      missionId: mission.missionId, stepId: "step-2",
      action: "repair_agent_needs", target: "alex", environmentStateRevision: 0
    }
  });
  assert.equal(second.status, "blocked",
    "a mission reconstructed as blocked by unresolved PREPARED must not admit a second step");
  assert.equal(second.code, "NEXO_PREPARED_MISSION_NOT_RUNNABLE");
  const current = await opened.owner.loadCurrent();
  assert.equal(current.storeRevision, 2);
  assert.equal(current.snapshot.effectJournal.length, 1);
  assert.equal(current.snapshot.effectJournal[0].stepId, "step-1");
} finally {
  await fs.rm(singleUnresolvedPreparedDir, { recursive: true, force: true });
}

const missionStateAdmissionDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-owner-mission-state-admission-"));
try {
  const opened = await openNexoContinuityOwner({
    filePath: path.join(missionStateAdmissionDir, "nexo.json"),
    allowEmptyInitialization: true
  });
  const mission = {
    missionId: "owner-mission-state-admission",
    status: "blocked",
    objective: "mission state admission regression",
    steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] }]
  };
  assert.equal((await opened.owner.recordMission({ expectedRevision: 0, mission })).status, "committed");
  const result = await opened.owner.recordPrepared({
    expectedRevision: 1,
    operation: {
      idempotencyKey: "owner-mission-state-admission:step-1",
      missionId: mission.missionId, stepId: "step-1",
      action: "repair_agent_state", target: "alex", environmentStateRevision: 0
    }
  });
  assert.equal(result.status, "blocked");
  assert.equal(result.code, "NEXO_PREPARED_MISSION_NOT_RUNNABLE");
  const current = await opened.owner.loadCurrent();
  assert.equal(current.storeRevision, 1);
  assert.equal(current.snapshot.effectJournal.length, 0);
} finally {
  await fs.rm(missionStateAdmissionDir, { recursive: true, force: true });
}

console.log("Nexo continuity migration: legacy transfer, prepared-obligation preservation, canonical reopen, corrupt-store fail-closed, explicit empty bootstrap, execution-lineage isolation, durable owner outcome recording, PREPARED admission guard and observed-settlement no-redispatch OK.");

const verifierBootstrapDir = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-continuity-verifier-bootstrap-"));
try {
  const configuredVerifiers = {
    write_file: async operation => ({
      status: "applied",
      idempotencyKey: operation.idempotencyKey,
      action: operation.action,
      target: operation.target,
      observedRevision: 1,
      source: "persisted-test-verifier"
    })
  };
  const configured = await openNexoContinuityOwner({
    filePath: path.join(verifierBootstrapDir, "nexo.json"),
    allowEmptyInitialization: true,
    effectVerifiers: configuredVerifiers
  });
  assert.equal(configured.owner.supportsReconciliation("write_file"), true);
  assert.equal(configured.owner.supportsReconciliation("unknown_action"), false);
  configuredVerifiers.write_file = async () => { throw new Error("external registry mutation"); };
  assert.equal(configured.owner.supportsReconciliation("write_file"), true);
} finally {
  await fs.rm(verifierBootstrapDir, { recursive: true, force: true });
}
