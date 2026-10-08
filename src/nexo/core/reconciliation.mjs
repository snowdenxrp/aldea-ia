export const RECONCILIATION_STATES = Object.freeze(["RESOLVED", "UNRESOLVED", "INVALID"]);

export function createReconciliationCase({ boundary, claimId = null } = {}) {
  if (typeof boundary !== "string" || boundary.length === 0) throw new TypeError("boundary is required");
  if (claimId !== null && (typeof claimId !== "string" || claimId.length === 0)) throw new TypeError("claimId is invalid");
  return Object.freeze({ boundary, claimId });
}

export function createReconciler() {
  return Object.freeze({
    reconcile({ reconciliationCase, evidence = [] } = {}) {
      if (!reconciliationCase || !reconciliationCase.boundary) {
        return Object.freeze({ status: "INVALID", outcome: null, evidence: [] });
      }
      if (!Array.isArray(evidence)) throw new TypeError("evidence must be an array");
      const item = evidence.find(x => x && x.authoritative === true && typeof x.outcome === "string");
      if (!item) return Object.freeze({ status: "UNRESOLVED", outcome: null, evidence: Object.freeze([]) });
      return Object.freeze({ status: "RESOLVED", outcome: item.outcome, evidence: Object.freeze([item]) });
    }
  });
}
