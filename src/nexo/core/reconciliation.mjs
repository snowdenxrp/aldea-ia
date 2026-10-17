import { OUTCOMES } from "./contracts.mjs";

export const RECONCILIATION_STATES = Object.freeze(["RESOLVED", "UNRESOLVED", "INVALID"]);
const RESOLVABLE_OUTCOMES = Object.freeze(OUTCOMES.SAFE_COMMIT === "SAFE_COMMIT"
  ? [OUTCOMES.SAFE_COMMIT, OUTCOMES.STALE_CANDIDATE, OUTCOMES.SEMANTIC_CONFLICT, OUTCOMES.AUTHORITY_STOP]
  : []);

export function createReconciliationCase({ boundary, claimId = null } = {}) {
  if (typeof boundary !== "string" || boundary.trim().length === 0) throw new TypeError("boundary is required");
  if (claimId !== null && (typeof claimId !== "string" || claimId.trim().length === 0)) throw new TypeError("claimId is invalid");
  return Object.freeze({ boundary, claimId });
}

export function createReconciler() {
  return Object.freeze({
    reconcile({ reconciliationCase, evidence = [] } = {}) {
      if (!reconciliationCase || !reconciliationCase.boundary) {
        return Object.freeze({ status: "INVALID", outcome: null, evidence: [] });
      }
      if (!Array.isArray(evidence)) throw new TypeError("evidence must be an array");
      const item = evidence.find(x =>
        x &&
        x.authoritative === true &&
        RESOLVABLE_OUTCOMES.includes(x.outcome)
      );
      if (!item) return Object.freeze({ status: "UNRESOLVED", outcome: null, evidence: Object.freeze([]) });
      return Object.freeze({ status: "RESOLVED", outcome: item.outcome, evidence: Object.freeze([item]) });
    }
  });
}
