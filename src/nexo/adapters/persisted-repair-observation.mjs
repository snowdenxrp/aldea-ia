const REPAIR_ACTIONS = new Set([
  "repair_agent_state",
  "repair_agent_needs",
  "repair_resource_state"
]);

function unknown(reason, action = null, target = null, stateRevision = null) {
  return {
    status: "observed",
    outcome: "unknown",
    reason,
    evidence: {
      kind: "persisted-repair-invariant-observation",
      source: "world-state.json",
      action,
      target,
      stateRevision
    }
  };
}

function absent(reason, action, target, stateRevision) {
  return {
    status: "observed",
    outcome: "desired_state_absent",
    reason,
    evidence: {
      kind: "persisted-repair-invariant-observation",
      source: "world-state.json",
      action,
      target,
      stateRevision
    }
  };
}

function present(action, target, stateRevision) {
  return {
    status: "observed",
    outcome: "desired_state_present",
    reason: "repair_invariant_holds_in_persisted_snapshot",
    evidence: {
      kind: "persisted-repair-invariant-observation",
      source: "world-state.json",
      action,
      target,
      stateRevision
    }
  };
}

/**
 * Classify only the persisted desired-state invariant for the three convergent
 * repair actions. Callers must supply a snapshot obtained from loadStateStrict().
 *
 * This is read-only diagnostic evidence, not proof that this operation caused
 * the observed state, not authorization to retry, and not terminal settlement.
 * Unknown schema/life-state/target shapes fail closed.
 */
export function observePersistedRepairInvariant({ snapshot, action, target } = {}) {
  const revision = snapshot?.stateRevision;
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot) ||
      !Number.isSafeInteger(revision) || revision < 0 ||
      !snapshot.world || typeof snapshot.world !== "object" || Array.isArray(snapshot.world) ||
      !Array.isArray(snapshot.agents)) {
    return unknown("PERSISTED_ENVIRONMENT_SNAPSHOT_INVALID", action ?? null, target ?? null, null);
  }
  if (!REPAIR_ACTIONS.has(action) || typeof target !== "string" || !target.trim()) {
    return unknown("REPAIR_OPERATION_CONTEXT_INVALID", action ?? null, target ?? null, revision);
  }

  if (action === "repair_agent_state") {
    const agent = snapshot.agents.find(item => item?.id === target);
    if (!agent) return unknown("REPAIR_TARGET_AGENT_UNKNOWN", action, target, revision);
    if (typeof agent.alive !== "boolean") {
      return unknown("REPAIR_AGENT_ALIVE_STATE_UNKNOWN", action, target, revision);
    }
    if (agent.position != null &&
        (typeof agent.position !== "object" || Array.isArray(agent.position))) {
      return unknown("REPAIR_AGENT_POSITION_SCHEMA_UNKNOWN", action, target, revision);
    }
    const position = agent.position ?? {};
    const normalized = typeof position.x === "number" && Number.isFinite(position.x) &&
      typeof position.z === "number" && Number.isFinite(position.z);
    return normalized
      ? present(action, target, revision)
      : absent("REPAIR_AGENT_COORDINATES_REQUIRE_NORMALIZATION", action, target, revision);
  }

  if (action === "repair_agent_needs") {
    const agent = snapshot.agents.find(item => item?.id === target);
    if (!agent) return unknown("REPAIR_TARGET_AGENT_UNKNOWN", action, target, revision);
    if (agent.needs != null &&
        (typeof agent.needs !== "object" || Array.isArray(agent.needs))) {
      return unknown("REPAIR_AGENT_NEEDS_SCHEMA_UNKNOWN", action, target, revision);
    }
    const needs = agent.needs ?? {};
    const keys = ["hunger", "thirst", "energy", "social", "safety", "health"];
    const normalized = keys.every(key =>
      typeof needs[key] === "number" && Number.isFinite(needs[key]) &&
      needs[key] >= 0 && needs[key] <= 100);
    return normalized
      ? present(action, target, revision)
      : absent("REPAIR_AGENT_NEEDS_REQUIRE_NORMALIZATION", action, target, revision);
  }

  const resources = snapshot.world.resources;
  if (!resources || typeof resources !== "object" || Array.isArray(resources)) {
    return unknown("REPAIR_RESOURCE_COLLECTION_SCHEMA_UNKNOWN", action, target, revision);
  }
  const resource = resources[target];
  if (!resource || typeof resource !== "object" || Array.isArray(resource)) {
    return unknown("REPAIR_TARGET_RESOURCE_UNKNOWN", action, target, revision);
  }
  const normalized = typeof resource.amount === "number" &&
    Number.isFinite(resource.amount) && resource.amount >= 0;
  return normalized
    ? present(action, target, revision)
    : absent("REPAIR_RESOURCE_AMOUNT_REQUIRES_NORMALIZATION", action, target, revision);
}
