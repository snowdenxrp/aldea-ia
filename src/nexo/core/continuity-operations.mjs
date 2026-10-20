import { isDeepStrictEqual } from "node:util";
import { assertContractInput } from "./contracts.mjs";
import { assertNexoContinuitySnapshot } from "./continuity-snapshot.mjs";
import { isValidNexoChronicleOutcomeEvidence, isValidNexoChronicleSettlementRecord } from "./chronicle-settlement-contract.mjs";

function operationError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

/**
 * Mission records are durable JSON data. The shared contract shape guard
 * rejects accessors and exotic objects, but intentionally does not establish
 * JSON round-trip safety for primitive values, sparse arrays, or cycles.
 */
function assertMissionPersistableData(value, ancestors = new WeakSet()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("mission data numbers must be finite");
    return;
  }
  if (typeof value !== "object") {
    throw new TypeError("mission data must contain only JSON-compatible values");
  }
  if (ancestors.has(value)) throw new TypeError("mission data must not contain cycles");
  ancestors.add(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
        throw new TypeError("mission data arrays must be dense");
      }
      assertMissionPersistableData(descriptor.value, ancestors);
    }
    for (const key of Reflect.ownKeys(value)) {
      if (key === "length") continue;
      if (typeof key !== "string" || String(Number(key)) !== key ||
          Number(key) < 0 || Number(key) >= value.length) {
        throw new TypeError("mission data arrays must not have extra properties");
      }
    }
  } else {
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== "string") throw new TypeError("mission data must not have symbol keys");
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
        throw new TypeError("mission data must contain only enumerable data properties");
      }
      assertMissionPersistableData(descriptor.value, ancestors);
    }
  }
  ancestors.delete(value);
}

function cloneSnapshot(snapshot) {
  assertNexoContinuitySnapshot(snapshot);
  return structuredClone(snapshot);
}

function missionRecord(mission) {
  try {
    assertContractInput(mission, "Nexo mission");
  } catch {
    throw operationError("NEXO_MISSION_CONTEXT_INVALID");
  }
  if (!mission || typeof mission.missionId !== "string" || !mission.missionId.trim() ||
      mission.missionId.includes(":") || !Array.isArray(mission.steps) ||
      (mission.status != null &&
        (typeof mission.status !== "string" || !mission.status.trim() ||
          !["planned", "blocked", "executing", "needs_replan", "awaiting_verification", "awaiting_dependencies", "completed", "incomplete", "invalid"].includes(mission.status)))) {
    throw operationError("NEXO_MISSION_CONTEXT_INVALID");
  }
  const stepIds = new Set();
  for (const step of mission.steps) {
    if (!step || typeof step !== "object" || Array.isArray(step) ||
        typeof step.id !== "string" || !step.id.trim() || step.id.includes(":") || stepIds.has(step.id) ||
        typeof step.action !== "string" || !step.action.trim() ||
        (step.status != null &&
          (typeof step.status !== "string" || !step.status.trim() ||
            !["planned", "blocked", "executing", "completed", "failed"].includes(step.status)))) {
      throw operationError("NEXO_MISSION_CONTEXT_INVALID");
    }
    stepIds.add(step.id);
  }

  const dependenciesByStep = new Map();
  for (const step of mission.steps) {
    const dependencies = step.dependsOn ?? [];
    if (!Array.isArray(dependencies) ||
        Object.keys(dependencies).filter(key => String(Number(key)) === key && Number(key) >= 0 && Number(key) < dependencies.length).length !== dependencies.length ||
        dependencies.some(id => typeof id !== "string" || !id.trim() ||
          !stepIds.has(id) || id === step.id) ||
        new Set(dependencies).size !== dependencies.length) {
      throw operationError("NEXO_MISSION_CONTEXT_INVALID");
    }
    dependenciesByStep.set(step.id, dependencies);
  }
  const visiting = new Set();
  const visited = new Set();
  const visitDependencyGraph = stepId => {
    if (visiting.has(stepId)) throw operationError("NEXO_MISSION_CONTEXT_INVALID");
    if (visited.has(stepId)) return;
    visiting.add(stepId);
    for (const dependencyId of dependenciesByStep.get(stepId)) visitDependencyGraph(dependencyId);
    visiting.delete(stepId);
    visited.add(stepId);
  };
  for (const stepId of stepIds) visitDependencyGraph(stepId);

  let record;
  try {
    record = {
    missionId: mission.missionId,
    version: mission.version ?? 4,
    status: mission.status ?? "planned",
    objective: mission.objective ?? "awaiting_dependencies",
    parentMissionId: mission.parentMissionId ?? null,
    replanReason: mission.replanReason ?? null,
    uncertainty: mission.uncertainty ?? null,
    evidenceCount: mission.evidenceCount ?? null,
    observedAgentCount: mission.observedAgentCount ?? null,
    admission: mission.admission == null ? null : structuredClone(mission.admission),
    steps: mission.steps.map(step => ({
      id: step.id,
      action: step.action,
      target: step.target ?? null,
      status: step.status ?? "planned",
      dependsOn: structuredClone(step.dependsOn ?? []),
      ...(step.priority !== undefined ? { priority: step.priority } : {}),
      ...(step.reason !== undefined ? { reason: step.reason } : {}),
      ...(step.source !== undefined ? { source: step.source } : {}),
      ...(step.reversible !== undefined ? { reversible: step.reversible } : {}),
      ...(step.requiresEvidence !== undefined ? { requiresEvidence: step.requiresEvidence } : {}),
      ...(step.requiresVerification !== undefined ? { requiresVerification: step.requiresVerification } : {}),
      ...(step.context !== undefined ? { context: structuredClone(step.context) } : {})
    })),
    at: mission.generatedAt ?? new Date().toISOString()
    };
    assertMissionPersistableData(record);
  } catch {
    throw operationError("NEXO_MISSION_CONTEXT_INVALID");
  }
  return record;
}

