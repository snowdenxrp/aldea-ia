import { OUTCOMES } from "./contracts.mjs";

export const RECONCILIATION_STATES = Object.freeze(["RESOLVED", "UNRESOLVED", "INVALID"]);
function assertPlainRecordShape(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("reconciliation input must be a record");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("reconciliation input must be a plain record");
  }
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key === "symbol") throw new TypeError("reconciliation input must not contain symbol-keyed properties");
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new TypeError("reconciliation input must contain only enumerable data properties");
    }
  }
}

function assertPlainData(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  const isArray = Array.isArray(value);
  const prototype = Object.getPrototypeOf(value);
  if (!isArray && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("reconciliation evidence must contain only arrays and plain objects");
  }
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key === "symbol") {
      throw new TypeError("reconciliation evidence must not contain symbol-keyed properties");
    }
    if (isArray && key === "length") continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new TypeError("reconciliation evidence must contain only enumerable data properties");
    }
    assertPlainData(descriptor.value, seen);
  }
}

export function createReconciliationCase({ boundary, claimId = null } = {}) {
  if (typeof boundary !== "string" || boundary.trim().length === 0) throw new TypeError("boundary is required");
  if (claimId !== null && (typeof claimId !== "string" || claimId.trim().length === 0)) throw new TypeError("claimId is invalid");
  return Object.freeze({ boundary, claimId });
}

export function createReconciler() {
  return Object.freeze({
    reconcile(input = {}) {
      // Validate only the outer envelope descriptors before destructuring;
      // nested case/evidence graphs keep their own INVALID/UNRESOLVED semantics.
      try {
        assertPlainRecordShape(input);
      } catch {
        return Object.freeze({ status: "INVALID", outcome: null, evidence: Object.freeze([]) });
      }
      const { reconciliationCase, evidence = [] } = input;
      try {
        assertPlainData(reconciliationCase);
      } catch {
        return Object.freeze({ status: "INVALID", outcome: null, evidence: Object.freeze([]) });
      }
      if (!reconciliationCase || typeof reconciliationCase !== "object" || Array.isArray(reconciliationCase) ||
          typeof reconciliationCase.boundary !== "string" || reconciliationCase.boundary.trim().length === 0) {
        return Object.freeze({ status: "INVALID", outcome: null, evidence: Object.freeze([]) });
      }
      // Malformed evidence is unresolved, not an exception that escapes the boundary.
      if (!Array.isArray(evidence)) {
        return Object.freeze({ status: "UNRESOLVED", outcome: null, evidence: Object.freeze([]) });
      }
      try {
        assertPlainData(evidence);
      } catch {
        return Object.freeze({ status: "UNRESOLVED", outcome: null, evidence: Object.freeze([]) });
      }
      // Avoid dispatching through caller-controlled array methods.
      for (let index = 0; index < evidence.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(evidence, String(index));
        if (!descriptor || !("value" in descriptor)) {
          return Object.freeze({ status: "UNRESOLVED", outcome: null, evidence: Object.freeze([]) });
        }
        // Validate dense data slots, but never promote caller-supplied evidence:
        // "authoritative: true" is metadata, not authenticated authority. No trusted
        // verifier/fence/provenance port is wired into this reconciler yet.
      }
      return Object.freeze({ status: "UNRESOLVED", outcome: null, evidence: Object.freeze([]) });
    }
  });
}
