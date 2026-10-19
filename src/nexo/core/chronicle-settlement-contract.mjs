/**
 * Shared structural contract for a persisted Chronicle settlement.
 *
 * This proves that the settlement record carries the exact local entry observed
 * by the Chronicle verifier. It is not authentication, causal attribution, or
 * a durability guarantee.
 */
export function isValidNexoChronicleSettlementRecord(entry) {
  const settlement = entry?.settlement;
  const evidence = settlement?.evidence;
  const target = entry?.target;
  const observedAt = settlement?.observedAt;
  const validTimestamp = typeof observedAt === "string" &&
    Number.isFinite(Date.parse(observedAt)) &&
    new Date(observedAt).toISOString() === observedAt;

  return entry?.status === "settled_observed" &&
    entry.action === "chronicle_append" &&
    typeof entry.missionId === "string" && entry.missionId.trim() && !entry.missionId.includes(":") &&
    typeof entry.stepId === "string" && entry.stepId.trim() && !entry.stepId.includes(":") &&
    entry.idempotencyKey === `${entry.missionId}:${entry.stepId}` &&
    target !== null && typeof target === "object" && !Array.isArray(target) &&
    typeof target.content === "string" && target.content.trim() &&
    settlement?.status === "applied" &&
    settlement.source === "nexo-chronicle-store" &&
    Number.isSafeInteger(settlement.observedRevision) &&
    settlement.observedRevision >= 0 &&
    evidence !== null && typeof evidence === "object" && !Array.isArray(evidence) &&
    evidence.kind === "persisted-chronicle-entry" &&
    evidence.operationKey === entry.idempotencyKey &&
    evidence.content === target.content &&
    validTimestamp;
}

/**
 * Validate the terminal outcome metadata against the exact persisted settlement.
 * The fields are structural consistency checks, not authenticated provenance.
 */
export function isValidNexoChronicleOutcomeEvidence(entry, evidence) {
  const settlement = entry?.settlement;
  return isValidNexoChronicleSettlementRecord(entry) &&
    evidence !== null && typeof evidence === "object" && !Array.isArray(evidence) &&
    evidence.verified === true &&
    evidence.kind === "nexo-chronicle-persisted-invariant" &&
    evidence.source === settlement.source &&
    evidence.observedRevision === settlement.observedRevision;
}