/** Add a mission to the Nexo-only snapshot without importing learning analytics. */
export function recordNexoMissionInSnapshot(snapshot, mission) {
  const next = cloneSnapshot(snapshot);
  const record = missionRecord(mission);
  const existing = next.missions.find(item => item?.missionId === record.missionId);
  if (existing) {
    if (!isDeepStrictEqual(existing, record)) throw operationError("NEXO_MISSION_ID_ALREADY_BOUND");
    return next;
  }
  next.missions.push(record);
  assertNexoContinuitySnapshot(next);
  return next;
}

/** Record an adapter result for lineage only; it does not settle an effect journal. */
export function recordNexoExecutionInSnapshot(snapshot, { idempotencyKey, missionId, stepId, action, target = null, result } = {}) {
  const next = cloneSnapshot(snapshot);
  if (!idempotencyKey || !missionId || !stepId || !action || !result) {
    throw operationError("NEXO_EXECUTION_CONTEXT_INVALID");
  }
  const existing = next.executions.find(item => item?.idempotencyKey === idempotencyKey);
  if (existing) {
    const sameIdentity = existing.missionId === missionId &&
      existing.stepId === stepId &&
      existing.action === action &&
      isDeepStrictEqual(existing.target ?? null, target ?? null);
    if (!sameIdentity) throw operationError("NEXO_EXECUTION_IDENTITY_MISMATCH");
    // Preserve the first recorded result for this identity; a replay is not a new execution.
    return next;
  }
  next.executions.push({ idempotencyKey, missionId, stepId, action, target: structuredClone(target), result: structuredClone(result), at: new Date().toISOString() });
  assertNexoContinuitySnapshot(next);
  return next;
}

