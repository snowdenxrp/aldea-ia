import { OUTCOMES } from "./contracts.mjs";

export const RECONCILIATION_STATES = Object.freeze(["RESOLVED", "UNRESOLVED", "INVALID"]);
const RESOLVABLE_OUTCOMES = Object.freeze([
  OUTCOMES.SAFE_COMMIT,
  OUTCOMES.STALE_CANDIDATE,
  OUTCOMES.SEMANTIC_CONFLICT,
  OUTCOMES.AUTHORITY_STOP
]);

function assertPlainData(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("reconciliation evidence must contain only arrays and plain objects");
  }
  for (const child of Object.values(value)) assertPlainData(child, seen);
}

function detachedImmutable(value) {
  const clone = structuredClone(value);
  assertPlainData(clone);
  function freeze(item, seen = new WeakSet()) {
    if (item === null || typeof item !== "object" || seen.has(item)) return item;
    seen.add(item);
    for (const child of Object.values(item)) freeze(child, seen);
    return Object.freeze(item);
  }
  return freeze(clone);
}

export function createReconciliationCase({ boundary, claimId = null } = {}) {
  if (typeof boundary !== "string" || boundary.trim().length === 0) throw new TypeError("boundary is required");
  if (claimId !== null && (typeof claimId !== "string" || claimId.trim().length === 0)) throw new TypeError("claimId is invalid");
  return Object.freeze({ boundary, claimId });
}

export function createReconciler() {
  return Object.freeze({
    reconcile({ reconciliationCase, evidence = [] } = {}) {
      if (!reconciliationCase || typeof reconciliationCase !== "object" || Array.isArray(reconciliationCase) ||
          typeof reconciliationCase.boundary !== "string" || reconciliationCase.boundary.trim().length === 0) {
        return Object.freeze({ status: "INVALID", outcome: null, evidence: Object.freeze([]) });
      }
      if (!Array.isArray(evidence)) throw new TypeError("evidence must be an array");
      const item = evidence.find(x =>
        x && typeof x === "object" && !Array.isArray(x) &&
        x.authoritative === true &&
        RESOLVABLE_OUTCOMES.includes(x.outcome)
      );
      if (!item) return Object.freeze({ status: "UNRESOLVED", outcome: null, evidence: Object.freeze([]) });
      try {
        return Object.freeze({
          status: "RESOLVED",
          outcome: item.outcome,
          evidence: Object.freeze([detachedImmutable(item)])
        });
      } catch {
        return Object.freeze({ status: "UNRESOLVED", outcome: null, evidence: Object.freeze([]) });
      }
    }
  });
}
