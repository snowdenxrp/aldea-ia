import { isDeepStrictEqual } from "node:util";
import { assertNexoContinuitySnapshot } from "./continuity-snapshot.mjs";
import { isValidNexoChronicleSettlementRecord } from "./chronicle-settlement-contract.mjs";

function operationError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function cloneSnapshot(snapshot) {
  assertNexoContinuitySnapshot(snapshot);
  return structuredClone(snapshot);
}

function missionRecord(mission) {
  if (!mission || typeof mission.missionId !== "string" || !mission.missionId.trim() || !Array.isArray(mission.steps)) {
    throw operationError("NEXO_MISSION_CONTEXT_INVALID");
  }
  return {
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
  const attempts = source.attempts.filter(item => item?.missionId === missionId);
  for (const step of mission.steps) {
    const stepAttempts = attempts.filter(item => item?.stepId === step.id);
    const matchesStepIdentity = item => item?.action === step.action &&
      isDeepStrictEqual(item?.target ?? null, step.target ?? null);
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
    const verifiedCompletion = stepAttempts.find(item =>
      item?.status === "completed" && matchesStepIdentity(item) &&
      completionContractAvailable &&
      item?.evidence?.verified === true &&
      typeof item?.evidence?.kind === "string" && item.evidence.kind.trim() &&
      typeof item?.evidence?.source === "string" && item.evidence.source.trim()
    );
    if (verifiedCompletion) {
      step.status = "completed";
      step.result = structuredClone(verifiedCompletion.evidence);
      continue;
    }

    if (step.action === "chronicle_append") {
      const hasChronicleSettlement = stepEffects.some(item =>
        item?.action === "chronicle_append" && item?.status === "settled_observed"
      );
      const hasCompletedClaim = stepAttempts.some(item => item?.status === "completed");
      if (hasChronicleSettlement || hasCompletedClaim) {
        step.status = "blocked";
        step.blockReason = {
          code: validChronicleSettlement
            ? "NEXO_CHRONICLE_OUTCOME_REPLAY_REQUIRED"
            : "NEXO_CHRONICLE_SETTLEMENT_REQUIRED",
          idempotencyKey: `${missionId}:${step.id}`,
          next: validChronicleSettlement
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
      step.blockReason = {
        code: !matchesStepIdentity(invalidCompletion)
          ? "NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH"
          : step.action !== "local_analysis" && step.action !== "chronicle_append"
            ? "NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED"
            : "NEXO_COMPLETION_EVIDENCE_UNVERIFIED",
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