/** Record a verified outcome without allowing replay/late result to overwrite an attempt. */
export function recordNexoOutcomeInSnapshot(snapshot, {
  missionId, stepId, action, target = null, status, evidence = null,
  doNotRepeat = false, parentMissionId = null, replanReason = null
} = {}) {
  const next = cloneSnapshot(snapshot);
  if (!missionId || !stepId || !action || !["completed", "failed", "blocked"].includes(status)) {
    throw operationError("NEXO_OUTCOME_CONTEXT_INVALID");
  }
  if (status === "completed" && !(evidence?.verified === true &&
      typeof evidence?.kind === "string" && evidence.kind.trim() &&
      typeof evidence?.source === "string" && evidence.source.trim())) {
    throw operationError("NEXO_COMPLETION_EVIDENCE_UNVERIFIED");
  }
  // A non-empty source is a required label, not authentication of that source.
  // This continuity layer cannot independently validate provenance.
  if (next.attempts.some(item => item?.missionId === missionId && item?.stepId === stepId)) return next;
  const at = new Date().toISOString();
  next.attempts.push({
    missionId, stepId, action, target: structuredClone(target), status,
    evidence: evidence == null ? null : structuredClone(evidence),
    parentMissionId: parentMissionId ?? null,
    replanReason: replanReason ?? null,
    at
  });
  if (doNotRepeat) next.doNotRepeat.push({ action, target: structuredClone(target), reason: evidence ?? "previous attempt marked non-repeatable", at });
  assertNexoContinuitySnapshot(next);
  return next;
}

