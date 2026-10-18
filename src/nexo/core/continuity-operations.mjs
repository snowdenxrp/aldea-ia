import { isDeepStrictEqual } from "node:util";
import { assertNexoContinuitySnapshot } from "./continuity-snapshot.mjs";

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
  if (existing) return next;
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
    const latest = stepAttempts.find(item =>
      item?.status === "completed" && item?.evidence?.verified === true &&
      typeof item?.evidence?.kind === "string" && item.evidence.kind.trim() &&
      typeof item?.evidence?.source === "string" && item.evidence.source.trim()
    ) ?? [...stepAttempts].reverse().find(Boolean);
    if (!latest) continue;
    step.status = latest.status;
    if (latest.evidence != null) step.result = structuredClone(latest.evidence);
    if (latest.status === "failed") step.failure = latest.evidence ?? null;
    if (latest.status === "blocked") step.blockReason = latest.evidence ?? "blocked";
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