/** Reconstruct only from Nexo operational continuity, never learning runs/patterns. */
export function reconstructNexoMissionFromSnapshot(snapshot, missionId) {
  const source = cloneSnapshot(snapshot);
  const plan = source.missions.find(item => item?.missionId === missionId);
  if (!plan) return null;
  const mission = {
    version: plan.version ?? 4,
    missionId: plan.missionId,
    parentMissionId: plan.parentMissionId ?? null,
    replanReason: plan.replanReason ?? null,
    objective: plan.objective ?? "awaiting_verification",
    status: plan.status ?? "planned",
    uncertainty: plan.uncertainty ?? null,
    evidenceCount: plan.evidenceCount ?? null,
    observedAgentCount: plan.observedAgentCount ?? null,
    admission: plan.admission == null ? null : structuredClone(plan.admission),
    steps: structuredClone(Array.isArray(plan.steps) ? plan.steps : []),
    operationalSignals: {
      attempts: source.attempts.length,
      doNotRepeat: source.doNotRepeat.length,
      executions: source.executions.length
    },
    generatedAt: plan.at
  };
  // A recognized journal state still needs a canonical owner and step binding.
  // Legacy snapshots remain readable, but an orphan or mismatched effect record
  // must not disappear from reconstruction and make a step runnable.
  const recognizedEffectStates = ["prepared", "settled_observed", "reconciled_observed"];
  const unownedEffectEntry = source.effectJournal.some(entry =>
    recognizedEffectStates.includes(entry?.status) &&
    (typeof entry?.missionId !== "string" || !entry.missionId.trim() ||
      !source.missions.some(candidate => candidate?.missionId === entry.missionId))
  );
  const unboundMissionEffectEntry = source.effectJournal.some(entry => {
    if (entry?.missionId !== missionId || !recognizedEffectStates.includes(entry?.status)) return false;
    const boundStep = mission.steps.find(candidate => candidate?.id === entry?.stepId);
    return !boundStep || boundStep.action !== entry.action ||
      !isDeepStrictEqual(boundStep.target ?? null, entry.target ?? null);
  });
  if (unownedEffectEntry || unboundMissionEffectEntry) {
    for (const step of mission.steps) {
      step.status = "blocked";
      step.blockReason = {
        code: "NEXO_EFFECT_JOURNAL_IDENTITY_UNKNOWN",
        next: "reconcile_effect_journal_without_redispatch"
      };
    }
    mission.status = "blocked";
    mission.uncertainty = "effect_journal_identity_unknown";
    return mission;
  }

  const attempts = source.attempts.filter(item => item?.missionId === missionId);
  const planClaimedCompletedStepIds = new Set(
    mission.steps.filter(item => item?.status === "completed").map(item => item.id)
  );
  for (const step of mission.steps) {
    const stepAttempts = attempts.filter(item => item?.stepId === step.id);
    const matchesStepIdentity = item => item?.action === step.action &&
      isDeepStrictEqual(item?.target ?? null, step.target ?? null);
    const mismatchedCompletedAttempt = stepAttempts.find(item =>
      item?.status === "completed" && !matchesStepIdentity(item)
    );
    if (mismatchedCompletedAttempt) {
      step.status = "blocked";
      step.blockReason = {
        code: "NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH",
        next: "verify_mission_goal_without_redispatch"
      };
      mission.status = "blocked";
      mission.uncertainty = "outcome_operation_context_mismatch";
      return mission;
    }
    const stepEffects = source.effectJournal.filter(item =>
      item?.missionId === missionId && item?.stepId === step.id
    );
    const validChronicleSettlement = step.action === "chronicle_append" &&
      stepEffects.length === 1 &&
      stepEffects[0]?.action === step.action &&
      isDeepStrictEqual(stepEffects[0]?.target ?? null, step.target ?? null) &&
      isValidNexoChronicleSettlementRecord(stepEffects[0]);
    const completionContractAvailable = step.action === "local_analysis" ||
      (step.action === "chronicle_append" && validChronicleSettlement);
    const verifiedCompletions = stepAttempts.filter(item =>
      item?.status === "completed" && matchesStepIdentity(item) &&
      completionContractAvailable &&
      (step.action !== "chronicle_append" ||
        isValidNexoChronicleOutcomeEvidence(stepEffects[0], item.evidence)) &&
      item?.evidence?.verified === true &&
      typeof item?.evidence?.kind === "string" && item.evidence.kind.trim() &&
      typeof item?.evidence?.source === "string" && item.evidence.source.trim()
    );
    const conflictingVerifiedCompletions = verifiedCompletions.some((item, index) =>
      verifiedCompletions.slice(0, index).some(previous =>
        !isDeepStrictEqual(previous.evidence, item.evidence)
      )
    );
    if (conflictingVerifiedCompletions) {
      step.status = "blocked";
      step.blockReason = {
        code: "NEXO_OUTCOME_EVIDENCE_CONFLICT",
        next: "reconcile_outcome_evidence_without_redispatch"
      };
      mission.status = "blocked";
      mission.uncertainty = "outcome_evidence_conflict";
      return mission;
    }
    const verifiedCompletion = verifiedCompletions[0];
    if (verifiedCompletion) {
      step.status = "completed";
      step.result = structuredClone(verifiedCompletion.evidence);
      continue;
    }

    if (step.action === "chronicle_append") {
      const hasChronicleSettlement = stepEffects.some(item =>
        item?.action === "chronicle_append" && item?.status === "settled_observed"
      );
      const hasCompletedClaim = stepAttempts.some(item => item?.status === "completed") ||
        planClaimedCompletedStepIds.has(step.id);
      const mismatchedCompletedClaim = validChronicleSettlement &&
        stepAttempts.some(item => item?.status === "completed" && !matchesStepIdentity(item));
      const hasDetachedOutcomeEvidence = validChronicleSettlement && stepAttempts.some(item =>
        item?.status === "completed" && matchesStepIdentity(item) &&
        !isValidNexoChronicleOutcomeEvidence(stepEffects[0], item.evidence)
      );
      if (hasChronicleSettlement || hasCompletedClaim) {
        step.status = "blocked";
        step.blockReason = {
          code: mismatchedCompletedClaim
            ? "NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH"
            : hasDetachedOutcomeEvidence
              ? "NEXO_CHRONICLE_OUTCOME_EVIDENCE_MISMATCH"
              : validChronicleSettlement
                ? "NEXO_CHRONICLE_OUTCOME_REPLAY_REQUIRED"
                : "NEXO_CHRONICLE_SETTLEMENT_REQUIRED",
          idempotencyKey: `${missionId}:${step.id}`,
          next: mismatchedCompletedClaim || hasDetachedOutcomeEvidence
            ? "verify_chronicle_outcome_without_redispatch"
            : validChronicleSettlement
              ? "recover_terminal_outcome_without_redispatch"
              : "verify_chronicle_settlement_without_redispatch"
        };
        continue;
      }
    }

    // A completion-shaped attempt without exact operation binding and evidence
    // is not proof. Keep the step blocked rather than reconstructing it as
    // planned, which could make a possibly-applied operation executable again.
    const invalidCompletion = stepAttempts.find(item => item?.status === "completed");
    if (invalidCompletion) {
      step.status = "blocked";
      const invalidEvidence = invalidCompletion?.evidence?.verified !== true ||
        typeof invalidCompletion?.evidence?.kind !== "string" || !invalidCompletion.evidence.kind.trim() ||
        typeof invalidCompletion?.evidence?.source !== "string" || !invalidCompletion.evidence.source.trim();
      step.blockReason = {
        code: !matchesStepIdentity(invalidCompletion)
          ? "NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH"
          : invalidEvidence
            ? "NEXO_COMPLETION_EVIDENCE_UNVERIFIED"
            : step.action !== "local_analysis" && step.action !== "chronicle_append"
              ? "NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED"
              : "NEXO_COMPLETION_EVIDENCE_UNVERIFIED",
        next: "verify_mission_goal_without_redispatch"
      };
      continue;
    }

    if (planClaimedCompletedStepIds.has(step.id)) {
      step.status = "blocked";
      step.blockReason = {
        code: step.action === "local_analysis"
          ? "NEXO_COMPLETION_EVIDENCE_UNVERIFIED"
          : "NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED",
        next: "verify_mission_goal_without_redispatch"
      };
      continue;
    }

    const latest = [...stepAttempts].reverse().find(item => {
      if (!["failed", "blocked"].includes(item?.status)) return false;
      const hasIdentity = typeof item?.action === "string" || Object.hasOwn(item, "target");
      return !hasIdentity || matchesStepIdentity(item);
    });
    if (!latest) continue;
    step.status = latest.status;
    if (latest.evidence != null) step.result = structuredClone(latest.evidence);
    if (latest.status === "failed") step.failure = latest.evidence ?? null;
    if (latest.status === "blocked") step.blockReason = latest.evidence ?? "blocked";
  }
  // An unresolved PREPARED entry dominates any plan-only or stale attempt view.
  // Reconstruction must never make a possibly-dispatched operation look executable.
  const unresolvedPrepared = source.effectJournal.filter(entry =>
    entry?.missionId === missionId && entry?.status === "prepared"
  );
  for (const entry of unresolvedPrepared) {
    const step = mission.steps.find(candidate => candidate.id === entry.stepId);
    if (!step) continue; // Snapshot validation should prevent this; fail closed below if encountered.
    step.status = "blocked";
    step.blockReason = {
      code: "NEXO_EFFECT_RECONCILIATION_REQUIRED",
      idempotencyKey: entry.idempotencyKey,
      uncertainty: "effect_may_or_may_not_have_occurred"
    };
  }
  const orphanPrepared = unresolvedPrepared.some(entry =>
    !mission.steps.some(step => step.id === entry.stepId)
  );
  if (orphanPrepared || unresolvedPrepared.length > 0) {
    // PREPARED uncertainty takes precedence over ordinary failure/replan status:
    // a successor mission must not bypass an effect that may already have occurred.
    mission.status = "blocked";
    mission.objective = "reconcile_prepared_effect";
    mission.uncertainty = "present";
    return mission;
  }

  // A repair settled by observing its desired invariant is not causal proof of
  // completion. Keep its step non-executable until a separate mission verifier
  // resolves the goal; never reconstruct it as planned and redispatch it.
  const observedSettlements = source.effectJournal.filter(entry =>
    entry?.missionId === missionId &&
    entry?.status === "settled_observed" &&
    // Chronicle append has an operation-specific durable invariant and a
    // terminal outcome contract. Do not misclassify it as a repair whose
    // desired state was merely observed; other actions remain conservative.
    entry?.action !== "chronicle_append"
  );
  if (observedSettlements.length > 0) {
    for (const entry of observedSettlements) {
      const step = mission.steps.find(candidate => candidate.id === entry.stepId);
      if (!step) continue;
      step.status = "blocked";
      step.blockReason = {
        code: "NEXO_REPAIR_SETTLED_BY_OBSERVATION",
        idempotencyKey: entry.idempotencyKey,
        causalAttribution: "not_claimed",
        next: "verify_mission_goal_without_redispatch"
      };
    }
    mission.status = "blocked";
    mission.objective = "verify_observed_repair_goal";
    mission.uncertainty = "desired_state_observed_causality_not_claimed";
    return mission;
  }

  // Generic reconciliation observations are intentionally distinct from
  // repair settlement records. They keep the operation non-executable until a
  // separate goal/authorization decision; an observation never authorizes retry.
  const genericObservations = source.effectJournal.filter(entry =>
    entry?.missionId === missionId && entry?.status === "reconciled_observed"
  );
  if (genericObservations.length > 0) {
    for (const entry of genericObservations) {
      const step = mission.steps.find(candidate => candidate.id === entry.stepId);
      if (!step) continue;
      step.status = "blocked";
      step.blockReason = {
        code: "NEXO_EFFECT_RECONCILIATION_OBSERVED",
        idempotencyKey: entry.idempotencyKey,
        observation: entry.reconciliation?.status ?? "unknown",
        causalAttribution: "not_established",
        next: "verify_mission_goal_without_redispatch"
      };
    }
    mission.status = "blocked";
    mission.objective = "verify_reconciled_effect";
    mission.uncertainty = "effect_observed_causality_not_established";
    return mission;
  }

  // Unknown persisted effect-journal states cannot be ignored: they may
  // represent an effect whose outcome is not understood by this reader.
  // Fail closed without rejecting the whole legacy snapshot or inventing a new
  // execution state; a blocked reconstructed mission is not runnable.
  const unknownEffectEntries = source.effectJournal.filter(entry =>
    !["prepared", "settled_observed", "reconciled_observed"].includes(entry?.status)
  );
  if (unknownEffectEntries.length > 0) {
    const relevantUnknownEntries = unknownEffectEntries.filter(entry =>
      entry?.missionId === missionId ||
      typeof entry?.missionId !== "string" ||
      !entry.missionId.trim() ||
      !source.missions.some(plan => plan?.missionId === entry.missionId)
    );
    if (relevantUnknownEntries.length > 0) {
      for (const step of mission.steps) {
        step.status = "blocked";
        step.blockReason = {
          code: "NEXO_EFFECT_JOURNAL_STATUS_UNKNOWN",
          next: "reconcile_effect_journal_without_redispatch"
        };
      }
      mission.status = "blocked";
      mission.uncertainty = "effect_journal_status_unknown";
      return mission;
    }
  }

  const failed = mission.steps.some(step => step.status === "failed");
  const blocked = mission.steps.some(step => step.status === "blocked");
  const unresolved = mission.steps.some(step => !["completed", "failed", "blocked"].includes(step.status));
  if (failed) { mission.status = "needs_replan"; mission.objective = "replan_after_failure"; }
  else if (blocked) { mission.status = "blocked"; mission.objective = "replan_from_constraints"; }
  else if (unresolved) {
    const executable = mission.steps.find(step =>
      step.status === "planned" &&
      (step.dependsOn ?? []).every(id => mission.steps.find(dep => dep.id === id)?.status === "completed")
    );
    mission.status = executable ? "planned" : "awaiting_dependencies";
    mission.objective = executable?.action ?? "awaiting_dependencies";
  } else {
    mission.status = "awaiting_verification";
    mission.objective = "verify_mission_outcome";
  }
  return mission;
}
